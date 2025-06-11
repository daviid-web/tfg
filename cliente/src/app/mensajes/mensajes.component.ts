import { Component, OnInit, OnDestroy, NgZone, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { catchError, takeUntil } from 'rxjs/operators'; // <-- ¡Aquí está 'takeUntil' importado!
import { throwError, Subject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';

// Interfaz para definir la estructura de un mensaje
interface Mensaje {
  id: number;
  emisor_id: number;
  receptor_id: number;
  anuncio_id: number;
  contenido: string;
  fecha_envio?: string; // Hacemos opcional para mayor flexibilidad
  createdAt?: string; // Columna que Sequelize añade automáticamente
  anuncio?: { id: number; titulo: string; imagen_principal?: string };
  emisor?: { id: number; nombre: string; foto: string };
  receptor?: { id: number; nombre: string; foto: string };
}

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NavComponent, FooterComponent],
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.css']
})
export class MensajesComponent implements OnInit, OnDestroy {
  usuarioId: number = 0;
  conversaciones: Mensaje[] = [];
  mensajes: Mensaje[] = [];
  mensaje: string = '';
  receptorId: number = 0;
  anuncioId: number = 0;
  conversationSelected: boolean = false;

  private socket!: Socket;
  // Asegúrate de que esta IP y puerto sean correctos y accesibles
  private readonly socketUrl = 'http://192.168.2.2:3000';

  @ViewChild('messageList') messageListRef!: ElementRef;

  private destroy$ = new Subject<void>(); // Para desuscribirse de observables

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private route: ActivatedRoute,
    private router: Router // Inyecta Router para manipular queryParams
  ) {}

  ngOnInit(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario && usuario.id) {
      this.usuarioId = usuario.id;
      this.inicializarSocket();

      // Carga las conversaciones primero. Solo cuando estén cargadas,
      // procesa los queryParams. Esto es CRUCIAL para asegurar que 'this.conversaciones' esté poblado.
      this.cargarConversaciones().subscribe({
        next: (data) => {
          this.conversaciones = data; // Asigna las conversaciones cargadas
          this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
            const usuarioDestino = +params['usuarioDestino']; // El '+' convierte a número
            const anuncioIdParam = +params['anuncioId'];

            // Limpia los queryParams inmediatamente después de leerlos
            // Esto evita que al recargar la página, se intente iniciar la misma conversación de nuevo
            this.router.navigate([], {
              queryParams: { usuarioDestino: null, anuncioId: null },
              queryParamsHandling: 'merge', // Mantiene otros queryParams si los hubiera
              replaceUrl: true // Reemplaza la URL actual en el historial
            });

            if (usuarioDestino && anuncioIdParam) {
              // Asegúrate de que el usuario logueado no sea el destino (no chatear consigo mismo)
              if (usuarioDestino !== this.usuarioId) {
                this.iniciarYCargarConversacionAutomatica(usuarioDestino, anuncioIdParam);
              } else {
                console.warn('Intento de iniciar conversación con uno mismo detectado y bloqueado.');
              }
            }
          });
        },
        error: (err) => {
          console.error('Error inicial al cargar conversaciones:', err);
          alert('No se pudieron cargar las conversaciones al inicio. Por favor, recarga la página.');
        }
      });

    } else {
      console.warn('Usuario no logueado. No se pueden cargar mensajes. Redirigiendo a login.');
      this.router.navigate(['/login']); // Redirige al login si no hay usuario
    }
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.destroy$.next(); // Emite para desuscribir todos los observables takeUntil
    this.destroy$.complete(); // Completa el Subject
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  inicializarSocket(): void {
    this.socket = io(this.socketUrl);

    this.socket.on('mensajeRecibido', (mensaje: Mensaje) => {
      this.zone.run(() => {
        // Ignora el mensaje si lo enviaste tú mismo (ya lo añadiste localmente)
        if (mensaje.emisor_id === this.usuarioId) {
            return;
        }

        // Si el mensaje pertenece a la conversación actual
        const esDeEstaConversacion =
          mensaje.anuncio_id === this.anuncioId &&
          (
            (mensaje.emisor_id === this.usuarioId && mensaje.receptor_id === this.receptorId) ||
            (mensaje.receptor_id === this.usuarioId && mensaje.emisor_id === this.receptorId)
          );

        if (esDeEstaConversacion) {
          this.mensajes.push(mensaje);
          this.scrollToBottom();
        }
        // Siempre recarga las conversaciones para actualizar el orden y el "último mensaje"
        this.cargarConversaciones().subscribe(
          data => this.conversaciones = data,
          error => console.error('Error al recargar conversaciones por mensaje recibido:', error)
        );
      });
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      alert('Problema de conexión con el servidor de chat. Por favor, inténtalo de nuevo.');
    });
  }

  // Carga la lista de conversaciones de un usuario desde el backend
  // Ahora devuelve un Observable para que ngOnInit pueda esperar su finalización
  cargarConversaciones(): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.socketUrl}/api/usuarios/${this.usuarioId}/conversaciones`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error cargando conversaciones:', error);
        return throwError(() => new Error('Error al cargar conversaciones'));
      }),
      takeUntil(this.destroy$) // Desuscribe al destruir el componente
    );
  }

  // Función para iniciar o cargar automáticamente una conversación al llegar con queryParams
  iniciarYCargarConversacionAutomatica(receptorIdParam: number, anuncioIdParam: number): void {
    // Primero, intenta buscar la conversación en la lista ya cargada de `this.conversaciones`
    const conversacionExistente = this.conversaciones.find(c =>
      c.anuncio_id === anuncioIdParam &&
      ((c.emisor_id === this.usuarioId && c.receptor_id === receptorIdParam) ||
       (c.receptor_id === this.usuarioId && c.emisor_id === receptorIdParam))
    );

    if (conversacionExistente) {
      console.log('Conversación existente encontrada localmente, seleccionando...');
      this.seleccionarConversacion(conversacionExistente);
    } else {
      console.log('Conversación no encontrada localmente, cargando directamente desde el servidor...');

      this.receptorId = receptorIdParam;
      this.anuncioId = anuncioIdParam;
      this.conversationSelected = true;

      // Si no existe localmente, hacemos una petición directa para obtener el historial de mensajes
      this.http.get<Mensaje[]>(
        `${this.socketUrl}/api/mensajes/conversacion?usuarioId=${this.usuarioId}&receptorId=${this.receptorId}&anuncioId=${this.anuncioId}`,
        { headers: this.getAuthHeaders() }
      ).pipe(
        catchError(error => {
          console.error('Error cargando mensajes de la conversación automática:', error);
          alert('No se pudo cargar la conversación. Por favor, inténtalo de nuevo.');
          return throwError(() => new Error('Error al cargar mensajes automáticos'));
        }),
        takeUntil(this.destroy$)
      ).subscribe((data) => {
        this.mensajes = data;
        this.scrollToBottom();

        const sala = `${Math.min(this.usuarioId, this.receptorId)}-${Math.max(this.usuarioId, this.receptorId)}-${this.anuncioId}`;
        this.socket.emit('unirseSala', sala);
        console.log(`Unido a la sala automáticamente: ${sala}`);

        // Después de cargar la conversación, recarga la lista lateral para que la nueva conversación aparezca
        this.cargarConversaciones().subscribe(
          conversacionesActualizadas => {
            this.conversaciones = conversacionesActualizadas;
            // Opcional: Asegúrate de que la conversación actual en la UI sea la correcta después de recargar
            const nuevaConversacionEncontrada = this.conversaciones.find(c =>
              c.anuncio_id === this.anuncioId &&
              ((c.emisor_id === this.usuarioId && c.receptor_id === this.receptorId) ||
               (c.receptor_id === this.usuarioId && c.emisor_id === this.receptorId))
            );
            if (nuevaConversacionEncontrada) {
              this.seleccionarConversacion(nuevaConversacionEncontrada);
            }
          },
          error => console.error('Error al recargar conversaciones después de auto-selección:', error)
        );
      });
    }
  }

  seleccionarConversacion(conversacion: Mensaje): void {
    this.receptorId = conversacion.emisor_id === this.usuarioId ? conversacion.receptor_id : conversacion.emisor_id;
    this.anuncioId = conversacion.anuncio_id;
    this.conversationSelected = true;

    this.http.get<Mensaje[]>(
      `${this.socketUrl}/api/mensajes/conversacion?usuarioId=${this.usuarioId}&receptorId=${this.receptorId}&anuncioId=${this.anuncioId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error cargando mensajes de la conversación:', error);
        alert('No se pudieron cargar los mensajes de esta conversación.');
        return throwError(() => new Error('Error al cargar mensajes'));
      }),
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.mensajes = data;
      this.scrollToBottom();
    });

    const sala = `${Math.min(this.usuarioId, this.receptorId)}-${Math.max(this.usuarioId, this.receptorId)}-${this.anuncioId}`;
    this.socket.emit('unirseSala', sala);

    console.log(`Conversación seleccionada: Con usuario ${this.receptorId} sobre anuncio ${this.anuncioId}. Sala: ${sala}`);
  }

  enviarMensaje(): void {
    if (!this.mensaje.trim() || !this.receptorId || !this.anuncioId) {
      console.warn('Mensaje vacío o conversación no seleccionada.');
      alert('Por favor, escribe un mensaje y selecciona una conversación para enviar.');
      return;
    }

    const contenidoMensaje = this.mensaje.trim();
    const nuevoMensajeLocal: Mensaje = {
      id: -1, // ID temporal para el frontend
      emisor_id: this.usuarioId,
      receptor_id: this.receptorId,
      anuncio_id: this.anuncioId,
      contenido: contenidoMensaje,
      fecha_envio: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      emisor: { id: this.usuarioId, nombre: 'Tú', foto: 'assets/img/default-user.png' }
    };

    this.mensajes.push(nuevoMensajeLocal);
    this.scrollToBottom();

    const nuevoMensajeBackend = {
      emisor_id: this.usuarioId,
      receptor_id: this.receptorId,
      anuncio_id: this.anuncioId,
      contenido: contenidoMensaje
    };

    this.http.post<Mensaje>(`${this.socketUrl}/api/mensajes`, nuevoMensajeBackend, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error enviando mensaje:', error);
        this.mensajes = this.mensajes.filter(msg => msg.id !== -1); // Si falla, quita el mensaje local
        alert('No se pudo enviar el mensaje. Inténtalo de nuevo.');
        return throwError(() => new Error('Error al enviar mensaje'));
      }),
      takeUntil(this.destroy$)
    ).subscribe((msg) => {
      this.mensaje = ''; // Limpia el campo de entrada
      // Recarga conversaciones para que la nueva aparezca o se actualice el último mensaje
      this.cargarConversaciones().subscribe(
        data => this.conversaciones = data,
        error => console.error('Error al recargar conversaciones después de enviar mensaje:', error)
      );
    });
  }

  // Helper para obtener la información del "otro" usuario (nombre y foto)
  getOtroUsuario(m: Mensaje): { id: number; nombre: string; foto: string } {
    const targetId = m.emisor_id === this.usuarioId ? m.receptor_id : m.emisor_id;
    const isLocalUser = m.emisor_id === this.usuarioId;

    // Buscar en la lista de conversaciones para obtener el nombre y foto
    const convData = this.conversaciones.find(conv =>
        (conv.emisor_id === this.usuarioId && conv.receptor_id === targetId && conv.anuncio_id === m.anuncio_id) ||
        (conv.receptor_id === this.usuarioId && conv.emisor_id === targetId && conv.anuncio_id === m.anuncio_id)
    );

    if (convData) {
        return isLocalUser
            ? convData.receptor || { id: targetId, nombre: 'Usuario Desconocido', foto: 'assets/img/default-user.png' }
            : convData.emisor || { id: targetId, nombre: 'Usuario Desconocido', foto: 'assets/img/default-user.png' };
    }

    // Si no está en la lista de conversaciones (ej. primer mensaje de una nueva),
    // usa la información directamente del objeto mensaje si está disponible
    if (isLocalUser) {
        return m.receptor || { id: targetId, nombre: 'Usuario Desconocido (msg rec)', foto: 'assets/img/default-user.png' };
    } else {
        return m.emisor || { id: targetId, nombre: 'Usuario Desconocido (msg emi)', foto: 'assets/img/default-user.png' };
    }
  }

  formatearFecha(fechaString: string | undefined): string {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/img/default-user.png';
  }

  scrollToBottom(): void {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        if (this.messageListRef && this.messageListRef.nativeElement) {
          this.messageListRef.nativeElement.scrollTop = this.messageListRef.nativeElement.scrollHeight;
        }
      }, 0);
    });
  }
}
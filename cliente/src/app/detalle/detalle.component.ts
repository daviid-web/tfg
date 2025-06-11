import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { Subject, throwError, Observable } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

interface Anuncio {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  estado: string;
  imagenes: string[];
  fechaPublicacion: Date;
  vehiculo: {
    matricula: string;
    modelo_id: number;
    estado_vehiculo: string;
    anio: number;
    kilometros: number;
    combustible: string;
    transmision: string;
    traccion: string;
    potencia: number;
    cilindrada: number;
    color: string;
    numero_puertas: number;
    plazas: number;
    peso: number;
    consumo: number;
    fotos: string[];
    Modelo?: {
      nombre: string;
      Marca: {
        nombre: string;
      };
    };
  };
  vendedor: {
    id: number;
    nombre: string;
    correo: string;
    activo: boolean;
  };
}

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, NavComponent, FooterComponent, FormsModule],
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})
export class DetalleComponent implements OnInit, OnDestroy {
  anuncio: Anuncio | null = null;
  id: string | null = null;
  imagenActual = 0;
  cargando = true;
  error: string | null = null;
  usuarioId: number = 0;

  private destroy$ = new Subject<void>();
  private readonly apiUrl = 'http://192.168.2.2:3000';

  // MODIFICACIÓN 1: El router debe ser público para poder acceder desde la plantilla
  constructor(
    private route: ActivatedRoute,
    public router: Router, // <--- CAMBIO AQUÍ: 'router' ahora es público
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.usuarioId = usuario?.id || 0;

    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id || isNaN(Number(this.id))) {
      this.error = 'ID de anuncio no válido';
      this.cargando = false;
      return;
    }
    this.cargarAnuncio();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getAuthHeaders(): HttpHeaders | undefined {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  cargarAnuncio(): void {
    this.cargando = true;
    this.error = null;

    this.http.get<unknown>(`${this.apiUrl}/api/anuncios/${this.id}`, {
      headers: this.getAuthHeaders()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: any) => {
        const imagenesAdicionales: string[] = this.parsearImagenesAdicionales(data.imagenes_adicionales);
        const todasLasImagenes = [data.imagen_principal, ...imagenesAdicionales].filter(Boolean);

        this.anuncio = {
          id: data.id,
          titulo: data.titulo,
          descripcion: data.descripcion,
          precio: parseFloat(data.precio),
          estado: data.estado,
          imagenes: todasLasImagenes,
          fechaPublicacion: new Date(data.fecha_publicacion),
          vehiculo: {
            matricula: data.vehiculo.matricula,
            modelo_id: data.vehiculo.modelo_id,
            estado_vehiculo: data.vehiculo.estado_vehiculo,
            anio: data.vehiculo.anio,
            kilometros: data.vehiculo.kilometros,
            combustible: data.vehiculo.combustible,
            transmision: data.vehiculo.transmision,
            traccion: data.vehiculo.traccion,
            potencia: data.vehiculo.potencia,
            cilindrada: data.vehiculo.cilindrada,
            color: data.vehiculo.color,
            numero_puertas: data.vehiculo.numero_puertas,
            plazas: data.vehiculo.plazas,
            peso: data.vehiculo.peso,
            consumo: data.vehiculo.consumo,
            fotos: Array.isArray(data.vehiculo.fotos) ? data.vehiculo.fotos : [],
            Modelo: data.vehiculo.Modelo
          },
          vendedor: {
            id: data.vendedor.id,
            nombre: data.vendedor.nombre,
            correo: data.vendedor.correo,
            activo: true
          }
        };

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar anuncio:', err);
        this.error = 'Error al cargar el anuncio. Puede que no exista o no tengas permisos para verlo.';
        this.cargando = false;
      }
    });
  }

  private parsearImagenesAdicionales(input: any): string[] {
    try {
      if (typeof input === 'string') {
        const str = input.trim();
        if (str.startsWith('[') && str.endsWith(']')) {
          return JSON.parse(str);
        }
      } else if (Array.isArray(input)) {
        return input;
      }
    } catch (error) {
      console.error('Error al parsear imágenes adicionales:', error, input);
    }
    return [];
  }

  cambiarImagen(indice: number): void {
    if (this.anuncio && indice >= 0 && indice < this.anuncio.imagenes.length) {
      this.imagenActual = indice;
    }
  }

  siguienteImagen(): void {
    if (this.anuncio) {
      this.imagenActual = (this.imagenActual + 1) % this.anuncio.imagenes.length;
    }
  }

  anteriorImagen(): void {
    if (this.anuncio) {
      this.imagenActual = (this.imagenActual - 1 + this.anuncio.imagenes.length) % this.anuncio.imagenes.length;
    }
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  // MODIFICACIÓN 2: Añadido el método formatearUrlImagen
  formatearUrlImagen(url?: string): string {
    if (!url) return 'assets/default-car.jpg';
    if (!url.startsWith('http') && !url.startsWith('assets')) {
      return `http://192.168.2.2:3000/uploads/${url}`;
    }
    return url;
  }

  // MODIFICACIÓN 3: Añadido el método handleImageError
  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/default-car.jpg';
  }

  reportarAnuncio(): void {
    const motivo = prompt("Introduce el motivo del reporte:");
    if (!motivo || motivo.trim() === "") {
      alert("Debes escribir un motivo para reportar el anuncio.");
      return;
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      alert("Debes estar autenticado para reportar un anuncio.");
      return;
    }

    if (!this.anuncio?.id) {
      alert("No se puede reportar este anuncio en este momento.");
      return;
    }

    const body = { motivo };
    const url = `${this.apiUrl}/api/anuncios/${this.anuncio.id}/reportar`;

    this.http.post(url, body, { headers }).subscribe({
      next: () => alert("Anuncio reportado correctamente. Gracias por tu colaboración."),
      error: (err) => {
        console.error('Error al reportar el anuncio:', err);
        alert("Ocurrió un error al reportar el anuncio.");
      }
    });
  }

  iniciarConversacion(vendedorId: number, anuncioId: number): void {
    if (!this.usuarioId) {
      alert('Necesitas iniciar sesión para enviar un mensaje.');
      this.router.navigate(['/login']);
      return;
    }

    const createConversationUrl = `${this.apiUrl}/api/mensajes/iniciar-o-seleccionar`;
    const body = {
      emisorId: this.usuarioId,
      receptorId: vendedorId,
      anuncioId: anuncioId
    };

    const headers = this.getAuthHeaders();
    if (!headers) {
      alert("Error: No se encontró el token de autenticación. Por favor, inicia sesión de nuevo.");
      return;
    }

    this.http.post<{ message: string, conversationId: number, receptorId: number, anuncioId: number }>(createConversationUrl, body, {
      headers: headers
    }).pipe(
      catchError(error => {
        console.error('Error al iniciar/seleccionar conversación:', error);
        alert('No se pudo iniciar o seleccionar la conversación. Por favor, inténtalo de nuevo.');
        return throwError(() => new Error('Error al iniciar/seleccionar conversación'));
      }),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      console.log(response.message);
      this.router.navigate(['/mensajes'], {
        queryParams: {
          usuarioDestino: response.receptorId,
          anuncioId: response.anuncioId
        }
      });
    });
  }
}

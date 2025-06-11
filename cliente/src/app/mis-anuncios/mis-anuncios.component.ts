import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-mis-anuncios',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, NavComponent, FooterComponent],
  templateUrl: './mis-anuncios.component.html',
  styleUrls: ['./mis-anuncios.component.css']
})
export class MisAnunciosComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  anuncios = signal<any[]>([]);
  loading = signal(true);
  error = signal(false);
  usuarioId: number | null = null;

  ngOnInit() {
    this.obtenerUsuarioActual();
  }

  obtenerUsuarioActual(): void {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const usuarioObj = JSON.parse(usuario);
        this.usuarioId = usuarioObj.id;
        this.cargarMisAnuncios();
      } catch (error) {
        console.error('Error al analizar datos del usuario:', error);
        this.error.set(true);
        this.loading.set(false);
      }
    } else {
      console.warn('Debes iniciar sesión para ver tus anuncios.');
      this.error.set(true);
      this.loading.set(false);
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  cargarMisAnuncios(): void {
    const token = localStorage.getItem('token');
    if (!token || this.usuarioId === null) {
      console.warn('No hay token JWT o usuarioId almacenado.');
      this.error.set(true);
      this.loading.set(false);
      return;
    }

    const url = `http://192.168.2.2:3000/api/mis-anuncios?usuarioId=${this.usuarioId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    console.log('Realizando solicitud GET a', url);

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (data) => {
        console.log('Respuesta recibida del backend:', data);
        this.anuncios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al obtener anuncios:', err);
        if (err.error) {
          console.error('Contenido de error:', err.error);
        }
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
  formatearUrlImagen(nombreArchivo: string | null | undefined): string {
    if (!nombreArchivo || typeof nombreArchivo !== 'string' || nombreArchivo.trim() === '') {
      return 'assets/imagenes/default-car.jpg';
    }
    return `http://192.168.2.2:3000/uploads/${nombreArchivo}`;
  }


  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/imagenes/default-car.jpg'; // imagen por defecto
  }

  // Navegación a la vista de detalles
  verDetalle(id: number): void {
    this.router.navigate(['/detalleAnuncio/:id', id]);
  }

  // Formateo de precio (p. ej., 12345 -> 12.345 €)
  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  }

eliminarAnuncio(id: number): void {
  const confirmar = window.confirm('¿Estás seguro de que quieres eliminar este anuncio?');
  if (!confirmar) return;

  const token = localStorage.getItem('token');
  if (!token) return;

  const url = `http://192.168.2.2:3000/api/anuncios/${id}`;
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.http.delete(url, { headers }).subscribe({
    next: (res: any) => {
      console.log(res.mensaje);
      this.anuncios.set(this.anuncios().filter(anuncio => anuncio.id !== id));
    },
    error: (err) => {
      console.error('Error al eliminar anuncio:', err);
    }
  });
}

marcarVendido(id: number): void {
  const confirmar = window.confirm('¿Quieres marcar este anuncio como vendido?');
  if (!confirmar) return;

  const token = localStorage.getItem('token');
  if (!token) return;

  const url = `http://192.168.2.2:3000/api/anuncios/${id}/vender`;
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.http.post(url, {}, { headers }).subscribe({
    next: (res: any) => {
      console.log(res.mensaje);
      this.actualizarAnuncioLocal(res.anuncio); // Asegúrate de que este método existe
    },
    error: (err) => {
      console.error('Error al vender anuncio:', err);
    }
  });
}


  // Actualiza el anuncio en la lista local
  actualizarAnuncioLocal(anuncioActualizado: any): void {
    const lista = this.anuncios();
    const index = lista.findIndex(a => a.id === anuncioActualizado.id);
    if (index !== -1) {
      lista[index] = {
        ...lista[index],
        ...anuncioActualizado
      };
      this.anuncios.set([...lista]);
    }
  }


}

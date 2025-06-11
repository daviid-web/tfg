import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';

interface Favorito {
  id: number;
  anuncio_id: number;
  usuario_id: number;
  fecha_agregado: string;
  anuncio: {
    id: number;
    titulo: string;
    precio: number;
    marca: string;
    modelo: string;
    anio: number;
    kilometros: number;
    combustible: string;
    imagen_principal: string; // Asegúrate de que esto sea 'string' y no 'string[]'
  };
}

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    NavComponent,
    FooterComponent
  ],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css']
})
export class FavoritosComponent implements OnInit {
  favoritos: Favorito[] = [];
  cargando = true;
  error: string | null = null;
  usuarioId: number | null = null;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.obtenerUsuarioActual();
  }

  obtenerUsuarioActual(): void {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const usuarioObj = JSON.parse(usuario);
        this.usuarioId = usuarioObj.id;
        this.cargarFavoritos();
      } catch (error) {
        console.error('Error al analizar datos del usuario:', error);
        this.error = 'Error al obtener información del usuario.';
        this.cargando = false;
      }
    } else {
      this.error = 'Debes iniciar sesión para ver tus favoritos.';
      this.cargando = false;
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  cargarFavoritos(): void {
    if (!this.usuarioId) {
      this.error = 'No se pudo obtener el ID del usuario.';
      this.cargando = false;
      return;
    }

    this.cargando = true;
    this.error = null;

    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'No hay sesión activa. Por favor, inicia sesión nuevamente.';
      this.cargando = false;
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    const url = `http://192.168.2.2:3000/api/usuarios/${this.usuarioId}/favoritos`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Favorito[]>(url, { headers })
      .subscribe({
        next: (data) => {
          this.favoritos = data;
          this.cargando = false;
          console.log('Favoritos cargados:', this.favoritos.length);
        },
        error: (err) => {
          this.error = `Error al cargar los favoritos. Estado: ${err.status}`;
          console.error('Error al cargar favoritos:', err);
          this.cargando = false;
        }
      });
  }

  // ¡NUEVA FUNCIÓN AÑADIDA PARA FORMATAR LA URL DE LA IMAGEN!
  formatearUrlImagen(url?: string): string {
    if (!url) return 'assets/default-car.jpg'; // Imagen por defecto si no hay URL
    // Si la URL no es http/https ni assets, asume que es una ruta relativa de tu backend
    if (!url.startsWith('http') && !url.startsWith('https') && !url.startsWith('assets')) {
      return `http://192.168.2.2:3000/uploads/${url}`; // Asegúrate de que '/uploads/' sea la ruta correcta en tu servidor
    }
    return url; // Si ya es una URL completa o de assets, la devuelve tal cual
  }

  eliminarFavorito(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este favorito?')) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.delete(`http://192.168.2.2:3000/api/favoritos/${id}`, { headers }).subscribe({
        next: () => {
          this.favoritos = this.favoritos.filter(fav => fav.id !== id);
          console.log('Favorito eliminado correctamente');
        },
        error: (err) => {
          console.error('Error al eliminar favorito:', err);
          alert('Error al eliminar el favorito. Inténtalo de nuevo.');
        }
      });
    }
  }

  verDetalle(id: number): void {
    this.router.navigate(['/detalle-vehiculo', id]);
  }

  formatearPrecio(precio: number): string {
    return `${precio.toLocaleString('es-ES')} €`;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/default-car.jpg'; // Ruta a tu imagen por defecto
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { HttpClient } from '@angular/common/http';

// Interfaz mejorada para un coche destacado con todas sus propiedades
interface CocheDestacado {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  precio: number;
  anio: number;
  kilometraje: number;
  marca: string; // Nombre de la marca
  modelo: string; // Nombre del modelo
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  sesionIniciada = false;
  usuarioNombre = '';

  cochesDestacados: CocheDestacado[] = [];
  private apiUrl = 'http://192.168.2.2:3000/api';

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.verificarSesion();
    this.cargarCochesDestacados();
  }

  verificarSesion(): void {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    this.sesionIniciada = !!token;

    if (usuario) {
      try {
        const usuarioObj = JSON.parse(usuario);
        this.usuarioNombre = usuarioObj.nombre || '';
      } catch (error) {
        console.error('Error al analizar datos del usuario:', error);
      }
    }
  }

  irRuta(path: string): void {
    if ((path === '/anuncios' || path === '/publicar') && !this.sesionIniciada) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate([path]);
  }

  private cargarCochesDestacados(): void {
    // Datos de ejemplo para coches destacados con información más completa
    this.cochesDestacados = [
      {
        id: 1,
        titulo: 'BMW Serie 3',
        descripcion: 'Perfecto estado, listo para usar.',
        imagenUrl: '/assets/car-placeholder.jpg',
        precio: 25000,
        anio: 2018,
        kilometraje: 75000,
        marca: 'BMW',
        modelo: 'Serie 3'
      },
      {
        id: 2,
        titulo: 'Audi A4',
        descripcion: 'Con todas las revisiones al día.',
        imagenUrl: '/assets/car-placeholder2.jpg',
        precio: 28500,
        anio: 2019,
        kilometraje: 60000,
        marca: 'Audi',
        modelo: 'A4'
      },
      {
        id: 3,
        titulo: 'Mercedes-Benz Clase C',
        descripcion: 'Excelente oportunidad, bajo kilometraje.',
        imagenUrl: '/assets/car-placeholder3.jpg',
        precio: 32000,
        anio: 2020,
        kilometraje: 45000,
        marca: 'Mercedes', // Asegúrate de que el nombre coincida con lo que tu API espera
        modelo: 'Clase C'
      },
    ];
  }

  marcasPopulares = [
    { nombre: 'Toyota', logo: 'assets/logo_toyota.png', busquedas: 1245 },
    { nombre: 'BMW', logo: 'assets/logo_bwm.png', busquedas: 1120 },
    { nombre: 'Mercedes', logo: 'assets/logo_mercedes.png', busquedas: 980 },
    { nombre: 'Audi', logo: 'assets/logo_audi.png', busquedas: 875 },
    { nombre: 'Volkswagen', logo: 'assets/logo_volkswagen.png', busquedas: 760 }
  ];

  filtrarPorModelo(modelo: string) {
    this.router.navigate(['/anuncios'], {
      queryParams: { modelo: modelo }
    });
  }

  async buscarPorMarca(nombreMarca: string): Promise<void> {
    await this.forzarRolComprador();
    this.router.navigate(['/anuncios'], {
      queryParams: { marca: nombreMarca }
    });
  }

  // MODIFICADO: Navega a la vista de anuncios y pasa los filtros del coche destacado
  async verAnunciosCocheDestacado(coche: CocheDestacado): Promise<void> {
    await this.forzarRolComprador(); // Asegura el rol de comprador antes de la navegación
    this.router.navigate(['/anuncios'], {
      queryParams: {
        marca: coche.marca,
        modelo: coche.modelo,
      }
    });
  }

  private forzarRolComprador(): Promise<void> {
    const token = localStorage.getItem('token');
    const usuarioRaw = localStorage.getItem('usuario');
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

    if (!token || !usuario) {
      console.warn('No hay sesión activa o usuario no encontrado.');
      return Promise.resolve();
    }

    if (usuario.rol === 'vendedor') {
      const nuevoRol = 'comprador';
      return new Promise((resolve, reject) => {
        this.http.put<any>(
          `http://192.168.2.2:3000/api/usuarios/${usuario.id}/rol`,
          { rol: nuevoRol },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        ).subscribe({
          next: (res) => {
            usuario.rol = nuevoRol;
            localStorage.setItem('usuario', JSON.stringify(usuario));
            console.log('Rol cambiado exitosamente a comprador.');
            resolve();
          },
          error: (err) => {
            console.error('Error al cambiar el rol:', err);
            const mensajeError = err.error?.mensaje || 'Error al cambiar el rol.';
            console.error(mensajeError);
            reject(err);
          }
        });
      });
    } else {
      return Promise.resolve();
    }
  }
}

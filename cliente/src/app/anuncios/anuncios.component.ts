import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HttpClient, HttpClientModule, HttpParams, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';

interface Marca {
  id: number;
  nombre: string;
}

interface Modelo {
  id: number;
  nombre: string;
}

interface Filtros {
  marca: number | null;
  modelo: string; // Se mantendrá como string para el ID del modelo una vez encontrado
  precioMin: number;
  precioMax: number;
  anioMin: number;
  anioMax: number;
  combustible: string;
  kilometrosMin: number;
  kilometrosMax: number;
}

@Component({
  selector: 'app-anuncios',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    NavComponent,
    FooterComponent
  ],
  templateUrl: './anuncios.component.html',
  styleUrls: ['./anuncios.component.css']
})
export class AnunciosComponent implements OnInit {
  filtros: Filtros = {
    marca: null,
    modelo: '',
    precioMin: 0,
    precioMax: 100000,
    anioMin: 2000,
    anioMax: new Date().getFullYear(),
    combustible: '',
    kilometrosMin: 0,
    kilometrosMax: 300000
  };

  marcas: Marca[] = [];
  modelos: { [marcaId: number]: Modelo[] } = {};
  combustibles: string[] = [];

  anuncios: any[] = [];
  anunciosFiltrados: any[] = [];
  cargando: boolean = false;
  error: string | null = null;
  favoritos: number[] = [];

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.router.url.includes('/anuncios')) {
        this.cargarFavoritos();
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Asegurarse de que las marcas estén cargadas antes de procesar cualquier parámetro de consulta
    await this.cargarMarcas();
    this.cargarCombustibles();
    await this.cargarFavoritos();

    this.route.queryParams.subscribe(async params => {
      const marcaParam = params['marca'] as string;
      const modeloParam = params['modelo'] as string;

      // Limpiar los filtros actuales para evitar la acumulación de búsquedas anteriores
      // Pasa 'false' para evitar que se carguen todos los anuncios inmediatamente
      this.limpiarFiltros(false);

      let filtersAppliedFromUrl = false; // Bandera para saber si se aplicarán filtros desde la URL

      if (marcaParam) {
        const marcaEncontrada = this.marcas.find(m => m.nombre.toLowerCase() === marcaParam.toLowerCase());
        if (marcaEncontrada) {
          this.filtros.marca = marcaEncontrada.id;
          filtersAppliedFromUrl = true;
          // Cargar los modelos para la marca encontrada y esperar a que terminen
          await this.cargarModelos();
        } else {
          console.warn('Marca no encontrada en queryParams:', marcaParam);
        }
      }

      // Procesar el parámetro del modelo SOLO si se encontró una marca válida
      if (this.filtros.marca !== null && modeloParam) {
        const modelosDeMarca = this.modelos[this.filtros.marca] || [];
        const modeloEncontrado = modelosDeMarca.find(m => m.nombre.toLowerCase() === modeloParam.toLowerCase());
        if (modeloEncontrado) {
          // Guarda el ID del modelo como string, ya que así lo espera la interfaz Filtros
          this.filtros.modelo = modeloEncontrado.id.toString();
          filtersAppliedFromUrl = true;
        } else {
          console.warn('Modelo no encontrado para la marca seleccionada:', modeloParam);
        }
      }

      // Si se aplicó algún filtro desde la URL, entonces aplica los filtros.
      // De lo contrario, carga todos los anuncios por defecto.
      if (filtersAppliedFromUrl) {
        this.aplicarFiltros();
      } else {
        this.obtenerAnuncios();
      }
    });
  }

  cargarMarcas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Marca[]>('http://192.168.2.2:3000/api/marcas').subscribe({
        next: (data) => {
          this.marcas = data;
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar marcas:', err);
          reject(err); // Es importante rechazar la promesa en caso de error
        }
      });
    });
  }

  // Ahora devuelve una Promise<void> para que pueda ser 'await'
  cargarModelos(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.filtros.marca === null) {
        this.filtros.modelo = ''; // Limpia el modelo seleccionado si no hay marca
        this.modelos = {}; // Limpia el diccionario de modelos
        resolve();
        return;
      }

      this.http
        .get<Modelo[]>(`http://192.168.2.2:3000/api/modelos?marca_id=${this.filtros.marca}`)
        .subscribe({
          next: (modelos) => {
            this.modelos[this.filtros.marca!] = modelos;
            resolve();
          },
          error: (error) => {
            console.error('Error al cargar modelos:', error);
            this.modelos[this.filtros.marca!] = [];
            reject(error); // Rechaza la promesa en caso de error
          }
        });
    });
  }

  getModelos(): Modelo[] {
    return this.filtros.marca ? this.modelos[this.filtros.marca] || [] : [];
  }

  cargarFavoritos(): Promise<void> {
    return new Promise((resolve, reject) => {
      const usuario = localStorage.getItem('usuario');
      const token = localStorage.getItem('token');

      if (!usuario || !token) {
        resolve(); // Resuelve sin cargar favoritos si no hay usuario o token
        return;
      }

      const usuarioId = JSON.parse(usuario).id;
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      this.http
        .get<any[]>(`http://192.168.2.2:3000/api/usuarios/${usuarioId}/favoritos`, { headers })
        .subscribe({
          next: (data) => {
            this.favoritos = Array.isArray(data) ? data.map(f => f.anuncio_id) : [];
            resolve();
          },
          error: (error) => {
            console.error('Error al cargar favoritos:', error);
            resolve(); // Resuelve incluso con error para no bloquear la app
          }
        });
    });
  }

  cargarCombustibles(): void {
    this.http.get<string[]>('http://192.168.2.2:3000/api/combustibles').subscribe({
      next: (data) => (this.combustibles = data),
      error: (err) => console.error('Error al cargar combustibles:', err)
    });
  }

  async obtenerAnuncios(): Promise<void> {
    this.cargando = true;
    this.error = null;

    try {
      await this.cargarFavoritos();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      });

      this.http.get<any[]>('http://192.168.2.2:3000/api/anuncios', { headers }).subscribe({
        next: (data) => {
          this.anuncios = data || [];
          this.anunciosFiltrados = [...this.anuncios];
          this.cargando = false;

          if (this.anuncios.length === 0) {
            this.error = 'No se encontraron anuncios disponibles.';
          } else {
            this.error = null; // Limpiar el error si hay resultados
          }
        },
        error: (err) => {
          console.error('Error al cargar anuncios:', err);
          this.error = 'Error al cargar los anuncios.';
          this.anuncios = [];
          this.anunciosFiltrados = [];
          this.cargando = false;
        }
      });
    } catch (err) {
      console.error('Error inesperado:', err);
      this.cargando = false;
    }
  }

  aplicarFiltros(): void {
    this.cargando = true;

    let params = new HttpParams();

    // Añade los filtros solo si tienen un valor
    if (this.filtros.marca) params = params.append('marca_id', this.filtros.marca.toString());
    if (this.filtros.modelo) params = params.append('modelo_id', this.filtros.modelo); // 'modelo' es el ID como string
    if (this.filtros.precioMin > 0) params = params.append('precio_min', this.filtros.precioMin.toString());
    if (this.filtros.precioMax < 100000) params = params.append('precio_max', this.filtros.precioMax.toString());
    if (this.filtros.anioMin > 2000) params = params.append('anio_min', this.filtros.anioMin.toString());
    if (this.filtros.anioMax < new Date().getFullYear()) params = params.append('anio_max', this.filtros.anioMax.toString());
    if (this.filtros.combustible) params = params.append('combustible', this.filtros.combustible);
    if (this.filtros.kilometrosMin > 0) params = params.append('km_min', this.filtros.kilometrosMin.toString());
    if (this.filtros.kilometrosMax < 300000) params = params.append('km_max', this.filtros.kilometrosMax.toString());

    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<any[]>('http://192.168.2.2:3000/api/filtros', { params, headers }).subscribe({
      next: (data) => {
        this.anuncios = data || [];
        this.anunciosFiltrados = [...this.anuncios];
        if (this.anuncios.length === 0) {
          this.error = 'No se encontraron anuncios con los filtros aplicados.';
        } else {
          this.error = null;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al filtrar anuncios:', err);
        this.error = 'Error al aplicar los filtros.';
        this.cargando = false;
        this.anuncios = [];
        this.anunciosFiltrados = [];
      }
    });
  }

  // Permite limpiar los filtros sin disparar una recarga inmediata de anuncios
  limpiarFiltros(obtenerAnunciosInmediatamente: boolean = true): void {
    this.filtros = {
      marca: null,
      modelo: '',
      precioMin: 0,
      precioMax: 100000,
      anioMin: 2000,
      anioMax: new Date().getFullYear(),
      combustible: '',
      kilometrosMin: 0,
      kilometrosMax: 300000
    };
    this.modelos = {}; // También limpia el caché de modelos
    if (obtenerAnunciosInmediatamente) {
      this.obtenerAnuncios();
    }
  }

  formatearUrlImagen(url?: string): string {
    if (!url) return 'assets/default-car.jpg';
    if (!url.startsWith('http') && !url.startsWith('assets')) {
      return `http://192.168.2.2:3000/uploads/${url}`;
    }
    return url;
  }

  verDetalle(id: number): void {
    this.router.navigate(['/detalleAnuncio', id]);
  }

  formatearPrecio(precio: number | undefined): string {
    return typeof precio === 'number' ? `${precio.toLocaleString('es-ES')} €` : '';
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/default-car.jpg';
  }

  toggleFavorito(anuncioId: number): void {
    const index = this.favoritos.indexOf(anuncioId);
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');

    if (!token || !usuario) {
      console.error('Debes iniciar sesión para guardar favoritos');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    if (index === -1) {
      this.http.post(`http://192.168.2.2:3000/api/favoritos/${anuncioId}`, {}, { headers }).subscribe({
        next: () => {
          this.favoritos.push(anuncioId);
        },
        error: (err) => console.error('Error al guardar favorito:', err)
      });
    } else {
      this.http.delete(`http://192.168.2.2:3000/api/favoritos/anuncio/${anuncioId}`, { headers }).subscribe({
        next: () => {
          this.favoritos.splice(index, 1);
        },
        error: (err) => console.error('Error al eliminar favorito:', err)
      });
    }
  }

  onMarcaChange(): void {
    this.filtros.modelo = '';
    if (this.filtros.marca !== null) this.cargarModelos();
  }

  esFavorito(anuncioId: number): boolean {
    return this.favoritos.includes(anuncioId);
  }
}

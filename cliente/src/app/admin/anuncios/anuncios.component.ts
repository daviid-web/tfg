import { Component } from '@angular/core';
import { AdminNavComponent } from '../admin-nav/admin-nav.component';
import { signal } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgForOf } from '@angular/common';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-admin-anuncios',
  standalone: true,
  imports: [
    AdminNavComponent,
    HttpClientModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './anuncios.component.html',
  styleUrl: './anuncios.component.css'
})
export class AnunciosComponent {
  private http = inject(HttpClient);
  private readonly BASE_URL = 'http://192.168.2.2:3000';

  anuncios = signal<any[]>([]);
  cargando = signal(true);
  error = signal('');

  constructor() {
    this.cargarAnuncios();
  }

  cargarAnuncios() {
    this.cargando.set(true);
    this.http.get<any[]>(`${this.BASE_URL}/api/anuncios`).subscribe({
      next: (data) => {
        this.anuncios.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los anuncios');
        this.cargando.set(false);
      },
    });
  }

  eliminarAnuncio(id: number) {
    if (!confirm('¿Seguro que quieres eliminar este anuncio?')) return;

    this.http.delete(`${this.BASE_URL}/api/anuncios/${id}`).subscribe(() => {
      this.anuncios.update((anuncios) => anuncios.filter((a) => a.id !== id));
    });
  }
}

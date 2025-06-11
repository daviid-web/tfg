import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AdminNavComponent } from '../admin-nav/admin-nav.component';

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AdminNavComponent,
    HttpClientModule
  ],
  templateUrl: './reportes.component.html'
})
export class ReportesComponent {
  private http = inject(HttpClient);
  reportes: any[] = [];
  private token = localStorage.getItem('token');
  private headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`
  });

  ngOnInit() {
    if (!this.token) {
      alert("Debes estar autenticado como administrador.");
      return;
    }

    this.cargarReportes();
  }

  cargarReportes() {
    this.http.get<any[]>('http://192.168.2.2:3000/api/reportes', { headers: this.headers }).subscribe({
      next: (data) => this.reportes = data,
      error: (err) => {
        console.error(err);
        alert("Error al cargar los reportes.");
      }
    });
  }

  eliminarReporte(id: number) {
    if (confirm('¿Seguro que deseas eliminar este reporte?')) {
      this.http.delete(`http://192.168.2.2:3000/api/reportes/${id}`, { headers: this.headers }).subscribe({
        next: () => this.cargarReportes(),
        error: (err) => {
          console.error(err);
          alert("No se pudo eliminar el reporte.");
        }
      });
    }
  }

  eliminarAnuncio(anuncioId: number) {
    if (confirm('¿Eliminar también el anuncio reportado?')) {
      this.http.delete(`http://192.168.2.2:3000/api/anuncios/${anuncioId}`, { headers: this.headers }).subscribe({
        next: () => this.cargarReportes(),
        error: (err) => {
          console.error(err);
          alert("No se pudo eliminar el anuncio.");
        }
      });
    }
  }
}

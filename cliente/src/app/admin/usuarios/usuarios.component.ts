import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AdminNavComponent } from '../admin-nav/admin-nav.component';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [AdminNavComponent, CommonModule, HttpClientModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly BASE_URL = 'http://192.168.2.2:3000';

  usuarios: Usuario[] = [];

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Debes estar autenticado como administrador.");
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<Usuario[]>(`${this.BASE_URL}/api/usuarios`, { headers }).subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        alert('No se pudieron cargar los usuarios.');
      }
    });
  }

  activarUsuario(usuario: Usuario): void {
    this.cambiarEstadoUsuario(usuario.id, true);
  }

  desactivarUsuario(usuario: Usuario): void {
    this.cambiarEstadoUsuario(usuario.id, false);
  }

  private cambiarEstadoUsuario(id: number, estado: boolean): void {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Debes estar autenticado.");
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.put<{ mensaje: string; usuario: Usuario }>(
      `${this.BASE_URL}/api/usuarios/${id}/estado`,
      { activo: estado },
      { headers }
    ).subscribe({
      next: (response) => {
        const index = this.usuarios.findIndex(u => u.id === id);
        if (index !== -1) {
          this.usuarios[index].activo = response.usuario.activo;
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('No se pudo actualizar el estado del usuario.');
      }
    });
  }

  eliminarUsuario(id: number) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Debes estar autenticado.");
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.delete(`${this.BASE_URL}/api/usuarios/${id}`, { headers }).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== id);
        alert('Usuario eliminado con éxito.');
      },
      error: (err) => {
        console.error(`Error al eliminar el usuario con ID ${id}:`, err);
        alert(`Error al eliminar usuario: ${err.message || 'Error desconocido'}`);
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  imports: [RouterModule, CommonModule, HttpClientModule]
})
export class NavComponent implements OnInit {
  usuarioActual: any = null;
  menuAbierto = false;
  rolActual: 'comprador' | 'admin' | 'vendedor' = 'comprador';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.cargarUsuarioDesdeServidor();
  }

  cargarUsuarioDesdeServidor(): void {
    const usuario = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');

    if (!usuario || !token) {
      console.log('No hay sesión activa');
      return;
    }

    let usuarioId: number;
    try {
      const datos = JSON.parse(usuario);
      usuarioId = datos.id;
    } catch (e) {
      console.error('Error al analizar el usuario desde localStorage');
      this.limpiarSesion();
      return;
    }

    this.http.get<any>(`http://192.168.2.2:3000/api/usuarios/${usuarioId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (usuarioServidor) => {
        this.usuarioActual = usuarioServidor;
        this.rolActual = usuarioServidor.rol || 'comprador';
        localStorage.setItem('usuario', JSON.stringify(usuarioServidor));
        console.log('Usuario cargado desde servidor:', usuarioServidor);

        // Aquí agregamos la redirección si el rol es admin
        if (this.rolActual === 'admin') {
          this.router.navigate(['/admin/usuarios']);
        }
      },
      error: (err) => {
        console.error('Error al cargar usuario desde el servidor:', err);
        this.limpiarSesion();
      }
    });
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cambiarRol(): void {
    const nuevoRol = this.rolActual === 'comprador' ? 'vendedor' : 'comprador';
    const token = localStorage.getItem('token');

    if (!token || !this.usuarioActual) {
      alert('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    this.http.put<any>(
      `http://192.168.2.2:3000/api/usuarios/${this.usuarioActual.id}/rol`,
      { rol: nuevoRol },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ).subscribe({
      next: (res) => {
        this.rolActual = nuevoRol;
        this.usuarioActual.rol = nuevoRol;
        localStorage.setItem('usuario', JSON.stringify(this.usuarioActual));
        console.log('Rol cambiado exitosamente a:', nuevoRol);

        const rutaDestino = nuevoRol === 'vendedor' ? '/publicar' : '/anuncios';
        this.router.navigate([rutaDestino]);
      },
      error: (err) => {
        console.error('Error al cambiar el rol:', err);
        const mensajeError = err.error?.mensaje || 'Error al cambiar el rol. Inténtalo de nuevo.';
        alert(mensajeError);
      }
    });
  }

  cerrarSesion(): void {
    const token = localStorage.getItem('token');

    this.http.post('http://192.168.2.2:3000/api/sesion/logout', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: () => this.limpiarSesion(),
      error: () => this.limpiarSesion()
    });
  }

  private limpiarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioActual = null;
    this.router.navigate(['/']);
  }
}

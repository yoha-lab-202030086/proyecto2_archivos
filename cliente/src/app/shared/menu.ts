import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {
  esAdmin: boolean = false;

    ngOnInit(): void {
    const token = localStorage.getItem('usuario') || localStorage.getItem('token');
    
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadDecodificado = atob(payloadBase64);
        const datosUsuario = JSON.parse(payloadDecodificado);
        
        const rolUpper = (datosUsuario?.rol || '').toString().toUpperCase();
        this.esAdmin = rolUpper === 'ADMINISTRADOR' || rolUpper === 'PROPIETARIO';
      } catch (error) {
        this.esAdmin = false;
      }
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}

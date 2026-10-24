import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/servicios/api.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  correo = '';
  contrasena = '';
  mensaje = '';
  cargando = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private cd: ChangeDetectorRef 
  ) {}

  iniciarSesion(): void {
    if (!this.correo.trim() || !this.contrasena) {
      this.mensaje = 'Ingresa tu correo y contraseña.';
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.cd.detectChanges(); 

    this.api.iniciarSesion({
      correo: this.correo.trim(),
      contraseña: this.contrasena
    }).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;

        if (!respuesta.token) {
          this.mensaje = 'El servidor no devolvió un token.';
          this.cd.detectChanges(); 
          return;
        }

        localStorage.setItem('token', respuesta.token);
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        this.cargando = false;
        this.mensaje =
          error.error?.mensaje ||
          'No se pudo iniciar sesión. Revisa tus datos.';

        this.cd.detectChanges(); 
      }
    });
  }
}

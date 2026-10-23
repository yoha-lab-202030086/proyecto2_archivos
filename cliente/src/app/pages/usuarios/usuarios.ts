import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/servicios/api.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
  usuarios: any[] = [];
  mensaje = '';
  cargando = false;

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.consultar();
  }

  consultar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.obtener('usuarios').subscribe({
      next: (respuesta: any) => {
        this.usuarios = Array.isArray(respuesta)
          ? respuesta
          : respuesta.usuarios ?? respuesta.datos ?? [];
        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
        }, 500);
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje ||
          'No se pudieron consultar los usuarios. Puede requerir permisos de administrador.';
        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
        }, 500);
      }
    });
  }
}

import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/servicios/api.service';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './permisos.html',
  styleUrl: './permisos.css'
})
export class Permisos {
  recursoTipo: 'ARCHIVO' | 'CARPETA' = 'ARCHIVO';
  recursoId = '';
  usuarioDestinoId = '';
  nivel: 'LECTURA' | 'EDICION' = 'LECTURA';
  permisos: any[] = [];
  mensaje = '';
  cargando = false;
  procesando = false;

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  consultar(): void {
    if (!this.recursoId.trim()) {
      this.mensaje = 'Ingresa el ID del archivo o carpeta.';
      return;
    }

    const parametros = new URLSearchParams({
      recursoTipo: this.recursoTipo,
      recursoId: this.recursoId.trim()
    });

    this.cargando = true;
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.obtener(`permisos?${parametros.toString()}`).subscribe({
      next: (respuesta: any) => {
        this.permisos = Array.isArray(respuesta) ? respuesta : [];
        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
        }, 500);
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje ||
          'No se pudieron consultar los permisos. Comprueba que el recurso te pertenece.';
        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
        }, 500);
      }
    });
  }

  compartir(): void {
    if (!this.recursoId.trim() || !this.usuarioDestinoId.trim()) {
      this.mensaje = 'Ingresa el ID del recurso y del usuario.';
      return;
    }
    this.procesando = true;
    this.mensaje = '';
    this.cd.detectChanges();

    const datos = {
      recursoTipo: this.recursoTipo,
      recursoId: this.recursoId.trim(),
      usuarioDestinoId: this.usuarioDestinoId.trim(),
      nivel: this.nivel
    };

    this.api.crear('permisos', datos).subscribe({
      next: (respuesta: any) => {
        this.mensaje = respuesta.mensaje || 'Recurso compartido correctamente.';
        this.usuarioDestinoId = '';
        this.procesando = false;
        this.consultar();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudo compartir el recurso.';
        this.procesando = false;
        this.cd.detectChanges();
      }
    });
  }

  cambiarNivel(permiso: any, nivel: 'LECTURA' | 'EDICION'): void {
    this.procesando = true;
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.actualizar(`permisos/${permiso._id}`, { nivel }).subscribe({
      next: (respuesta: any) => {
        this.mensaje = respuesta.mensaje || 'Permiso actualizado.';
        this.procesando = false;
        this.consultar();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudo cambiar el permiso.';
        this.procesando = false;
        this.cd.detectChanges();
      }
    });
  }

  retirar(permiso: any): void {
    if (!confirm('¿Deseas retirar el acceso de este usuario?')) {
      return;
    }

    this.procesando = true; 
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.eliminar(`permisos/${permiso._id}`).subscribe({
      next: (respuesta: any) => {
        this.mensaje = respuesta.mensaje || 'Permiso retirado.';
        this.procesando = false;
        this.consultar();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudo retirar el permiso.';
        this.procesando = false; 
        this.cd.detectChanges();
      }
    });
  }
}

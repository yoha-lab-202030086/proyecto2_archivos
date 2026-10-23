 import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/servicios/api.service';

@Component({
  selector: 'app-papelera',
  standalone: true,
  templateUrl: './papelera.html',
  styleUrl: './papelera.css'
})
export class Papelera implements OnInit {
  archivos: any[] = [];
  carpetas: any[] = [];
  mensaje = '';
  cargando = false;

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarPapelera();
  }

  cargarPapelera(): void {
    this.cargando = true;
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.obtener('papelera').subscribe({
      next: (respuesta: any) => {
        this.archivos = respuesta.archivos ?? [];
        this.carpetas = respuesta.carpetas ?? [];

        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
        }, 500);
      },

      error: (error) => {
        this.mensaje = error.error?.mensaje ||
          'No se pudo cargar la papelera. Comprueba que has iniciado sesión.';
        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
        }, 500);
      }
    });
  }

  restaurar(tipo: 'archivo' | 'carpeta', id: string): void {
    if (!confirm('¿Restaurar este elemento?')) {
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.actualizar(
     `papelera/${tipo}/${id}/restaurar`,
      {}
    ).subscribe({
      next: () => {
        this.mensaje = 'Recurso restaurado correctamente.';

        setTimeout(() => {
          this.cargando = false;
          this.cargarPapelera();
        }, 500);
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje ||
          'No se pudo restaurar el recurso.';
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  eliminarDefinitivamente(tipo: 'archivo' | 'carpeta', id: string): void {
    if (!confirm('Esta acción es permanente. ¿Continuar?')) {
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.eliminar(
    `papelera/${tipo}/${id}/definitivo`
    ).subscribe({
      next: () => {
        this.mensaje = 'Recurso eliminado definitivamente.';

      setTimeout(() => {
          this.cargando = false;
          this.cargarPapelera();
        }, 500);
      },

      error: (error) => {
        this.mensaje = error.error?.mensaje ||
          'No se pudo eliminar definitivamente.';
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }
}

import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { ApiService } from '../../core/servicios/api.service';

interface OpcionReporte {
  nombre: string;
  ruta: string;
  requiereFechas?: boolean;
  requiereUsuario?: boolean;
  requiereCarpeta?: boolean;
  requierePeriodo?: boolean;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [FormsModule, JsonPipe],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {
  opciones: OpcionReporte[] = [
    { nombre: 'Archivos más grandes', ruta: 'archivos-mas-grandes' },
    { nombre: 'Archivos por tipo', ruta: 'archivos-por-tipo' },
    { nombre: 'Archivos por fecha', ruta: 'archivos-por-fecha', requiereFechas: true },
    { nombre: 'Archivos con más operaciones', ruta: 'archivos-mas-operaciones' },
    { nombre: 'Almacenamiento por tipo', ruta: 'almacenamiento-por-tipo' },
    { nombre: 'Usuarios con más archivos', ruta: 'usuarios-mas-archivos' },
    { nombre: 'Almacenamiento por usuario', ruta: 'almacenamiento-usuarios' },
    { nombre: 'Porcentaje de almacenamiento', ruta: 'porcentaje-almacenamiento' },
    { nombre: 'Usuarios que más comparten', ruta: 'usuarios-mas-comparten' },
    { nombre: 'Recursos más compartidos', ruta: 'recursos-mas-compartidos' },
    { nombre: 'Recursos compartidos por usuario', ruta: 'compartidos-por/:usuarioId', requiereUsuario: true },
    { nombre: 'Recursos compartidos con usuario', ruta: 'compartidos-con/:usuarioId', requiereUsuario: true },
    { nombre: 'Archivos nunca compartidos', ruta: 'archivos-no-compartidos' },
    { nombre: 'Carpetas con más archivos', ruta: 'carpetas-mas-archivos' },
    { nombre: 'Almacenamiento por carpetas principales', ruta: 'almacenamiento-carpetas-principales/:usuarioId', requiereUsuario: true },
    { nombre: 'Contenido de una carpeta', ruta: 'contenido-carpeta/:carpetaId/usuario/:usuarioId', requiereUsuario: true, requiereCarpeta: true },
    { nombre: 'Actividad de un usuario', ruta: 'actividad-usuario/:usuarioId', requiereUsuario: true, requiereFechas: true },
    { nombre: 'Actividades por tipo', ruta: 'actividades-por-tipo' },
    { nombre: 'Actividades por periodo', ruta: 'actividades-por-periodo', requierePeriodo: true },
    { nombre: 'Acciones principales', ruta: 'acciones-principales' }
  ];

  rutaSeleccionada = 'archivos-mas-grandes';
  usuarioId = '';
  carpetaId = '';
  fechaInicio = '';
  fechaFin = '';
  periodo = 'mes';
  resultado: unknown = null;
  mensaje = '';
  cargando = false;

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  get opcionActual(): OpcionReporte {
    return this.opciones.find(
      opcion => opcion.ruta === this.rutaSeleccionada
    ) ?? this.opciones[0];
  }

  consultar(): void {
    const opcion = this.opcionActual;

    if (opcion.requiereUsuario && !this.usuarioId.trim()) {
      this.mensaje = 'Ingresa el ID del usuario solicitado.';
      return;
    }

    if (opcion.requiereCarpeta && !this.carpetaId.trim()) {
      this.mensaje = 'Ingresa el ID de la carpeta.';
      return;
    }

    if (opcion.requiereFechas && this.fechaInicio && this.fechaFin &&
        this.fechaInicio > this.fechaFin) {
      this.mensaje = 'La fecha inicial no puede ser posterior a la fecha final.';
      return;
    }

    let ruta = opcion.ruta
      .replace(':usuarioId', encodeURIComponent(this.usuarioId.trim()))
      .replace(':carpetaId', encodeURIComponent(this.carpetaId.trim()));

    const parametros = new URLSearchParams();

    if (opcion.requiereFechas) {
      if (this.fechaInicio) {
        parametros.set('fechaInicio', this.fechaInicio);
      }
      if (this.fechaFin) {
        parametros.set('fechaFin', this.fechaFin);
      }
    }

    if (opcion.requierePeriodo) {
      parametros.set('periodo', this.periodo);
    }

    const query = parametros.toString();
    if (query) {
      ruta += `?${query}`;
    }

    this.cargando = true;
    this.mensaje = '';
    this.resultado = null;
    this.cd.detectChanges();

    this.api.obtener(`reportes/${ruta}`).subscribe({
      next: respuesta => {
        this.resultado = respuesta;
       
        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
        }, 500);
      },

      error: error => {
        this.mensaje = error.error?.mensaje ||
          'No se pudo generar el reporte. Verifica tu sesión y el rol de administrador.';
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  esListaVacia(valor: unknown): boolean {
    return Array.isArray(valor) && valor.length === 0;
  }
}

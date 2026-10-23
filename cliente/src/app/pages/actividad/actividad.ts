import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/servicios/api.service';

@Component({
  selector: 'app-actividad',
  imports: [FormsModule],
  templateUrl: './actividad.html',
  styleUrl: './actividad.css'
})
export class Actividad implements OnInit {
  actividades: any[] = [];
  filtro = '';
  mensaje = '';
  cargando = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.consultar();
  }

  consultar(): void {
    this.cargando = true;
    this.mensaje = '';

    this.api.obtener('actividades').subscribe({
      next: (respuesta: any) => {
        this.actividades = Array.isArray(respuesta)
          ? respuesta
          : respuesta.actividades ?? respuesta.datos ?? [];
        this.cargando = false;
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje ||
          'No se pudo consultar el historial de actividad.';
        this.cargando = false;
      }
    });
  }

  get actividadesFiltradas(): any[] {
    const texto = this.filtro.trim().toLowerCase();

    if (!texto) {
      return this.actividades;
    }

    return this.actividades.filter((actividad) =>
      [
        actividad.accion,
        actividad.accionRealizada,
        actividad.tipo,
        actividad.usuario,
        actividad.recurso,
        actividad.nombreRecurso
      ].some(valor => String(valor ?? '').toLowerCase().includes(texto))
    );
  }
}
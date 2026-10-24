import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/servicios/api.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-actividad',
  imports: [FormsModule, DatePipe],
  templateUrl: './actividad.html',
  styleUrl: './actividad.css'
})
export class Actividad implements OnInit {
  actividades: any[] = [];
  filtro = '';
  fechaInicio = '';
  fechaFin = ''; 
  mensaje = '';
  cargando = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.consultar();
  }

  consultar(): void {
    if (this.cargando) return; 

    this.cargando = true;
    this.mensaje = '';
    this.cdr.detectChanges();

    let url = 'actividades';
    const params: string[] = [];
    
    if (this.fechaInicio) params.push(`fechaInicio=${this.fechaInicio}`);
    if (this.fechaFin) params.push(`fechaFin=${this.fechaFin}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    this.api.obtener(url).subscribe({
      next: (respuesta: any) => {
        this.actividades = Array.isArray(respuesta)
          ? respuesta
          : respuesta.actividades ?? respuesta.datos ?? [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje ||
          'No se pudo consultar el historial de actividad.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.consultar();
  }

  get actividadesFiltradas(): any[] {
    const texto = this.filtro.trim().toLowerCase();

    if (!texto) {
      return this.actividades;
    }

    return this.actividades.filter((actividad) =>
      [
        actividad.accion,
        actividad.recursoTipo,
        actividad.detalle,
        actividad.usuario?.nombre,
        actividad.usuario?.correo
      ].some(valor => String(valor ?? '').toLowerCase().includes(texto))
    );
  }
}
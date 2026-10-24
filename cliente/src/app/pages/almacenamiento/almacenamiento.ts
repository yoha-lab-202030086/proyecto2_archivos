import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/servicios/api.service';

@Component({
  selector: 'app-almacenamiento',
  standalone: true,
  imports: [],
  templateUrl: './almacenamiento.html',
  styleUrl: './almacenamiento.css'
})
export class Almacenamiento implements OnInit {
  datos: any = null;
  mensaje = '';
  cargando = false;

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.consultar();
  }

  get porcentaje(): number {
    const total = Number(this.datos?.almacenamientoTotal ?? 0);
    const usado = Number(this.datos?.almacenamientoUsado ?? 0);

    if (total <= 0)  return 0;
    if (usado <= 0) return 0;

    const calculoReal = (usado / total) * 100;

    if (calculoReal < 1) {

      const porcentajeMinimo = 1 + (usado / (1024 * 1024)) * 7;
      return Math.min(8, Math.round(porcentajeMinimo * 10) / 10);
    }

    return Math.min(100, Math.round(calculoReal * 10) / 10);
  }

  formatearBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 Bytes';
    const k = 1024;
    const tamaños = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamaños[i];
  }

  consultar(): void {
    if (this.cargando) return;

    this.cargando = true;
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.obtener('almacenamiento').subscribe({
      next: (respuesta) => {
        this.datos = respuesta;
        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
        }, 600);
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje ||
          'No se pudo consultar el almacenamiento.';
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }
}
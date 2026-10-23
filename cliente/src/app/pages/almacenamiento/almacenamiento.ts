import { Component, OnInit } from '@angular/core';
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

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.consultar();
  }

  get porcentaje(): number {
    const total = Number(this.datos?.almacenamientoTotal ?? 0);
    const usado = Number(this.datos?.almacenamientoUsado ?? 0);

    if (total <= 0) {
      return 0;
    }

const calculo = Math.round((usado / total) * 100);
    
    if (usado > 0 && calculo === 0) {
      return 1;
    }

return Math.min(100, calculo);
  }

  consultar(): void {
    this.cargando = true;
    this.mensaje = '';

    this.api.obtener('almacenamiento').subscribe({
      next: (respuesta) => {
        this.datos = respuesta;
        this.cargando = false;
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje ||
          'No se pudo consultar el almacenamiento.';
        this.cargando = false;
      }
    });
  }
}
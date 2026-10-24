import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/servicios/api.service';

@Component({
  selector: 'app-carpetas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './carpetas.html',
  styleUrl: './carpetas.css'
})
export class Carpetas implements OnInit {
  carpetas: any[] = [];
  nombre = '';
  carpetaPadre = '';
  mensaje = '';
  cargando = false;
  procesando = false;

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {} 

  ngOnInit(): void {
    this.cargarCarpetas();
  }

  cargarCarpetas(): void {
    this.cargando = true;
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.obtener('carpetas/todas').subscribe({
      next: (respuesta: any) => {
        this.carpetas = Array.isArray(respuesta) ? respuesta : [];
          setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges(); 
        }, 500);
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudieron cargar las carpetas.';
        setTimeout(() => {
        this.cargando = false;
        this.cd.detectChanges();
      }, 500)
      }
    });
  }

  crearCarpeta(): void {
    if (!this.nombre.trim()) {
      this.mensaje = 'El nombre de la carpeta es obligatorio.';
      return;
    }

    this.procesando = true;
    this.mensaje = '';

    const datos: { nombre: string; carpetaPadre?: string } = {
      nombre: this.nombre.trim()
    };

    if (this.carpetaPadre) {
      datos.carpetaPadre = this.carpetaPadre;
    }

    this.api.crear('carpetas', datos).subscribe({
      next: (respuesta: any) => {
        this.nombre = '';
        this.carpetaPadre = '';
        this.mensaje = respuesta.mensaje ||
          'Carpeta creada correctamente.';
        this.procesando = false;
        this.cargarCarpetas();
        this.cd.detectChanges(); 
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje ||
          'No se pudo crear la carpeta.';
        this.procesando = false;
        this.cd.detectChanges();
      }
    });
  }

  enviarPapelera(carpeta: any): void {
    if (!confirm(`¿Enviar "${carpeta.nombre}" a la papelera?`)) {
      return;
    }

    this.procesando = true;
    this.mensaje = '';

    this.api.eliminar(`papelera/carpeta/${carpeta._id}`).subscribe({
      next: () => {
        this.mensaje = 'Carpeta enviada a la papelera.';
        this.procesando = false;
        this.cargarCarpetas();
        this.cd.detectChanges();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje ||
          'No se pudo enviar la carpeta a la papelera.';
        this.procesando = false;
        this.cd.detectChanges();
      }
    });
  }
    renombrarCarpeta(carpeta: any): void {
    const nuevoNombre = prompt('Introduce el nuevo nombre para la carpeta:', carpeta.nombre);
    
    if (nuevoNombre === null) return; 
    
    if (!nuevoNombre.trim()) {
      this.mensaje = 'El nombre de la carpeta no puede estar vacío.';
      return;
    }

    this.procesando = true;
    this.mensaje = '';

    this.api.actualizar(`carpetas/${carpeta._id}`, { nombre: nuevoNombre.trim() }).subscribe({
      next: (respuesta: any) => {
        this.mensaje = 'Carpeta renombrada con éxito.';
        this.procesando = false;
        this.cargarCarpetas();
        this.cd.detectChanges();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudo renombrar la carpeta.';
        this.procesando = false;
        this.cd.detectChanges();
      }
    });
  }

    moverCarpeta(carpeta: any): void {
    const opcionesDisponibles = this.carpetas.filter(c => c._id !== carpeta._id);
    
    let mensajePrompt = `Introduce el NÚMERO del nuevo destino para "${carpeta.nombre}":\n\n0. Mover a la Raíz (Carpeta Principal)\n`;
    opcionesDisponibles.forEach((c, index) => {
      mensajePrompt += `${index + 1}. Mover dentro de: "${c.nombre}"\n`;
    });

    const seleccion = prompt(mensajePrompt);
    
    if (seleccion === null) return;

    const numeroSeleccionado = parseInt(seleccion, 10);

    if (isNaN(numeroSeleccionado) || numeroSeleccionado < 0 || numeroSeleccionado > opcionesDisponibles.length) {
      this.mensaje = 'Selección inválida. Inténtalo de nuevo.';
      return;
    }

    const nuevoPadreId = numeroSeleccionado === 0 ? null : opcionesDisponibles[numeroSeleccionado - 1]._id;

    this.procesando = true;
    this.mensaje = '';

    this.api.actualizar(`carpetas/${carpeta._id}`, { nombre: carpeta.nombre, carpetaPadre: nuevoPadreId }).subscribe({
      next: () => {
        this.mensaje = 'Carpeta movida de ubicación con éxito.';
        this.procesando = false;
        this.cargarCarpetas();
        this.cd.detectChanges();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudo mover la carpeta.';
        this.procesando = false;
        this.cd.detectChanges();
      }
    });
  }


  obtenerNombrePadre(carpeta: any): string {
    if (!carpeta.carpetaPadre) {
      return 'Carpeta principal';
    }
  
    if (typeof carpeta.carpetaPadre === 'object' && carpeta.carpetaPadre.nombre) {
      return `Subcarpeta de: ${carpeta.carpetaPadre.nombre}`;
    }
    
    const padre = this.carpetas.find(c => c._id === carpeta.carpetaPadre);
    return padre ? `Subcarpeta de: ${padre.nombre}` : 'Carpeta principal';
  }

  obtenerNivel(carpeta: any): number {
    let nivel = 0;
    let actual = carpeta;

    while (actual && actual.carpetaPadre) {
      nivel++;
      const padreId = typeof actual.carpetaPadre === 'object' ? actual.carpetaPadre._id : actual.carpetaPadre;
      actual = this.carpetas.find(c => c._id === padreId);
    }
    
    return nivel;
  }
}
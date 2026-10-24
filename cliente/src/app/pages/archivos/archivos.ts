import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/servicios/api.service';

@Component({
  selector: 'app-archivos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './archivos.html',
  styleUrl: './archivos.css'
})
export class Archivos implements OnInit {
  archivos: any[] = [];
  carpetas: any[] = [];
  archivoSeleccionado: File | null = null;
  carpetaId = '';
  buscando = '';
  mensaje = '';
  cargando = false;
  procesando = false; 

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarArchivos();
    this.cargarCarpetas();
  }

  cargarArchivos(): void {
    this.cargando = true;
    this.mensaje = '';
    this.cd.detectChanges();

    const texto = this.buscando.trim();
    const ruta = texto
      ? `archivos/buscar?texto=${encodeURIComponent(texto)}`
      : 'archivos';

    this.api.obtener(ruta).subscribe({
      next: (respuesta: any) => {
        const datosArreglo = Array.isArray(respuesta) ? respuesta : [];
        this.archivos = datosArreglo.map((arc: any) => {
          return {
            ...arc,          
            tamanio: arc.tamaño 
          };
        });
        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
        }, 500);
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudieron cargar los archivos. Inicia sesión nuevamente si tu token venció.';
       setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
        }, 500);
      }
    });
  }

  cargarCarpetas(): void {
    this.api.obtener('carpetas/todas').subscribe({
      next: (respuesta: any) => {
        this.carpetas = Array.isArray(respuesta) ? respuesta : [];
        this.cd.detectChanges();
      },
      error: () => {
        this.carpetas = [];
        this.cd.detectChanges();
      }
    });
  }

  seleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.archivoSeleccionado = input.files?.[0] ?? null;
    this.cd.detectChanges();
  }

  subirArchivo(): void {
    // Validar seleccion
    if (!this.archivoSeleccionado) {
      this.mensaje = 'Selecciona un archivo antes de subirlo.';
      return;
    }

    const nombreArchivo = this.archivoSeleccionado.name.toLowerCase();
    if (!nombreArchivo.endsWith('.txt') && !nombreArchivo.endsWith('.md')) {
      this.mensaje = 'Tipo de archivo no permitido. Solo se aceptan documentos .txt y .md';
      return;
    }

    // Validar tamaño en el navegador
    const maximoBytes = 20 * 1024 * 1024;
    if (this.archivoSeleccionado.size > maximoBytes) {
      this.mensaje = 'El archivo supera los 20 MB permitidos por esta interfaz.';
      return;
    }

    // Control de carga
    this.procesando = true;
    this.mensaje = '';
    this.cd.detectChanges();

    const datos = new FormData();
    datos.append('archivo', this.archivoSeleccionado);

    if (this.carpetaId) {
      datos.append('carpeta', this.carpetaId);
    }

    this.api.crear('archivos', datos).subscribe({
      next: () => {
        this.mensaje = 'Archivo subido correctamente.';
        this.archivoSeleccionado = null;

      const fileInput = document.getElementById('archivo') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        this.procesando = false; 
        this.cargarArchivos();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudo subir el archivo.';
        this.procesando = false; 
        this.cd.detectChanges();
      }
    });
  }

  descargar(archivo: any): void {
    this.procesando = true; 
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.descargarArchivo(archivo._id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = archivo.nombre || 'documento';
        enlace.click();
        URL.revokeObjectURL(url);
        this.procesando = false; 
        this.cd.detectChanges();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudo descargar el archivo.';
        this.procesando = false; 
        this.cd.detectChanges();
      }
    });
  }

  renombrar(archivo: any): void {
    // Confirmar renombrado 
    const nuevoNombre = prompt('Introduce el nuevo nombre:', archivo.nombre);

    if (!nuevoNombre?.trim()) {
      return;
    }

    this.procesando = true; 
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.actualizar(
      `archivos/${archivo._id}/renombrar`,
      { nombre: nuevoNombre.trim() } 
    ).subscribe({
      next: () => {
        this.mensaje = 'Archivo renombrado correctamente.';
        this.procesando = false; 
        this.cargarArchivos();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudo renombrar el archivo.';
        this.procesando = false; 
        this.cd.detectChanges();
      }
    });
  }

  mover(archivo: any, carpetaDestino: string): void {
    this.procesando = true; 
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.actualizar(
      `archivos/${archivo._id}/mover`,
      { carpetaId: carpetaDestino || null }
    ).subscribe({
      next: () => {
        this.mensaje = 'Archivo movido correctamente.';
        this.procesando = false; 
        this.cargarArchivos();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudo mover el archivo.';
        this.procesando = false; 
        this.cd.detectChanges();
      }
    });
  }
 
  enviarPapelera(archivo: any): void {
    // Confirmar eliminacion
    if (!confirm('¿Quieres enviar este archivo a la papelera?')) {
      return;
    }

    this.procesando = true; 
    this.mensaje = '';
    this.cd.detectChanges();

    this.api.eliminar(`papelera/archivo/${archivo._id}`).subscribe({
      next: () => {
        this.mensaje = 'Archivo enviado a la papelera.';
        this.procesando = false;
        this.cargarArchivos();
      },
      error: (error) => {
        this.mensaje = error.error?.mensaje || 'No se pudo enviar el archivo a la papelera.';
        this.procesando = false; 
        this.cd.detectChanges();
      }
    });
  }
}

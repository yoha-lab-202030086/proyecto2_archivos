import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly urlBase = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private opcionesAuth() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders(
        token ? { Authorization: `Bearer ${token}` } : {}
      )
    };
  }

  iniciarSesion(datos: { [key: string]: string }) {
    return this.http.post(`${this.urlBase}/auth/login`, datos);
  }

  obtener(ruta: string) {
    return this.http.get(`${this.urlBase}/${ruta}`,
      this.opcionesAuth());
  }

  crear(ruta: string, datos: unknown) {
    return this.http.post(`${this.urlBase}/${ruta}`, datos,
      this.opcionesAuth());
  }

  actualizar(ruta: string, datos: unknown) {
    return this.http.put(`${this.urlBase}/${ruta}`, datos,
      this.opcionesAuth());
  }

  eliminar(ruta: string) {
    return this.http.delete(`${this.urlBase}/${ruta}`,
      this.opcionesAuth());
  }

  descargarArchivo(id: string) {
    return this.http.get(`${this.urlBase}/archivos/${encodeURIComponent(id)}/descargar`,
      {
        ...this.opcionesAuth(),
        responseType: 'blob'
      }
    );
  }

  cerrarSesion(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}
}
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { Login } from './pages/login/login';
import { Inicio } from './pages/inicio/inicio';
import { Carpetas } from './pages/carpetas/carpetas';
import { Archivos } from './pages/archivos/archivos';
import { Papelera } from './pages/papelera/papelera';
import { Almacenamiento } from './pages/almacenamiento/almacenamiento';
import { Actividad } from './pages/actividad/actividad';
import { Usuarios } from './pages/usuarios/usuarios';
import { Permisos } from './pages/permisos/permisos';
import { Reportes } from './pages/reportes/reportes';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'inicio', component: Inicio, canActivate: [authGuard] },
  { path: 'carpetas', component: Carpetas, canActivate: [authGuard] },
  { path: 'archivos', component: Archivos, canActivate: [authGuard] },
  { path: 'papelera', component: Papelera, canActivate: [authGuard] },
  { path: 'almacenamiento', component: Almacenamiento, canActivate: [authGuard] },
  { path: 'actividad', component: Actividad, canActivate: [authGuard] },
  { path: 'usuarios', component: Usuarios, canActivate: [authGuard] },
  { path: 'permisos', component: Permisos, canActivate: [authGuard] },
  { path: 'reportes', component: Reportes, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
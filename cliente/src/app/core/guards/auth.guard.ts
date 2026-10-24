
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
 
  const token = localStorage.getItem('token') || localStorage.getItem('usuario');

  if (!token || token.trim() === '' || token.split('.').length !== 3) {
    return router.createUrlTree(['/login']);
  }

  const rolesEsperados = route.data['roles'] as Array<string>;
  
  if (rolesEsperados && rolesEsperados.length > 0) {
    try {
   
      const payloadBase64 = token.split('.')[1];
      const payloadDecodificado = atob(payloadBase64);
      const datosUsuario = JSON.parse(payloadDecodificado);
      
      const rolUsuario = (datosUsuario?.rol || '').toString().toUpperCase();

      if (!rolesEsperados.includes(rolUsuario)) {
        return router.createUrlTree(['/inicio']);
      }
    } catch (e) {
      return router.createUrlTree(['/inicio']);
    }
  }

  return true;
};

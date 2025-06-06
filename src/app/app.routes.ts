import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'asistencia', // Redirige a la página de asistencia por defecto
    pathMatch: 'full'
  },
  {
    path: 'asistencia',
    // Carga perezosa del componente standalone de gestión de asistencia
    loadComponent: () =>
      import('./attendance/attendance-page/attendance-page.component')
        .then(m => m.AttendancePageComponent)
  },
  // Podrías tener una ruta para "not found"
   { path: '**', redirectTo: 'asistencia' } // O un componente específico de "Página no encontrada"
];
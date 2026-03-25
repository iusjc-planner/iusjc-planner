import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { ForbiddenComponent } from './shared/pages/forbidden/forbidden.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent
  },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'dashboard-teacher',
        canActivate: [RoleGuard],
        data: { roles: ['ENSEIGNANT'] },
        loadChildren: () => import('./features/dashboard-teacher/dashboard-teacher.module').then(m => m.DashboardTeacherModule)
      },
      {
        path: 'users',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
      },
      {
        path: 'teachers',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/teachers/teachers.module').then(m => m.TeachersModule)
      },
      {
        path: 'schools',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/schools/schools.module').then(m => m.SchoolsModule)
      },
      {
        path: 'rooms',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/rooms/rooms.module').then(m => m.RoomsModule)
      },
      {
        path: 'courses',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/courses/courses.module').then(m => m.CoursesModule)
      },
      {
        path: 'matieres',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/matieres/matieres.module').then(m => m.MatieresModule)
      },
      {
        path: 'groups',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/groups/groups.module').then(m => m.GroupsModule)
      },
      {
        path: 'reservations',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/reservations/reservations.module').then(m => m.ReservationsModule)
      },
      {
        path: 'resources',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'ENSEIGNANT'] },
        loadChildren: () => import('./features/resources/resources.module').then(m => m.ResourcesModule)
      },
      {
        path: 'notifications',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'ENSEIGNANT'] },
        loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule)
      },
      {
        path: 'search',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'ENSEIGNANT'] },
        loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule)
      },
      {
        path: 'schedules',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'ENSEIGNANT'] },
        loadChildren: () => import('./features/schedules/schedules.module').then(m => m.SchedulesModule)
      },
      {
        path: 'settings',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

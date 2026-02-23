import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

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
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'dashboard-teacher',
        loadChildren: () => import('./features/dashboard-teacher/dashboard-teacher.module').then(m => m.DashboardTeacherModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
      },
      {
        path: 'teachers',
        loadChildren: () => import('./features/teachers/teachers.module').then(m => m.TeachersModule)
      },
      {
        path: 'schools',
        loadChildren: () => import('./features/schools/schools.module').then(m => m.SchoolsModule)
      },
      {
        path: 'rooms',
        loadChildren: () => import('./features/rooms/rooms.module').then(m => m.RoomsModule)
      },
      {
        path: 'courses',
        loadChildren: () => import('./features/courses/courses.module').then(m => m.CoursesModule)
      },
      {
        path: 'matieres',
        loadChildren: () => import('./features/matieres/matieres.module').then(m => m.MatieresModule)
      },
      {
        path: 'groups',
        loadChildren: () => import('./features/groups/groups.module').then(m => m.GroupsModule)
      },
      {
        path: 'reservations',
        loadChildren: () => import('./features/reservations/reservations.module').then(m => m.ReservationsModule)
      },
      {
        path: 'resources',
        loadChildren: () => import('./features/resources/resources.module').then(m => m.ResourcesModule)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule)
      },
      {
        path: 'search',
        loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule)
      },
      {
        path: 'schedules',
        loadChildren: () => import('./features/schedules/schedules.module').then(m => m.SchedulesModule)
      },
      {
        path: 'settings',
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

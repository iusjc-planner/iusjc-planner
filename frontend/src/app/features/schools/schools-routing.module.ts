import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolListComponent } from './school-list/school-list.component';
import { SchoolDetailComponent } from './school-detail/school-detail.component';
import { SchoolFormComponent } from './school-form/school-form.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { 
    path: '', 
    component: SchoolListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'new', 
    component: SchoolFormComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  { 
    path: ':id', 
    component: SchoolDetailComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: ':id/edit', 
    component: SchoolFormComponent,
    canActivate: [AuthGuard, AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolsRoutingModule { }
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { 
    path: '', 
    component: UserListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'new', 
    component: UserFormComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  { 
    path: ':id', 
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: ':id/edit', 
    component: UserFormComponent,
    canActivate: [AuthGuard, AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }

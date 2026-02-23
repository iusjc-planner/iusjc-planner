import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherListComponent } from './teacher-list/teacher-list.component';
import { TeacherDetailComponent } from './teacher-detail/teacher-detail.component';
import { TeacherAvailabilityComponent } from './teacher-availability/teacher-availability.component';
import { TeacherFormComponent } from './teacher-form/teacher-form.component';

const routes: Routes = [
  { path: '', component: TeacherListComponent },
  { path: 'new', component: TeacherFormComponent },
  { path: ':id', component: TeacherDetailComponent },
  { path: ':id/edit', component: TeacherFormComponent },
  { path: ':id/availability', component: TeacherAvailabilityComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeachersRoutingModule { }

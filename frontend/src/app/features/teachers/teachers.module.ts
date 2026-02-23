import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TeachersRoutingModule } from './teachers-routing.module';
import { TeacherListComponent } from './teacher-list/teacher-list.component';
import { TeacherDetailComponent } from './teacher-detail/teacher-detail.component';
import { TeacherAvailabilityComponent } from './teacher-availability/teacher-availability.component';
import { TeacherFormComponent } from './teacher-form/teacher-form.component';

@NgModule({
  declarations: [
    TeacherListComponent,
    TeacherDetailComponent,
    TeacherAvailabilityComponent,
    TeacherFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    TeachersRoutingModule
  ]
})
export class TeachersModule { }

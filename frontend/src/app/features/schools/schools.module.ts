import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SchoolsRoutingModule } from './schools-routing.module';
import { SchoolListComponent } from './school-list/school-list.component';
import { SchoolDetailComponent } from './school-detail/school-detail.component';
import { SchoolFormComponent } from './school-form/school-form.component';

@NgModule({
  declarations: [
    SchoolListComponent,
    SchoolDetailComponent,
    SchoolFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SchoolsRoutingModule
  ]
})
export class SchoolsModule { }
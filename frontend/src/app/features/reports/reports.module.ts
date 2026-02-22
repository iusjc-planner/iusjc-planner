import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportDashboardComponent } from './report-dashboard/report-dashboard.component';
import { ReportRoomsComponent } from './report-rooms/report-rooms.component';
import { ReportTeachersComponent } from './report-teachers/report-teachers.component';

@NgModule({
  declarations: [
    ReportDashboardComponent,
    ReportRoomsComponent,
    ReportTeachersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ReportsRoutingModule
  ]
})
export class ReportsModule { }

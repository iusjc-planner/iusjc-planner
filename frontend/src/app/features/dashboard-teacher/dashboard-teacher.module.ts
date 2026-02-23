import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardTeacherRoutingModule } from './dashboard-teacher-routing.module';
import { DashboardTeacherComponent } from './dashboard-teacher.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    DashboardTeacherComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DashboardTeacherRoutingModule
  ]
})
export class DashboardTeacherModule { }

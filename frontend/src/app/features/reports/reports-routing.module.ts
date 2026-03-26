import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportDashboardComponent } from './report-dashboard/report-dashboard.component';
import { ReportRoomsComponent } from './report-rooms/report-rooms.component';
import { ReportTeachersComponent } from './report-teachers/report-teachers.component';

const routes: Routes = [
  { path: '', component: ReportDashboardComponent },
  { path: 'rooms', component: ReportRoomsComponent },
  { path: 'teachers', component: ReportTeachersComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {}

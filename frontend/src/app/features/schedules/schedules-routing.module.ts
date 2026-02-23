import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScheduleGlobalComponent } from './schedule-global/schedule-global.component';
import { ScheduleTeacherComponent } from './schedule-teacher/schedule-teacher.component';
import { ScheduleRoomComponent } from './schedule-room/schedule-room.component';
import { ScheduleGroupComponent } from './schedule-group/schedule-group.component';
import { ScheduleFormComponent } from './schedule-form/schedule-form.component';
import { SessionCreateComponent } from './session-create/session-create.component';
import { SessionGenerateComponent } from './session-generate/session-generate.component';

const routes: Routes = [
  { path: '', component: ScheduleGlobalComponent },
  { path: 'new', component: ScheduleFormComponent },
  { path: 'session/new', component: SessionCreateComponent },
  { path: 'session/generate', component: SessionGenerateComponent },
  { path: ':id/edit', component: ScheduleFormComponent },
  { path: 'teacher', component: ScheduleTeacherComponent },
  { path: 'room', component: ScheduleRoomComponent },
  { path: 'group', component: ScheduleGroupComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulesRoutingModule {}

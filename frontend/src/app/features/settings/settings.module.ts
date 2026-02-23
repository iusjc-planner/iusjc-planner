import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsGeneralComponent } from './settings-general/settings-general.component';
import { SettingsAcademicYearComponent } from './settings-academic-year/settings-academic-year.component';
import { SettingsSchedulesComponent } from './settings-schedules/settings-schedules.component';
import { SettingsIntegrationsComponent } from './settings-integrations/settings-integrations.component';

@NgModule({
  declarations: [
    SettingsGeneralComponent,
    SettingsAcademicYearComponent,
    SettingsSchedulesComponent,
    SettingsIntegrationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }

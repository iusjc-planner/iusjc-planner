import { Routes } from '@angular/router';
import { SettingsProfileComponent } from './settings-profile/settings-profile.component';

export const SETTINGS_ROUTES: Routes = [
  { path: '', component: SettingsProfileComponent },
  { path: 'profile', component: SettingsProfileComponent }
];

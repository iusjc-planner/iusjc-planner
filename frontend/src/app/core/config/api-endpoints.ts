import { environment } from '../../../environments/environment';

export const ApiEndpoints = {
  auth: environment.authUrl,
  users: `${environment.apiUrl}/users`,
  teachers: `${environment.apiUrl}/teachers`,
  rooms: `${environment.apiUrl}/rooms`,
  courses: `${environment.apiUrl}/courses`,
  schedule: `${environment.apiUrl}/schedule`,
  groups: `${environment.apiUrl}/groups`,
  schools: `${environment.apiUrl}/schools`,
  matieres: `${environment.apiUrl}/matieres`,
  notifications: `${environment.apiUrl}/notifications`,
  reports: `${environment.apiUrl}/reports`
};

import { Routes } from '@angular/router';
import { CourseListComponent } from './course-list/course-list.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { CourseFormComponent } from './course-form/course-form.component';

export const COURSES_ROUTES: Routes = [
  { path: '', component: CourseListComponent },
  { path: 'new', component: CourseFormComponent },
  { path: ':id', component: CourseDetailComponent },
  { path: ':id/edit', component: CourseFormComponent }
];

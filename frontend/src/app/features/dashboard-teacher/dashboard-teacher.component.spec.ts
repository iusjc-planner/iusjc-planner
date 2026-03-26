import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { DashboardTeacherComponent } from './dashboard-teacher.component';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { TeacherService } from '../../core/services/teacher.service';
import { CourseService } from '../../core/services/course.service';

describe('DashboardTeacherComponent', () => {
  let component: DashboardTeacherComponent;
  let fixture: ComponentFixture<DashboardTeacherComponent>;

  beforeEach(async () => {
    const authServiceStub = { getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({ login: 'ens' }) };
    const userServiceStub = { getUserByLogin: jasmine.createSpy('getUserByLogin').and.returnValue(of({ id: 1, email: 'ens@iusj.local' })) };
    const teacherServiceStub = { getAllTeachers: jasmine.createSpy('getAllTeachers').and.returnValue(of([{ id: 10, userId: 1, email: 'ens@iusj.local' }])) };
    const courseServiceStub = { getAll: jasmine.createSpy('getAll').and.returnValue(of([])) };

    await TestBed.configureTestingModule({
      declarations: [DashboardTeacherComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UserService, useValue: userServiceStub },
        { provide: TeacherService, useValue: teacherServiceStub },
        { provide: CourseService, useValue: courseServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

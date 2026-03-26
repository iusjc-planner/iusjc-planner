import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { UserService } from '../../core/services/user.service';
import { TeacherService } from '../../core/services/teacher.service';
import { RoomService } from '../../core/services/room.service';
import { CourseService } from '../../core/services/course.service';
import { ScheduleService } from '../../core/services/schedule.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const userServiceStub = { getAllUsers: jasmine.createSpy('getAllUsers').and.returnValue(of([])) };
    const teacherServiceStub = { getAllTeachers: jasmine.createSpy('getAllTeachers').and.returnValue(of([])) };
    const roomServiceStub = { getAll: jasmine.createSpy('getAll').and.returnValue(of([])) };
    const courseServiceStub = { getAll: jasmine.createSpy('getAll').and.returnValue(of([])) };
    const scheduleServiceStub = { stats: jasmine.createSpy('stats').and.returnValue(of({ total: 0, scheduled: 0, completed: 0, cancelled: 0 })) };

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: UserService, useValue: userServiceStub },
        { provide: TeacherService, useValue: teacherServiceStub },
        { provide: RoomService, useValue: roomServiceStub },
        { provide: CourseService, useValue: courseServiceStub },
        { provide: ScheduleService, useValue: scheduleServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

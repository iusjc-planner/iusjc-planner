import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { LayoutService } from '../../services/layout.service';
import { NotificationCenterService } from '../../../features/notifications/services/notification.service';
import { NotificationService } from '../../services/notification.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    const layoutServiceSpy = jasmine.createSpyObj<LayoutService>('LayoutService', ['toggleSidebar', 'toggleOffcanvas']);
    const notificationCenterServiceStub = {
      notifications$: of([]),
      unreadCount$: of(0),
      loading$: of(false),
      refresh: jasmine.createSpy('refresh'),
      markAsRead: jasmine.createSpy('markAsRead').and.returnValue(of({})),
      markAllAsRead: jasmine.createSpy('markAllAsRead').and.returnValue(of(void 0)),
      delete: jasmine.createSpy('delete').and.returnValue(of(void 0))
    };
    const toastServiceSpy = jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error']);

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: LayoutService, useValue: layoutServiceSpy },
        { provide: NotificationCenterService, useValue: notificationCenterServiceStub },
        { provide: NotificationService, useValue: toastServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

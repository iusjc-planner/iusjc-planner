import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { SidebarComponent } from './sidebar.component';
import { NavigationService } from '../../services/navigation.service';
import { AuthService } from '../../../core/services/auth.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    const navigationServiceStub = {
      getMenuItems: jasmine.createSpy('getMenuItems').and.returnValue([])
    };
    const authServiceStub = {
      currentUser$: of(null),
      getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(null),
      isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false)
    };

    await TestBed.configureTestingModule({
      declarations: [SidebarComponent],
      providers: [
        { provide: NavigationService, useValue: navigationServiceStub },
        { provide: AuthService, useValue: authServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

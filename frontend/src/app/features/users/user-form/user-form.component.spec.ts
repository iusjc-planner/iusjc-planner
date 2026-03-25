import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { UserFormComponent } from './user-form.component';
import { UserService } from '../../../core/services/user.service';
import { SchoolService } from '../../../core/services/school.service';
import { NotificationService } from '../../../shared/services/notification.service';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        {
          provide: UserService,
          useValue: {
            getUserById: () => of({}),
            createUser: () => of({}),
            updateUser: () => of({}),
            checkEmailExists: () => of(false),
            checkLoginExists: () => of(false)
          }
        },
        { provide: SchoolService, useValue: { getAllSchools: () => of([]) } },
        {
          provide: NotificationService,
          useValue: { success: () => {}, warning: () => {}, error: () => {} }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should require school when role is ENSEIGNANT', () => {
    component.userForm.patchValue({ role: 'ENSEIGNANT', schoolId: null });
    component.userForm.get('schoolId')?.markAsTouched();

    expect(component.userForm.get('schoolId')?.hasError('required')).toBeTrue();
  });

  it('should not require school when role is ADMIN', () => {
    component.userForm.patchValue({ role: 'ADMIN', schoolId: null });
    component.userForm.get('schoolId')?.updateValueAndValidity();

    expect(component.userForm.get('schoolId')?.hasError('required')).toBeFalse();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../../core/services/user.service';
import { SchoolService } from '../../../core/services/school.service';
import { NotificationService } from '../../../shared/services/notification.service';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  const users = [
    {
      id: 1,
      nom: 'Admin',
      prenom: 'Root',
      email: 'admin@iusj.cm',
      login: 'admin',
      telephone: 123,
      role: 'ADMIN',
      status: 'ACTIVE',
      schoolId: 1
    },
    {
      id: 2,
      nom: 'Prof',
      prenom: 'Jane',
      email: 'jane@iusj.cm',
      login: 'jane',
      telephone: 456,
      role: 'ENSEIGNANT',
      status: 'INACTIVE',
      schoolId: 2
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [FormsModule],
      providers: [
        { provide: UserService, useValue: { getAllUsers: () => of(users), deleteUser: () => of(void 0) } },
        {
          provide: SchoolService,
          useValue: { getAllSchools: () => of([{ id: 1, name: 'SJI' }, { id: 2, name: 'SJM' }]) }
        },
        { provide: NotificationService, useValue: { success: () => {}, error: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should filter by role and school', () => {
    component.filterRole = 'ENSEIGNANT';
    component.filterSchoolId = '2';
    component.filterUsers();

    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].login).toBe('jane');
  });
});

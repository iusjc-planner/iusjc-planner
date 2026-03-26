import { of, throwError } from 'rxjs';
import { AppTopbar } from './app.topbar';
import { AuthService } from '../../core/services/auth.service';
import { NotificationApiService } from '../../core/services/notification-api.service';
import { Router } from '@angular/router';

describe('AppTopbar', () => {
    let authService: jasmine.SpyObj<AuthService>;
    let notificationApiService: jasmine.SpyObj<NotificationApiService>;
    let router: jasmine.SpyObj<Router>;
    let topbar: AppTopbar;

    beforeEach(() => {
        authService = jasmine.createSpyObj<AuthService>('AuthService', ['logout', 'getRole']);
        notificationApiService = jasmine.createSpyObj<NotificationApiService>('NotificationApiService', ['getAll']);
        router = jasmine.createSpyObj<Router>('Router', ['navigate']);

        authService.getRole.and.returnValue('ADMIN');
        notificationApiService.getAll.and.returnValue(
            of([
                { id: 1, titre: 'A', message: 'A', lu: false },
                { id: 2, titre: 'B', message: 'B', lu: true }
            ])
        );

        const layoutServiceMock = {
            layoutConfig: { update: jasmine.createSpy('update') },
            isDarkTheme: () => false
        } as any;

        topbar = new AppTopbar(layoutServiceMock, authService, notificationApiService, router);
    });

    it('loads unread notifications on init', () => {
        topbar.ngOnInit();

        expect(notificationApiService.getAll).toHaveBeenCalled();
        expect(topbar.unreadCount).toBe(1);

        topbar.ngOnDestroy();
    });

    it('routes notifications according to role', () => {
        authService.getRole.and.returnValue('TEACHER');

        topbar.navigateToNotifications();

        expect(router.navigate).toHaveBeenCalledWith(['/pages/notifications']);
    });

    it('resets badge count when notification loading fails', () => {
        notificationApiService.getAll.and.returnValue(throwError(() => new Error('boom')));

        topbar.ngOnInit();

        expect(topbar.unreadCount).toBe(0);

        topbar.ngOnDestroy();
    });

    it('triggers logout action', () => {
        topbar.logout();

        expect(authService.logout).toHaveBeenCalled();
    });
});

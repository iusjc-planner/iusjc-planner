import { of, throwError } from 'rxjs';
import { NotificationsPage } from './notifications';
import { NotificationApiService } from '../../core/services/notification-api.service';
import { NotificationService } from '../../core/services/notification.service';

describe('NotificationsPage', () => {
    let notificationApiService: jasmine.SpyObj<NotificationApiService>;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let page: NotificationsPage;

    beforeEach(() => {
        notificationApiService = jasmine.createSpyObj<NotificationApiService>('NotificationApiService', ['getAll', 'markAsRead', 'markAllAsRead', 'delete']);
        notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['info', 'error']);

        notificationApiService.getAll.and.returnValue(
            of([
                { id: 1, titre: 'Alerte', message: 'Conflit', lu: false },
                { id: 2, titre: 'Info', message: 'Planification OK', lu: true }
            ])
        );
        notificationApiService.markAsRead.and.returnValue(of({ id: 1, titre: 'Alerte', message: 'Conflit', lu: true }));
        notificationApiService.markAllAsRead.and.returnValue(of(void 0));
        notificationApiService.delete.and.returnValue(of(void 0));

        page = new NotificationsPage(notificationApiService, notificationService);
    });

    it('loads notifications on init', () => {
        page.ngOnInit();

        expect(notificationApiService.getAll).toHaveBeenCalled();
        expect(page.notificationsList.length).toBe(2);
        expect(page.loading).toBeFalse();
    });

    it('marks an item as read', () => {
        page.notificationsList = [{ id: 1, titre: 'Alerte', message: 'Conflit', lu: false }];

        page.markAsRead(page.notificationsList[0]);

        expect(notificationApiService.markAsRead).toHaveBeenCalledWith(1);
        expect(page.notificationsList[0].lu).toBeTrue();
        expect(notificationService.info).toHaveBeenCalled();
    });

    it('marks all items as read', () => {
        page.notificationsList = [
            { id: 1, titre: 'Alerte', message: 'Conflit', lu: false },
            { id: 2, titre: 'Info', message: 'Planification', lu: false }
        ];

        page.markAllAsRead();

        expect(notificationApiService.markAllAsRead).toHaveBeenCalled();
        expect(page.notificationsList.every((item) => item.lu)).toBeTrue();
        expect(notificationService.info).toHaveBeenCalled();
    });

    it('deletes one notification', () => {
        page.notificationsList = [
            { id: 1, titre: 'Alerte', message: 'Conflit', lu: false },
            { id: 2, titre: 'Info', message: 'Planification', lu: false }
        ];

        page.deleteNotification(page.notificationsList[0]);

        expect(notificationApiService.delete).toHaveBeenCalledWith(1);
        expect(page.notificationsList.length).toBe(1);
        expect(page.notificationsList[0].id).toBe(2);
    });

    it('handles loading error', () => {
        notificationApiService.getAll.and.returnValue(throwError(() => new Error('boom')));

        page.ngOnInit();

        expect(page.loading).toBeFalse();
        expect(notificationService.error).toHaveBeenCalled();
    });
});

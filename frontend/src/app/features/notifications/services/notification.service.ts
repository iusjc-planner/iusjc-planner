import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationApiService } from '../../../core/services/notification-api.service';
import { UserService } from '../../../core/services/user.service';
import { UserNotification } from '../../../shared/models/notification.model';
import { NotificationService as ToastNotificationService } from '../../../shared/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationCenterService {
  private readonly pollingIntervalMs = 30000;
  private readonly notificationsSubject = new BehaviorSubject<UserNotification[]>([]);
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private userId: number | null = null;
  private pollingSubscription: Subscription | null = null;

  readonly notifications$ = this.notificationsSubject.asObservable();
  readonly unreadCount$ = this.unreadCountSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationApiService: NotificationApiService,
    private toastService: ToastNotificationService
  ) {
    this.authService.currentUser$
      .pipe(
        switchMap(user => {
          if (!user?.login) {
            return of(null);
          }
          return this.userService.getUserByLogin(user.login).pipe(
            map(foundUser => foundUser?.id ?? null),
            catchError(() => of(null))
          );
        })
      )
      .subscribe(foundUserId => {
        this.userId = foundUserId;
        if (this.userId) {
          this.refresh(false);
          this.startPolling();
        } else {
          this.stopPolling();
          this.notificationsSubject.next([]);
          this.unreadCountSubject.next(0);
        }
      });
  }

  refresh(silent: boolean = true): void {
    if (!this.userId) {
      return;
    }

    this.loadingSubject.next(true);
    this.notificationApiService.getAll({ userId: this.userId })
      .pipe(
        map(notifications => this.sortByDateDescending(notifications)),
        tap(notifications => {
          this.notificationsSubject.next(notifications);
          this.unreadCountSubject.next(notifications.filter(notification => !notification.read).length);
          this.loadingSubject.next(false);
        }),
        catchError(() => {
          this.loadingSubject.next(false);
          if (!silent) {
            this.toastService.error('Impossible de charger les notifications.');
          }
          return of([]);
        })
      )
      .subscribe();
  }

  markAsRead(notificationId: number): Observable<UserNotification> {
    return this.notificationApiService.markAsRead(notificationId).pipe(
      tap(updated => {
        const notifications = this.notificationsSubject.value.map(notification =>
          notification.id === notificationId ? { ...notification, ...updated, read: true } : notification
        );
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(notifications.filter(notification => !notification.read).length);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    if (!this.userId) {
      return of(void 0);
    }

    return this.notificationApiService.markAllAsRead(this.userId).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.map(notification => ({
          ...notification,
          read: true
        }));
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(0);
      })
    );
  }

  delete(notificationId: number): Observable<void> {
    return this.notificationApiService.delete(notificationId).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.filter(notification => notification.id !== notificationId);
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(notifications.filter(notification => !notification.read).length);
      })
    );
  }

  private startPolling(): void {
    if (this.pollingSubscription) {
      return;
    }

    this.pollingSubscription = new Subscription();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.refresh(true);
      }
    }, this.pollingIntervalMs);

    this.pollingSubscription.add({
      unsubscribe: () => window.clearInterval(intervalId)
    });
  }

  private stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = null;
  }

  private sortByDateDescending(notifications: UserNotification[]): UserNotification[] {
    return [...notifications].sort((first, second) => {
      const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      return secondDate - firstDate;
    });
  }
}

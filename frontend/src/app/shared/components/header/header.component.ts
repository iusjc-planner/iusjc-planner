import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { Router } from '@angular/router';
import { UserNotification } from '../../models/notification.model';
import { NotificationCenterService } from '../../../features/notifications/services/notification.service';
import { NotificationService } from '../../services/notification.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  notifications: UserNotification[] = [];
  unreadCount = 0;
  loadingNotifications = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    public layoutService: LayoutService,
    private notificationCenterService: NotificationCenterService,
    private toastService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.notificationCenterService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    this.notificationCenterService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(unreadCount => {
        this.unreadCount = unreadCount;
      });

    this.notificationCenterService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loadingNotifications = loading;
      });

    this.notificationCenterService.refresh(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  toggleOffcanvas(): void {
    this.layoutService.toggleOffcanvas();
  }

  markAsRead(notification: UserNotification, event: Event): void {
    event.stopPropagation();
    if (!notification.id || notification.read) {
      return;
    }

    this.notificationCenterService.markAsRead(notification.id).subscribe({
      error: () => {
        this.toastService.error('Impossible de marquer la notification comme lue.');
      }
    });
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationCenterService.markAllAsRead().subscribe({
      next: () => {
        this.toastService.success('Toutes les notifications sont marquees comme lues.');
      },
      error: () => {
        this.toastService.error('Impossible de marquer toutes les notifications comme lues.');
      }
    });
  }

  openNotificationCenter(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/app/notifications']);
  }

  removeNotification(notification: UserNotification, event: Event): void {
    event.stopPropagation();
    if (!notification.id) {
      return;
    }

    this.notificationCenterService.delete(notification.id).subscribe({
      next: () => {
        this.toastService.success('Notification supprimee.');
      },
      error: () => {
        this.toastService.error('Impossible de supprimer la notification.');
      }
    });
  }

  get previewNotifications(): UserNotification[] {
    return this.notifications.slice(0, 5);
  }

  formatRelativeDate(value?: string): string {
    if (!value) {
      return 'A l instant';
    }

    const date = new Date(value).getTime();
    const now = Date.now();
    const deltaMinutes = Math.floor((now - date) / 60000);

    if (deltaMinutes < 1) {
      return 'A l instant';
    }
    if (deltaMinutes < 60) {
      return `Il y a ${deltaMinutes} min`;
    }

    const deltaHours = Math.floor(deltaMinutes / 60);
    if (deltaHours < 24) {
      return `Il y a ${deltaHours} h`;
    }

    const deltaDays = Math.floor(deltaHours / 24);
    return `Il y a ${deltaDays} j`;
  }

}

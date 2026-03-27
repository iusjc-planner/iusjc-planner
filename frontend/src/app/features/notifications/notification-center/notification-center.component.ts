import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserNotification } from '../../../shared/models/notification.model';
import { NotificationCenterService } from '../services/notification.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css']
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: UserNotification[] = [];
  loading = false;
  activeFilter: 'ALL' | 'UNREAD' | 'READ' = 'ALL';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private notificationCenterService: NotificationCenterService,
    private toastService: NotificationService
  ) {}

  ngOnInit(): void {
    this.notificationCenterService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.notifications = data;
      });

    this.notificationCenterService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });

    this.notificationCenterService.refresh(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setFilter(filter: 'ALL' | 'UNREAD' | 'READ'): void {
    this.activeFilter = filter;
  }

  markAsRead(notification: UserNotification): void {
    if (!notification.id || notification.read) {
      return;
    }

    this.notificationCenterService.markAsRead(notification.id).subscribe({
      error: () => {
        this.toastService.error('Impossible de marquer la notification comme lue.');
      }
    });
  }

  markAllAsRead(): void {
    this.notificationCenterService.markAllAsRead().subscribe({
      next: () => {
        this.toastService.success('Toutes les notifications sont marquees comme lues.');
      },
      error: () => {
        this.toastService.error('Impossible de marquer toutes les notifications comme lues.');
      }
    });
  }

  delete(notification: UserNotification): void {
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

  refresh(): void {
    this.notificationCenterService.refresh(false);
  }

  get filteredNotifications(): UserNotification[] {
    if (this.activeFilter === 'UNREAD') {
      return this.notifications.filter(notification => !notification.read);
    }
    if (this.activeFilter === 'READ') {
      return this.notifications.filter(notification => notification.read);
    }
    return this.notifications;
  }

  get unreadCount(): number {
    return this.notifications.filter(notification => !notification.read).length;
  }

  get readCount(): number {
    return this.notifications.filter(notification => notification.read).length;
  }

  formatDate(value?: string): string {
    if (!value) {
      return '-';
    }
    return new Date(value).toLocaleString('fr-FR');
  }

}

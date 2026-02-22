import { Injectable } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

export interface MenuItem {
  title: string;
  icon: string;
  link?: string;
  submenu?: MenuItem[];
  collapsed?: boolean;
  isActive?: boolean;
  roles?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private adminMenuItems: MenuItem[] = [
    {
      title: 'Dashboard Admin',
      icon: 'mdi mdi-view-dashboard',
      link: '/app/dashboard',
      roles: ['ADMIN']
    },
    {
      title: 'Utilisateurs',
      icon: 'mdi mdi-account-multiple',
      link: '/app/users',
      roles: ['ADMIN']
    },
    {
      title: 'Enseignants',
      icon: 'mdi mdi-account-tie',
      link: '/app/teachers',
      roles: ['ADMIN']
    },
    {
      title: 'Écoles',
      icon: 'mdi mdi-school',
      link: '/app/schools',
      roles: ['ADMIN']
    },
    {
      title: 'Salles',
      icon: 'mdi mdi-door',
      roles: ['ADMIN'],
      collapsed: false,
      submenu: [
        { title: 'Liste', link: '/app/rooms', icon: '' },
        { title: 'Réservations', link: '/app/reservations', icon: '' }
      ]
    },
    {
      title: 'Matières',
      icon: 'mdi mdi-book-open-variant',
      link: '/app/matieres',
      roles: ['ADMIN']
    },
    {
      title: 'Séances',
      icon: 'mdi mdi-calendar-text',
      link: '/app/courses',
      roles: ['ADMIN']
    },
    {
      title: 'Groupes',
      icon: 'mdi mdi-account-group',
      link: '/app/groups',
      roles: ['ADMIN']
    },
    {
      title: 'Emplois du temps',
      icon: 'mdi mdi-calendar-clock',
      roles: ['ADMIN', 'ENSEIGNANT'],
      collapsed: false,
      submenu: [
        { title: 'Vue globale', link: '/app/schedules', icon: '' },
        { title: 'Par enseignant', link: '/app/schedules/teachers', icon: '' },
        { title: 'Par salle', link: '/app/schedules/rooms', icon: '' },
        { title: 'Par groupe', link: '/app/schedules/groups', icon: '' }
      ]
    },
    {
      title: 'Événements',
      icon: 'mdi mdi-calendar-star',
      link: '/app/events',
      roles: ['ADMIN']
    },
    {
      title: 'Ressources',
      icon: 'mdi mdi-desktop-classic',
      link: '/app/resources',
      roles: ['ADMIN']
    },
    {
      title: 'Rapports',
      icon: 'mdi mdi-chart-bar',
      roles: ['ADMIN'],
      collapsed: false,
      submenu: [
        { title: 'Occupation salles', link: '/app/reports/rooms', icon: '' },
        { title: 'Charge enseignants', link: '/app/reports/teachers', icon: '' }
      ]
    },
    {
      title: 'Paramètres',
      icon: 'mdi mdi-cog',
      link: '/app/settings',
      roles: ['ADMIN']
    }
  ];

  private teacherMenuItems: MenuItem[] = [
    {
      title: 'Dashboard Enseignant',
      icon: 'mdi mdi-view-dashboard',
      link: '/app/dashboard-teacher',
      roles: ['USER']
    },
    {
      title: 'Mon Emploi du Temps',
      icon: 'mdi mdi-calendar-clock',
      link: '/app/my-schedule',
      roles: ['USER']
    },
    {
      title: 'Mes Matières',
      icon: 'mdi mdi-book-open-variant',
      link: '/app/my-courses',
      roles: ['USER']
    },
    {
      title: 'Mes Groupes',
      icon: 'mdi mdi-account-group',
      link: '/app/my-groups',
      roles: ['USER']
    },
    {
      title: 'Réservations de Salles',
      icon: 'mdi mdi-door',
      link: '/app/room-reservations',
      roles: ['USER']
    },
    {
      title: 'Mes Disponibilités',
      icon: 'mdi mdi-calendar-check',
      link: '/app/my-availability',
      roles: ['USER']
    },
    {
      title: 'Mon Profil',
      icon: 'mdi mdi-account',
      link: '/app/my-profile',
      roles: ['USER']
    }
  ];

  constructor(private authService: AuthService) { }

  getMenuItems(): MenuItem[] {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    // Retourner le menu approprié selon le rôle
    switch (currentUser.role) {
      case 'ADMIN':
        return this.adminMenuItems;
      case 'USER':
        return this.teacherMenuItems;
      default:
        return [];
    }
  }

  getMenuItemsByRole(role: string): MenuItem[] {
    switch (role) {
      case 'ADMIN':
        return this.adminMenuItems;
      case 'USER':
        return this.teacherMenuItems;
      default:
        return [];
    }
  }
}

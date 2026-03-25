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
        { title: 'Par enseignant', link: '/app/schedules/teacher', icon: '' },
        { title: 'Par salle', link: '/app/schedules/room', icon: '' },
        { title: 'Par groupe', link: '/app/schedules/group', icon: '' }
      ]
    },
    {
      title: 'Ressources',
      icon: 'mdi mdi-desktop-classic',
      link: '/app/resources',
      roles: ['ADMIN']
    },
    {
      title: 'Notifications',
      icon: 'mdi mdi-bell-outline',
      link: '/app/notifications',
      roles: ['ADMIN']
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
      roles: ['ENSEIGNANT']
    },
    {
      title: 'Mon Emploi du Temps',
      icon: 'mdi mdi-calendar-clock',
      link: '/app/schedules',
      roles: ['ENSEIGNANT']
    },
    {
      title: 'Ressources',
      icon: 'mdi mdi-desktop-classic',
      link: '/app/resources',
      roles: ['ENSEIGNANT']
    },
    {
      title: 'Notifications',
      icon: 'mdi mdi-bell-outline',
      link: '/app/notifications',
      roles: ['ENSEIGNANT']
    },
    {
      title: 'Recherche',
      icon: 'mdi mdi-magnify',
      link: '/app/search',
      roles: ['ENSEIGNANT']
    },
    {
      title: 'Déconnexion',
      icon: 'mdi mdi-logout',
      link: '/login/logout',
      roles: ['ENSEIGNANT']
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
      case 'ENSEIGNANT':
        return this.teacherMenuItems;
      default:
        return [];
    }
  }

  getMenuItemsByRole(role: string): MenuItem[] {
    switch (role) {
      case 'ADMIN':
        return this.adminMenuItems;
      case 'ENSEIGNANT':
        return this.teacherMenuItems;
      default:
        return [];
    }
  }
}

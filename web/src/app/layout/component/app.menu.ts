import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    constructor(private authService: AuthService) {}

    ngOnInit() {
        const isAdmin = (this.authService.getRole() ?? '').toUpperCase().includes('ADMIN');

        this.model = [
            {
                label: 'Accueil',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: [isAdmin ? '/dashboard' : '/'] }]
            }
        ];

        if (isAdmin) {
            this.model.push(
                {
                    label: 'Gestion',
                    items: [
                        { label: 'Utilisateurs', icon: 'pi pi-fw pi-user', routerLink: ['/pages/admin/utilisateurs'] },
                        { label: 'Ecoles', icon: 'pi pi-fw pi-building', routerLink: ['/pages/admin/ecoles'] },
                        { label: 'Groupes d\'étudiants', icon: 'pi pi-fw pi-users', routerLink: ['/pages/admin/groupes'] },
                        { label: 'Matieres', icon: 'pi pi-fw pi-bookmark', routerLink: ['/pages/admin/matieres'] },
                        { label: 'Cours', icon: 'pi pi-fw pi-book', routerLink: ['/pages/admin/cours'] },
                        { label: 'Salles', icon: 'pi pi-fw pi-building', routerLink: ['/pages/admin/salles'] },
                        { label: 'Ressources', icon: 'pi pi-fw pi-server', routerLink: ['/pages/admin/ressources'] },
                        { label: 'Enseignants', icon: 'pi pi-fw pi-graduation-cap', routerLink: ['/pages/admin/enseignants'] }
                    ]
                },
                {
                    label: 'Planification',
                    items: [
                        { label: 'Emplois du temps', icon: 'pi pi-fw pi-calendar', routerLink: ['/pages/admin/emploi-du-temps'] },
                        { label: 'Calendrier visuel', icon: 'pi pi-fw pi-calendar-times', routerLink: ['/pages/admin/calendrier'] },
                        { label: 'Evenements', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/pages/admin/evenements'] },
                        { label: 'Examens', icon: 'pi pi-fw pi-check-square', routerLink: ['/pages/admin/examens'] }
                    ]
                },
                {
                    label: 'Rapports',
                    items: [
                        { label: 'Statistiques', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/pages/admin/rapports'] },
                        { label: 'Utilisation des salles', icon: 'pi pi-fw pi-chart-line', routerLink: ['/pages/admin/rapports'] },
                        { label: 'Activité des enseignants', icon: 'pi pi-fw pi-chart-pie', routerLink: ['/pages/admin/rapports'] }
                    ]
                }
            );
        }

        const settingsItems: MenuItem[] = [];
        if (isAdmin) {
            settingsItems.push(
                { label: 'Notifications', icon: 'pi pi-fw pi-bell', routerLink: ['/pages/admin/notifications'] },
                { label: 'Profil', icon: 'pi pi-fw pi-user', routerLink: ['/pages/admin/profil'] }
            );
        } else {
            this.model.push({
                label: 'Enseignant',
                items: [
                    { label: 'Disponibilités', icon: 'pi pi-fw pi-calendar', routerLink: ['/pages/enseignant/disponibilites'] },
                    { label: 'Historique', icon: 'pi pi-fw pi-history', routerLink: ['/pages/enseignant/historique-disponibilites'] }
                ]
            });
            settingsItems.push(
                { label: 'Notifications', icon: 'pi pi-fw pi-bell', routerLink: ['/pages/notifications'] },
                { label: 'Profil', icon: 'pi pi-fw pi-user', routerLink: ['/pages/profil'] }
            );
        }

        settingsItems.push({
            label: 'Déconnexion',
            icon: 'pi pi-fw pi-sign-out',
            command: () => {
                this.authService.logout();
            }
        });

        this.model.push({
            label: 'Paramètres',
            items: settingsItems
        });
    }
}

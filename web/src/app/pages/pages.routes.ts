import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { UtilisateursPage } from './admin/utilisateurs';
import { GroupesPage } from './admin/groupes';
import { EcolesPage } from './admin/ecoles';
import { MatieresPage } from './admin/matieres';
import { CoursPage } from './admin/cours';
import { SallesPage } from './admin/salles';
import { RessourcesPage } from './admin/ressources';
import { EnseignantsPage } from './admin/enseignants';
import { EmploiDuTempsPage } from './admin/emploi-du-temps';
import { RapportsPage } from './admin/rapports';
import { EvenementsPage } from './admin/evenements';
import { ExamensPage } from './admin/examens';
import { NotificationsPage } from './admin/notifications';
import { ProfilPage } from './admin/profil';
import { DisponibilitesPage } from './enseignant/disponibilites';
import { HistoriqueDisponibilitesPage } from './enseignant/historique-disponibilites';
import { CalendrierEdtPage } from './admin/calendrier-edt';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

export default [
    { path: 'documentation', component: Documentation, canActivate: [authGuard] },
    { path: 'crud', component: Crud, canActivate: [authGuard] },
    { path: 'empty', component: Empty, canActivate: [authGuard] },
    { path: 'notifications', component: NotificationsPage, canActivate: [authGuard] },
    { path: 'profil', component: ProfilPage, canActivate: [authGuard] },
    { path: 'enseignant/disponibilites', component: DisponibilitesPage, canActivate: [authGuard] },
    { path: 'enseignant/historique-disponibilites', component: HistoriqueDisponibilitesPage, canActivate: [authGuard] },
    { path: 'admin/utilisateurs', component: UtilisateursPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/groupes', component: GroupesPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/ecoles', component: EcolesPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/matieres', component: MatieresPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/cours', component: CoursPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/salles', component: SallesPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/ressources', component: RessourcesPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/enseignants', component: EnseignantsPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/emploi-du-temps', component: EmploiDuTempsPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/calendrier', component: CalendrierEdtPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/rapports', component: RapportsPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/evenements', component: EvenementsPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/examens', component: ExamensPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/notifications', component: NotificationsPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/profil', component: ProfilPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: '**', redirectTo: '/notfound' }
] as Routes;


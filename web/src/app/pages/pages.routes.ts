import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { EnseignantsPage } from './admin/enseignants';
import { UtilisateursPage } from './admin/utilisateurs';
import { GroupesPage } from './admin/groupes';
import { CoursPage } from './admin/cours';
import { SallesPage } from './admin/salles';
import { RessourcesPage } from './admin/ressources';
import { EmploiDuTempsPage } from './admin/emploi-du-temps';
import { RapportsPage } from './admin/rapports';
import { EvenementsPage } from './admin/evenements';
import { ExamensPage } from './admin/examens';
import { NotificationsPage } from './admin/notifications';
import { ProfilPage } from './admin/profil';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'admin/enseignants', component: EnseignantsPage },
    { path: 'admin/utilisateurs', component: UtilisateursPage },
    { path: 'admin/groupes', component: GroupesPage },
    { path: 'admin/cours', component: CoursPage },
    { path: 'admin/salles', component: SallesPage },
    { path: 'admin/ressources', component: RessourcesPage },
    { path: 'admin/emploi-du-temps', component: EmploiDuTempsPage },
    { path: 'admin/rapports', component: RapportsPage },
    { path: 'admin/evenements', component: EvenementsPage },
    { path: 'admin/examens', component: ExamensPage },
    { path: 'admin/notifications', component: NotificationsPage },
    { path: 'admin/profil', component: ProfilPage },
    { path: '**', redirectTo: '/notfound' }
] as Routes;

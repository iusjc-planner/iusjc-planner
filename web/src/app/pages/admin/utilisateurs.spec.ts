import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { UtilisateursPage } from './utilisateurs';
import { MessageService } from 'primeng/api';
import { UserService } from '../../core/services/user.service';
import { SchoolService } from '../../core/services/school.service';

describe('UtilisateursPage', () => {
    let messageService: jasmine.SpyObj<MessageService>;
    let userService: jasmine.SpyObj<UserService>;
    let schoolService: jasmine.SpyObj<SchoolService>;
    let page: UtilisateursPage;

    beforeEach(() => {
        messageService = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
        userService = jasmine.createSpyObj<UserService>('UserService', ['getAll', 'create', 'update', 'delete']);
        schoolService = jasmine.createSpyObj<SchoolService>('SchoolService', ['getAll']);

        userService.getAll.and.returnValue(
            of([
                { id: 1, nom: 'Admin', prenom: 'IUSJC', email: 'admin@iusjc.cm', telephone: '', login: 'admin', role: 'Administrateur', statut: 'Actif' },
                { id: 2, nom: 'Dupont', prenom: 'Jean', email: 'dupont@iusjc.cm', telephone: '', login: 'jdupont', role: 'Enseignant', statut: 'Inactif' }
            ])
        );
        userService.create.and.returnValue(of({ id: 3, nom: 'New', prenom: 'User', email: 'new@iusjc.cm', login: 'new', role: 'Support', statut: 'Actif' }));
        userService.update.and.returnValue(of({ id: 1, nom: 'Admin', prenom: 'IUSJC', email: 'admin@iusjc.cm', login: 'admin', role: 'Administrateur', statut: 'Actif' }));
        userService.delete.and.returnValue(of(void 0));
        schoolService.getAll.and.returnValue(of([{ id: 1, nom: 'Informatique' }, { id: 2, nom: 'Droit' }]));

        page = new UtilisateursPage(new FormBuilder(), messageService, userService, schoolService);
    });

    it('loads users and applies role filter', () => {
        page.ngOnInit();
        page.roleFilter = 'Enseignant';

        expect(page.utilisateurs.length).toBe(1);
        expect(page.utilisateurs[0].role).toBe('Enseignant');
    });

    it('applies text search on full name and login', () => {
        page.ngOnInit();
        page.searchValue = 'jdup';

        expect(page.utilisateurs.length).toBe(1);
        expect(page.utilisateurs[0].login).toBe('jdupont');
    });

    it('blocks save when required fields are missing', () => {
        page.openCreateDialog();
        page.userForm.patchValue({ nom: '', prenom: '', email: '', login: '' });

        page.saveUtilisateur();

        expect(userService.create).not.toHaveBeenCalled();
        expect(messageService.add).toHaveBeenCalled();
    });

    it('loads schools options on init', () => {
        page.ngOnInit();

        expect(schoolService.getAll).toHaveBeenCalled();
        expect(page.schoolOptions).toEqual(['Informatique', 'Droit']);
    });
});

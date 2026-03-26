import { TestBed } from '@angular/core/testing';
import { AppMenu } from './app.menu';
import { AuthService } from '../../core/services/auth.service';

describe('AppMenu', () => {
    let component: AppMenu;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        authService = jasmine.createSpyObj<AuthService>('AuthService', ['logout', 'getRole']);
        authService.getRole.and.returnValue('ADMIN');

        TestBed.configureTestingModule({
            providers: [{ provide: AuthService, useValue: authService }]
        });

        component = TestBed.runInInjectionContext(() => new AppMenu(TestBed.inject(AuthService)));
    });

    it('triggers logout from the Deconnexion menu action', () => {
        component.ngOnInit();

        const settingsSection = component.model.find((item) => item.label === 'Paramètres');
        const logoutItem = settingsSection?.items?.find((item) => item.label === 'Déconnexion');

        expect(logoutItem).toBeTruthy();
        logoutItem?.command?.({ originalEvent: new Event('click'), item: logoutItem });

        expect(authService.logout).toHaveBeenCalled();
    });

    it('shows admin sections for admin role', () => {
        authService.getRole.and.returnValue('ADMIN');
        component.ngOnInit();

        expect(component.model.some((item) => item.label === 'Gestion')).toBeTrue();
        expect(component.model.some((item) => item.label === 'Planification')).toBeTrue();
        expect(component.model.some((item) => item.label === 'Rapports')).toBeTrue();
    });

    it('hides admin sections for non-admin role', () => {
        authService.getRole.and.returnValue('TEACHER');
        component.ngOnInit();

        expect(component.model.some((item) => item.label === 'Gestion')).toBeFalse();
        expect(component.model.some((item) => item.label === 'Planification')).toBeFalse();
        expect(component.model.some((item) => item.label === 'Rapports')).toBeFalse();

        const settingsSection = component.model.find((item) => item.label === 'Paramètres');
        const settingsLabels = (settingsSection?.items || []).map((item) => item.label);

        expect(settingsLabels).toContain('Déconnexion');
        expect(settingsLabels).toContain('Notifications');
        expect(settingsLabels).toContain('Profil');
    });
});

import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  public uiBasicCollapsed = false;
  public samplePagesCollapsed = false;
  private authSubscription: Subscription = new Subscription();

  constructor(
    public navigationService: NavigationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const body = document.querySelector('body');

    // Add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    document.querySelectorAll('.sidebar .nav-item').forEach(function (el) {
      el.addEventListener('mouseover', function() {
        if(body?.classList.contains('sidebar-icon-only')) {
          el.classList.add('hover-open');
        }
      });
      el.addEventListener('mouseout', function() {
        if(body?.classList.contains('sidebar-icon-only')) {
          el.classList.remove('hover-open');
        }
      });
    });

    // S'abonner aux changements d'utilisateur pour mettre à jour le menu
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      // Le menu sera automatiquement mis à jour via le getter menuItems
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  get menuItems() {
    return this.navigationService.getMenuItems();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get isAdmin() {
    return this.authService.isAdmin();
  }

}

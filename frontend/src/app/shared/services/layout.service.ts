import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  public iconOnlyToggled = false;
  public sidebarToggled = false;

  constructor() { }

  // Toggle sidebar in desktop
  toggleSidebar(): void {
    const body = document.querySelector('body');
    if(!body) return;

    if((!body.classList.contains('sidebar-toggle-display')) && 
       (!body.classList.contains('sidebar-absolute'))) {
      this.iconOnlyToggled = !this.iconOnlyToggled;
      if(this.iconOnlyToggled) {
        body.classList.add('sidebar-icon-only');
      } else {
        body.classList.remove('sidebar-icon-only');
      }
    } else {
      this.sidebarToggled = !this.sidebarToggled;
      if(this.sidebarToggled) {
        body.classList.add('sidebar-hidden');
      } else {
        body.classList.remove('sidebar-hidden');
      }
    }
  }

  // Toggle sidebar in mobile
  toggleOffcanvas(): void {
    const sidebar = document.querySelector('.sidebar-offcanvas');
    if(sidebar) {
      sidebar.classList.toggle('active');
    }
  }
}

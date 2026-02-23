import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(public layoutService: LayoutService) { }

  ngOnInit(): void {
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  toggleOffcanvas(): void {
    this.layoutService.toggleOffcanvas();
  }

}

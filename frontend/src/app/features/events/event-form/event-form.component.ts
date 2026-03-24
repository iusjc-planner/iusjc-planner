import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  loading = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onCancel(): void {
    this.router.navigate(['/app/events']);
  }
}

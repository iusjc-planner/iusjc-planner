import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Teacher } from '../../../shared/models/teacher.model';
import { TeacherService } from '../../../core/services/teacher.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-teacher-detail',
  templateUrl: './teacher-detail.component.html',
  styleUrls: ['./teacher-detail.component.css']
})
export class TeacherDetailComponent implements OnInit {
  teacherId?: number;
  teacher?: Teacher;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private teacherService: TeacherService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.teacherId = +params['id'];
        this.loadTeacher(this.teacherId);
      }
    });
  }

  loadTeacher(id: number): void {
    this.loading = true;
    this.teacherService.getTeacherById(id).subscribe({
      next: (teacher) => {
        this.teacher = teacher;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l’enseignant', error);
        this.notificationService.error('Impossible de charger la fiche enseignant');
        this.loading = false;
      }
    });
  }
}

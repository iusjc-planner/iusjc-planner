import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScheduleService } from '../../../core/services/schedule.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { ScheduleEntry, ScheduleStatus } from '../../../shared/models/schedule.model';
import { Teacher } from '../../../shared/models/teacher.model';

@Component({
  selector: 'app-schedule-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './schedule-teacher.component.html',
  styleUrls: ['./schedule-teacher.component.css']
})
export class ScheduleTeacherComponent implements OnInit {
  teachers: Teacher[] = [];
  selectedTeacherId: string = '';
  entries: ScheduleEntry[] = [];
  loading = false;
  loadingEntries = false;
  ScheduleStatus = ScheduleStatus;

  constructor(
    private scheduleService: ScheduleService,
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.loading = true;
    this.teacherService.getAllTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement enseignants:', err);
        this.loading = false;
      }
    });
  }

  loadSchedule(): void {
    if (!this.selectedTeacherId) return;
    this.loadingEntries = true;
    this.scheduleService.list({ teacherId: this.selectedTeacherId }).subscribe({
      next: (data) => {
        this.entries = data;
        this.loadingEntries = false;
      },
      error: (err) => {
        console.error('Erreur chargement planning:', err);
        this.loadingEntries = false;
      }
    });
  }

  getSelectedTeacher(): Teacher | undefined {
    return this.teachers.find(t => t.id?.toString() === this.selectedTeacherId);
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case ScheduleStatus.SCHEDULED: return 'bg-primary';
      case ScheduleStatus.COMPLETED: return 'bg-success';
      case ScheduleStatus.CANCELLED: return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
}

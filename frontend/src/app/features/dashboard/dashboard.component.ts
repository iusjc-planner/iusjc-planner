import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
  PieController
} from 'chart.js';
import { CourseService } from '../../core/services/course.service';
import { RoomService } from '../../core/services/room.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { TeacherService } from '../../core/services/teacher.service';
import { UserService } from '../../core/services/user.service';
import { Course } from '../../shared/models/course.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;
  errorMessage = '';

  kpis = {
    users: 0,
    teachers: 0,
    rooms: 0,
    courses: 0,
    scheduledSessions: 0,
    activeRooms: 0
  };

  recentCourses: Course[] = [];

  constructor(
    private userService: UserService,
    private teacherService: TeacherService,
    private roomService: RoomService,
    private courseService: CourseService,
    private scheduleService: ScheduleService
  ) {
    // Enregistrer les composants Chart.js nécessaires
    Chart.register(ArcElement, Tooltip, Legend, DoughnutController, PieController);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      users: this.userService.getAllUsers().pipe(catchError(() => of([]))),
      teachers: this.teacherService.getAllTeachers().pipe(catchError(() => of([]))),
      rooms: this.roomService.getAll().pipe(catchError(() => of([]))),
      courses: this.courseService.getAll().pipe(catchError(() => of([]))),
      scheduleStats: this.scheduleService.stats().pipe(
        catchError(() => of({ total: 0, scheduled: 0, completed: 0, cancelled: 0 }))
      )
    }).subscribe({
      next: ({ users, teachers, rooms, courses, scheduleStats }) => {
        this.kpis = {
          users: users.length,
          teachers: teachers.length,
          rooms: rooms.length,
          courses: courses.length,
          scheduledSessions: scheduleStats.scheduled,
          activeRooms: rooms.filter(room => room.status === 'ACTIVE').length
        };

        const now = new Date();
        this.recentCourses = courses
          .filter(course => this.toDate(course.date, course.startTime) >= now)
          .sort((a, b) => this.toDate(a.date, a.startTime).getTime() - this.toDate(b.date, b.startTime).getTime())
          .slice(0, 6);

        this.doughnutChartData = {
          labels: ['Actifs', 'Inactifs'],
          datasets: [{
            data: [this.kpis.users, Math.max(0, this.kpis.courses - this.kpis.users)],
            backgroundColor: ['#667eea', '#cfd8dc'],
            borderColor: ['#667eea', '#cfd8dc'],
            borderWidth: 2,
            hoverBackgroundColor: ['#5a6fd8', '#b0bec5']
          }]
        };

        this.pieChartData = {
          labels: ['Salles actives', 'Autres statuts'],
          datasets: [{
            data: [this.kpis.activeRooms, Math.max(0, this.kpis.rooms - this.kpis.activeRooms)],
            backgroundColor: ['#28a745', '#ffc107'],
            borderColor: ['#28a745', '#ffc107'],
            borderWidth: 2
          }]
        };

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les statistiques du dashboard.';
        this.loading = false;
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  private toDate(date: string, time: string): Date {
    return new Date(`${date}T${time}:00`);
  }

  // Graphique d'occupation des salles par école
  occupationChartData = {
    labels: ["SJI", "SJM", "PrepaVogt", "CPGE"],
    datasets: [{
      label: 'Salles Occupées',
      data: [12, 8, 15, 10],
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 1
    },
    {
      label: 'Salles Libres',
      data: [8, 7, 5, 8],
      backgroundColor: 'rgba(67, 233, 123, 0.8)',
      borderColor: 'rgba(67, 233, 123, 1)',
      borderWidth: 1
    }]
  };

  occupationChartOptions = {
    responsive: true,
    legend: {
      display: false
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          max: 20,
          stepSize: 5
        },
        gridLines: {
          color: 'rgba(235,237,242,1)',
          drawBorder: false
        }
      }],
      xAxes: [{
        gridLines: {
          display: false,
          drawBorder: false
        },
        ticks: {
          fontColor: "#9c9fa6"
        }
      }]
    }
  };

  // Graphique de répartition des cours par type
  coursesChartData = {
    labels: ["Cours Magistraux", "Travaux Dirigés", "Travaux Pratiques"],
    datasets: [{
      data: [45, 35, 20],
      backgroundColor: [
        'rgba(102, 126, 234, 1)',
        'rgba(67, 233, 123, 1)',
        'rgba(255, 213, 0, 1)'
      ],
      borderColor: [
        'rgba(102, 126, 234, 0.2)',
        'rgba(67, 233, 123, 0.2)',
        'rgba(255, 213, 0, 0.2)'
      ],
      borderWidth: 1
    }]
  };

  coursesChartOptions = {
    responsive: true,
    legend: {
      display: false
    }
  };

  // Graphique circulaire - Répartition des utilisateurs par école
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData = {
    labels: ['Actifs', 'Inactifs'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [
        '#667eea',
        '#cfd8dc'
      ],
      borderColor: [
        '#667eea',
        '#cfd8dc'
      ],
      borderWidth: 2,
      hoverBackgroundColor: [
        '#5a6fd8',
        '#b0bec5'
      ]
    }]
  };

  public doughnutChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  };

  // Graphique circulaire - Statut des salles
  public pieChartType: ChartType = 'pie';
  public pieChartData = {
    labels: ['Salles actives', 'Autres statuts'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [
        '#28a745',
        '#ffc107'
      ],
      borderColor: [
        '#28a745',
        '#ffc107'
      ],
      borderWidth: 2
    }]
  };

  public pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      }
    }
  };

}

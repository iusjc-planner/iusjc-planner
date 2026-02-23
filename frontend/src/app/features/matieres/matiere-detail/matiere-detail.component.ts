import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatiereService } from '../../../core/services/matiere.service';
import { SchoolService } from '../../../core/services/school.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { CourseService } from '../../../core/services/course.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Matiere } from '../../../shared/models/matiere.model';
import { School, Filiere } from '../../../shared/models/school.model';
import { Teacher } from '../../../shared/models/teacher.model';
import { Course } from '../../../shared/models/course.model';

@Component({
  selector: 'app-matiere-detail',
  templateUrl: './matiere-detail.component.html',
  styleUrls: ['./matiere-detail.component.css']
})
export class MatiereDetailComponent implements OnInit {
  matiere?: Matiere;
  school?: School;
  filiere?: Filiere;
  teacher?: Teacher;
  courses: Course[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matiereService: MatiereService,
    private schoolService: SchoolService,
    private teacherService: TeacherService,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMatiere(+id);
    }
  }

  loadMatiere(id: number): void {
    this.loading = true;
    this.matiereService.getById(id).subscribe({
      next: (matiere) => {
        this.matiere = matiere;
        this.loadRelatedData();
        this.loadCourses(id);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = 'Matière non trouvée';
        this.loading = false;
      }
    });
  }

  loadRelatedData(): void {
    if (this.matiere?.schoolId) {
      this.schoolService.getSchoolById(this.matiere.schoolId).subscribe({
        next: (school) => {
          this.school = school;
          this.filiere = school.filieres?.find(f => f.id === this.matiere?.filiereId);
        },
        error: (error) => console.error('Erreur chargement école:', error)
      });
    }

    if (this.matiere?.teacherId) {
      this.teacherService.getTeacherById(this.matiere.teacherId).subscribe({
        next: (teacher) => this.teacher = teacher,
        error: (error) => console.error('Erreur chargement enseignant:', error)
      });
    }
  }

  loadCourses(matiereId: number): void {
    this.courseService.getByMatiere(matiereId).subscribe({
      next: (courses) => this.courses = courses,
      error: (error) => console.error('Erreur chargement séances:', error)
    });
  }

  deleteMatiere(): void {
    if (!this.matiere?.id) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      this.matiereService.delete(this.matiere.id).subscribe({
        next: () => {
          this.notificationService.success('Matière supprimée avec succès');
          this.router.navigate(['/app/matieres']);
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.notificationService.error('Impossible de supprimer la matière');
        }
      });
    }
  }

  getStatusClass(): string {
    return this.matiere?.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary';
  }

  getStatusLabel(): string {
    return this.matiere?.status === 'ACTIVE' ? 'Active' : 'Inactive';
  }
}

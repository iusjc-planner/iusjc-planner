import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchoolService } from '../../../core/services/school.service';
import { MatiereService } from '../../../core/services/matiere.service';
import { School } from '../../../shared/models/school.model';
import { Matiere } from '../../../shared/models/matiere.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-school-detail',
  templateUrl: './school-detail.component.html',
  styleUrls: ['./school-detail.component.css']
})
export class SchoolDetailComponent implements OnInit {
  schoolId: string | null = null;
  school: School | null = null;
  matieres: Matiere[] = [];
  loading = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private schoolService: SchoolService,
    private matiereService: MatiereService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.schoolId = this.route.snapshot.paramMap.get('id');
    if (this.schoolId) {
      this.loadSchool();
      this.loadMatieres();
    }
  }

  loadSchool(): void {
    if (!this.schoolId) return;
    
    this.loading = true;
    this.schoolService.getSchoolById(parseInt(this.schoolId)).subscribe({
      next: (school) => {
        this.school = school;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'école:', error);
        this.notificationService.error('École non trouvée');
        this.loading = false;
      }
    });
  }

  loadMatieres(): void {
    if (!this.schoolId) return;
    
    this.matiereService.getAll({ schoolId: parseInt(this.schoolId) }).subscribe({
      next: (matieres) => this.matieres = matieres,
      error: (err) => console.error('Erreur chargement matières:', err)
    });
  }

  getTotalMatieres(): number {
    return this.matieres.length;
  }

  getMatieresByFiliere(filiereId: number): Matiere[] {
    return this.matieres.filter(m => m.filiereId === filiereId);
  }

  deleteMatiere(matiereId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      this.matiereService.delete(matiereId).subscribe({
        next: () => {
          this.matieres = this.matieres.filter(m => m.id !== matiereId);
          this.notificationService.success('Matière supprimée avec succès');
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.notificationService.error('Erreur lors de la suppression');
        }
      });
    }
  }

  onEdit(): void {
    this.router.navigate(['/app/schools', this.schoolId, 'edit']);
  }

  onBack(): void {
    this.router.navigate(['/app/schools']);
  }
}
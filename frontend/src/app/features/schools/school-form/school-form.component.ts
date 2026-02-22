import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { School, Filiere, FiliereStatus } from '../../../shared/models/school.model';
import { SchoolService } from '../../../core/services/school.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-school-form',
  templateUrl: './school-form.component.html',
  styleUrls: ['./school-form.component.css']
})
export class SchoolFormComponent implements OnInit {
  isEditMode = false;
  schoolId: string | null = null;
  loading = false;
  
  school: School = {
    name: '',
    code: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    filieres: []
  };

  // Pour ajouter une nouvelle filière
  newFiliere: Filiere = {
    code: '',
    nom: '',
    description: '',
    status: FiliereStatus.ACTIVE
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private schoolService: SchoolService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.schoolId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.schoolId;
    
    if (this.isEditMode && this.schoolId) {
      this.loadSchool(parseInt(this.schoolId));
    }
  }

  loadSchool(id: number): void {
    this.loading = true;
    this.schoolService.getSchoolById(id).subscribe({
      next: (school) => {
        this.school = school;
        if (!this.school.filieres) {
          this.school.filieres = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'école:', error);
        this.notificationService.error('Erreur lors du chargement de l\'école');
        this.loading = false;
      }
    });
  }

  addFiliere(): void {
    if (!this.newFiliere.code || !this.newFiliere.nom) {
      this.notificationService.error('Le code et le nom de la filière sont obligatoires');
      return;
    }

    // Vérifier si le code existe déjà
    if (this.school.filieres?.some(f => f.code === this.newFiliere.code)) {
      this.notificationService.error('Une filière avec ce code existe déjà');
      return;
    }

    this.school.filieres = this.school.filieres || [];
    this.school.filieres.push({ ...this.newFiliere });
    
    // Reset le formulaire de nouvelle filière
    this.newFiliere = {
      code: '',
      nom: '',
      description: '',
      status: FiliereStatus.ACTIVE
    };
    
    this.notificationService.success('Filière ajoutée');
  }

  removeFiliere(index: number): void {
    if (this.school.filieres) {
      this.school.filieres.splice(index, 1);
      this.notificationService.info('Filière retirée');
    }
  }

  onSubmit(): void {
    if (!this.school.name) {
      this.notificationService.error('Veuillez remplir les champs obligatoires');
      return;
    }

    this.loading = true;
    
    const operation = this.isEditMode 
      ? this.schoolService.updateSchool(this.school.id!, this.school)
      : this.schoolService.createSchool(this.school);

    operation.subscribe({
      next: (result) => {
        const message = this.isEditMode 
          ? 'École mise à jour avec succès' 
          : 'École créée avec succès';
        this.notificationService.success(message);
        this.router.navigate(['/app/schools']);
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        this.notificationService.error('Erreur lors de la sauvegarde: ' + error.message);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/app/schools']);
  }
}
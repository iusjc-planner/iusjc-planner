import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatiereService } from '../../../core/services/matiere.service';
import { SchoolService } from '../../../core/services/school.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Matiere, MatiereStatus } from '../../../shared/models/matiere.model';
import { School, Filiere } from '../../../shared/models/school.model';
import { Teacher } from '../../../shared/models/teacher.model';

@Component({
  selector: 'app-matiere-form',
  templateUrl: './matiere-form.component.html',
  styleUrls: ['./matiere-form.component.css']
})
export class MatiereFormComponent implements OnInit {
  matiereForm!: FormGroup;
  isEditMode = false;
  matiereId?: number;
  formSubmitted = false;
  loading = false;
  
  schools: School[] = [];
  filieres: Filiere[] = [];
  filteredFilieres: Filiere[] = [];
  teachers: Teacher[] = [];
  
  // Pour les supports de cours
  supports: string[] = [];
  newSupportUrl: string = '';

  statusOptions = [
    { label: 'Active', value: MatiereStatus.ACTIVE },
    { label: 'Inactive', value: MatiereStatus.INACTIVE }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private matiereService: MatiereService,
    private schoolService: SchoolService,
    private teacherService: TeacherService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadSchools();
    this.loadTeachers();
    
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.matiereId = +params['id'];
        this.loadMatiere(this.matiereId);
      }
    });
  }

  initForm(): void {
    this.matiereForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      nom: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      schoolId: [null, Validators.required],
      filiereId: [null, Validators.required],
      teacherId: [null],
      credits: [3, [Validators.required, Validators.min(1)]],
      hoursTotal: [30, [Validators.required, Validators.min(1)]],
      status: [MatiereStatus.ACTIVE, Validators.required]
    });

    // Écouter les changements d'école pour filtrer les filières
    this.matiereForm.get('schoolId')?.valueChanges.subscribe(schoolId => {
      this.onSchoolChange(schoolId);
    });
  }

  loadSchools(): void {
    this.schoolService.getAllSchools().subscribe({
      next: (schools) => {
        this.schools = schools;
        // Extraire toutes les filières
        this.filieres = [];
        schools.forEach(school => {
          if (school.filieres) {
            school.filieres.forEach(f => {
              this.filieres.push({ ...f, schoolId: school.id });
            });
          }
        });
      },
      error: (error) => console.error('Erreur chargement écoles:', error)
    });
  }

  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (teachers) => this.teachers = teachers,
      error: (error) => console.error('Erreur chargement enseignants:', error)
    });
  }

  loadMatiere(id: number): void {
    this.loading = true;
    this.matiereService.getById(id).subscribe({
      next: (matiere) => {
        this.matiereForm.patchValue(matiere);
        this.supports = matiere.supports || [];
        // Trigger filière filtering
        this.onSchoolChange(matiere.schoolId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la matière', error);
        this.notificationService.error('Impossible de charger les informations');
        this.loading = false;
      }
    });
  }

  onSchoolChange(schoolId: number): void {
    if (schoolId) {
      const school = this.schools.find(s => s.id === schoolId);
      this.filteredFilieres = school?.filieres || [];
    } else {
      this.filteredFilieres = [];
    }
    
    // Reset la filière si elle n'appartient pas à la nouvelle école
    const currentFiliereId = this.matiereForm.get('filiereId')?.value;
    if (currentFiliereId && !this.filteredFilieres.some(f => f.id === currentFiliereId)) {
      this.matiereForm.patchValue({ filiereId: null });
    }
  }

  addSupport(): void {
    if (this.newSupportUrl && this.newSupportUrl.trim()) {
      this.supports.push(this.newSupportUrl.trim());
      this.newSupportUrl = '';
    }
  }

  removeSupport(index: number): void {
    this.supports.splice(index, 1);
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.matiereForm.invalid) {
      this.notificationService.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    const payload: Matiere = {
      ...this.matiereForm.value,
      supports: this.supports
    };

    this.loading = true;

    if (this.isEditMode && this.matiereId) {
      this.matiereService.update(this.matiereId, payload).subscribe({
        next: () => {
          this.notificationService.success('Matière mise à jour avec succès');
          this.router.navigate(['/app/matieres']);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          this.notificationService.error('Mise à jour impossible: ' + (error.error?.message || error.message));
          this.loading = false;
        }
      });
    } else {
      this.matiereService.create(payload).subscribe({
        next: () => {
          this.notificationService.success('Matière créée avec succès');
          this.router.navigate(['/app/matieres']);
        },
        error: (error) => {
          console.error('Erreur lors de la création', error);
          this.notificationService.error('Création impossible: ' + (error.error?.message || error.message));
          this.loading = false;
        }
      });
    }
  }
}

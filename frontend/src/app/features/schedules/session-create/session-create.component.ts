import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SchoolService } from '../../../core/services/school.service';
import { MatiereService } from '../../../core/services/matiere.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { GroupService } from '../../../core/services/group.service';
import { RoomService } from '../../../core/services/room.service';
import { CourseService } from '../../../core/services/course.service';

import { School, Filiere } from '../../../shared/models/school.model';
import { Matiere } from '../../../shared/models/matiere.model';
import { Teacher } from '../../../shared/models/teacher.model';
import { Group } from '../../../shared/models/group.model';
import { Room } from '../../../shared/models/room.model';
import { Course, CourseType, CourseStatus } from '../../../shared/models/course.model';

@Component({
  selector: 'app-session-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './session-create.component.html',
  styleUrls: ['./session-create.component.scss']
})
export class SessionCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Formulaire en sections
  form!: FormGroup;
  currentStep = 1;
  totalSteps = 3;

  // Données de référence
  schools: School[] = [];
  filieres: Filiere[] = [];
  matieres: Matiere[] = [];
  teachers: Teacher[] = [];
  groups: Group[] = [];
  availableRooms: Room[] = [];

  // États de chargement
  loadingSchools = false;
  loadingFilieres = false;
  loadingMatieres = false;
  loadingTeachers = false;
  loadingGroups = false;
  loadingRooms = false;
  saving = false;

  // Messages
  error: string | null = null;
  noRoomsAvailable = false;

  // Types de cours
  courseTypes = Object.values(CourseType);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private schoolService: SchoolService,
    private matiereService: MatiereService,
    private teacherService: TeacherService,
    private groupService: GroupService,
    private roomService: RoomService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSchools();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.form = this.fb.group({
      // Section 1: École, Filière, Matière, Enseignant
      schoolId: [null, Validators.required],
      filiereId: [null, Validators.required],
      matiereId: [null, Validators.required],
      teacherId: [null, Validators.required],
      
      // Section 2: Groupe, Date, Heures
      groupId: [null, Validators.required],
      date: [today, Validators.required],
      startTime: ['08:00', Validators.required],
      endTime: ['10:00', Validators.required],
      type: [CourseType.CM, Validators.required],
      
      // Section 3: Salle
      roomId: [null, Validators.required],
      
      // Optionnel
      title: [''],
      description: [''],
      notes: ['']
    });
  }

  setupFormListeners(): void {
    // Quand l'école change, charger les filières
    this.form.get('schoolId')?.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(schoolId => {
        this.resetFromFiliere();
        if (schoolId) {
          this.loadFilieres(schoolId);
        }
      });

    // Quand la filière change, charger les matières
    this.form.get('filiereId')?.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(filiereId => {
        this.resetFromMatiere();
        if (filiereId) {
          this.loadMatieres(filiereId);
          this.loadGroups(filiereId);
        }
      });

    // Quand la matière change, charger l'enseignant par défaut
    this.form.get('matiereId')?.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(matiereId => {
        if (matiereId) {
          const matiere = this.matieres.find(m => m.id === +matiereId);
          if (matiere?.teacherId) {
            this.form.patchValue({ teacherId: matiere.teacherId });
          }
        }
      });

    // Quand la date ou les heures changent, recharger les salles disponibles
    const timeFields = ['date', 'startTime', 'endTime'];
    timeFields.forEach(field => {
      this.form.get(field)?.valueChanges
        .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
        .subscribe(() => {
          if (this.currentStep === 3) {
            this.loadAvailableRooms();
          }
        });
    });
  }

  // === Chargement des données ===

  loadSchools(): void {
    this.loadingSchools = true;
    this.schoolService.getAllSchools({ status: 'ACTIVE' }).subscribe({
      next: (data) => {
        this.schools = data;
        this.loadingSchools = false;
      },
      error: (err) => {
        console.error('Erreur chargement écoles:', err);
        this.loadingSchools = false;
      }
    });
  }

  loadFilieres(schoolId: number): void {
    this.loadingFilieres = true;
    this.schoolService.getFilieresBySchool(schoolId).subscribe({
      next: (data) => {
        this.filieres = data.filter(f => f.status === 'ACTIVE');
        this.loadingFilieres = false;
      },
      error: (err) => {
        console.error('Erreur chargement filières:', err);
        this.loadingFilieres = false;
      }
    });
  }

  loadMatieres(filiereId: number): void {
    this.loadingMatieres = true;
    this.matiereService.getByFiliere(filiereId).subscribe({
      next: (data) => {
        this.matieres = data.filter(m => m.status === 'ACTIVE');
        this.loadingMatieres = false;
        // Charger tous les enseignants pour la liste déroulante
        this.loadTeachers();
      },
      error: (err) => {
        console.error('Erreur chargement matières:', err);
        this.loadingMatieres = false;
      }
    });
  }

  loadTeachers(): void {
    this.loadingTeachers = true;
    this.teacherService.getAllTeachers().subscribe({
      next: (data) => {
        this.teachers = data.filter(t => t.status === 'ACTIVE');
        this.loadingTeachers = false;
      },
      error: (err) => {
        console.error('Erreur chargement enseignants:', err);
        this.loadingTeachers = false;
      }
    });
  }

  loadGroups(filiereId: number): void {
    this.loadingGroups = true;
    const schoolId = this.form.get('schoolId')?.value;
    this.groupService.getAll({ schoolId, status: 'ACTIVE' }).subscribe({
      next: (data) => {
        this.groups = data;
        this.loadingGroups = false;
      },
      error: (err) => {
        console.error('Erreur chargement groupes:', err);
        this.loadingGroups = false;
      }
    });
  }

  loadAvailableRooms(): void {
    const date = this.form.get('date')?.value;
    const startTime = this.form.get('startTime')?.value;
    const endTime = this.form.get('endTime')?.value;

    if (!date || !startTime || !endTime) {
      return;
    }

    const start = `${date}T${startTime}:00`;
    const end = `${date}T${endTime}:00`;

    // Obtenir la taille du groupe pour filtrer par capacité
    const groupId = this.form.get('groupId')?.value;
    const group = this.groups.find(g => g.id === +groupId);
    const minCapacity = group?.size || 0;

    this.loadingRooms = true;
    this.noRoomsAvailable = false;

    this.roomService.getAvailable({ start, end, minCapacity }).subscribe({
      next: (data) => {
        this.availableRooms = data;
        this.loadingRooms = false;
        this.noRoomsAvailable = data.length === 0;
        
        // Réinitialiser la salle sélectionnée si elle n'est plus disponible
        const currentRoomId = this.form.get('roomId')?.value;
        if (currentRoomId && !data.find(r => r.id === +currentRoomId)) {
          this.form.patchValue({ roomId: null });
        }
      },
      error: (err) => {
        console.error('Erreur chargement salles disponibles:', err);
        this.loadingRooms = false;
      }
    });
  }

  // === Réinitialisation en cascade ===

  resetFromFiliere(): void {
    this.filieres = [];
    this.form.patchValue({ filiereId: null });
    this.resetFromMatiere();
  }

  resetFromMatiere(): void {
    this.matieres = [];
    this.groups = [];
    this.form.patchValue({ matiereId: null, teacherId: null, groupId: null });
    this.resetRooms();
  }

  resetRooms(): void {
    this.availableRooms = [];
    this.form.patchValue({ roomId: null });
    this.noRoomsAvailable = false;
  }

  // === Navigation entre étapes ===

  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStep++;
      if (this.currentStep === 3) {
        this.loadAvailableRooms();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep) {
      this.currentStep = step;
    } else if (step === this.currentStep + 1 && this.validateCurrentStep()) {
      this.currentStep = step;
      if (step === 3) {
        this.loadAvailableRooms();
      }
    }
  }

  validateCurrentStep(): boolean {
    const step1Fields = ['schoolId', 'filiereId', 'matiereId', 'teacherId'];
    const step2Fields = ['groupId', 'date', 'startTime', 'endTime', 'type'];
    const step3Fields = ['roomId'];

    let fieldsToValidate: string[] = [];
    
    switch (this.currentStep) {
      case 1:
        fieldsToValidate = step1Fields;
        break;
      case 2:
        fieldsToValidate = step2Fields;
        // Validation supplémentaire: heure fin > heure début
        const startTime = this.form.get('startTime')?.value;
        const endTime = this.form.get('endTime')?.value;
        if (startTime && endTime && startTime >= endTime) {
          this.error = "L'heure de fin doit être après l'heure de début";
          return false;
        }
        break;
      case 3:
        fieldsToValidate = step3Fields;
        break;
    }

    let valid = true;
    fieldsToValidate.forEach(field => {
      const control = this.form.get(field);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          valid = false;
        }
      }
    });

    if (!valid) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
    } else {
      this.error = null;
    }

    return valid;
  }

  isStepComplete(step: number): boolean {
    const step1Fields = ['schoolId', 'filiereId', 'matiereId', 'teacherId'];
    const step2Fields = ['groupId', 'date', 'startTime', 'endTime', 'type'];
    const step3Fields = ['roomId'];

    let fields: string[] = [];
    switch (step) {
      case 1: fields = step1Fields; break;
      case 2: fields = step2Fields; break;
      case 3: fields = step3Fields; break;
    }

    return fields.every(f => {
      const control = this.form.get(f);
      return control && control.value && !control.invalid;
    });
  }

  // === Soumission ===

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.saving = true;
    this.error = null;

    const formValue = this.form.value;
    
    // Créer l'objet Course (séance)
    const course: Course = {
      matiereId: +formValue.matiereId,
      teacherId: +formValue.teacherId,
      groupId: +formValue.groupId,
      roomId: +formValue.roomId,
      date: formValue.date,
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      type: formValue.type,
      title: formValue.title || undefined,
      description: formValue.description || undefined,
      notes: formValue.notes || undefined,
      status: CourseStatus.SCHEDULED
    };

    this.courseService.create(course).subscribe({
      next: (created) => {
        this.saving = false;
        this.router.navigate(['/app/schedules'], { 
          queryParams: { created: 'true' } 
        });
      },
      error: (err) => {
        console.error('Erreur création séance:', err);
        this.error = err.error?.message || 'Erreur lors de la création de la séance';
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/app/schedules']);
  }

  // === Helpers pour le template ===

  get f() {
    return this.form.controls;
  }

  getSelectedMatiere(): Matiere | undefined {
    const id = this.form.get('matiereId')?.value;
    return this.matieres.find(m => m.id === +id);
  }

  getSelectedTeacher(): Teacher | undefined {
    const id = this.form.get('teacherId')?.value;
    return this.teachers.find(t => t.id === +id);
  }

  getSelectedGroup(): Group | undefined {
    const id = this.form.get('groupId')?.value;
    return this.groups.find(g => g.id === +id);
  }

  getCourseTypeLabel(type: CourseType): string {
    const labels: Record<CourseType, string> = {
      [CourseType.CM]: 'Cours Magistral',
      [CourseType.TD]: 'Travaux Dirigés',
      [CourseType.TP]: 'Travaux Pratiques',
      [CourseType.EXAM]: 'Examen'
    };
    return labels[type] || type;
  }
}

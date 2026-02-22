import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ScheduleService } from '../../../core/services/schedule.service';
import { SchoolService } from '../../../core/services/school.service';
import { GroupService } from '../../../core/services/group.service';
import { School, Filiere } from '../../../shared/models/school.model';
import { Group } from '../../../shared/models/group.model';

export interface GenerationConfig {
  startDate: string;
  endDate: string;
  schoolId?: number;
  filiereId?: number;
  groupIds?: number[];
  excludeWeekends: boolean;
  dailyStartTime: string;
  dailyEndTime: string;
  sessionDuration: number; // en minutes
  breakDuration: number; // en minutes
}

export interface GenerationResult {
  success: boolean;
  message: string;
  sessionsCreated: number;
  conflicts: number;
  details?: GenerationDetail[];
}

export interface GenerationDetail {
  matiere: string;
  teacher: string;
  group: string;
  room: string;
  date: string;
  time: string;
  status: 'created' | 'conflict' | 'no_room';
}

@Component({
  selector: 'app-session-generate',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './session-generate.component.html',
  styleUrls: ['./session-generate.component.scss']
})
export class SessionGenerateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  schools: School[] = [];
  filieres: Filiere[] = [];
  groups: Group[] = [];

  loadingSchools = false;
  loadingFilieres = false;
  loadingGroups = false;
  generating = false;
  generated = false;

  result: GenerationResult | null = null;
  progress = 0;
  progressMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private scheduleService: ScheduleService,
    private schoolService: SchoolService,
    private groupService: GroupService
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
    // Par défaut, générer pour la semaine prochaine
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (8 - today.getDay()) % 7);
    const nextFriday = new Date(nextMonday);
    nextFriday.setDate(nextMonday.getDate() + 4);

    this.form = this.fb.group({
      startDate: [this.formatDate(nextMonday), Validators.required],
      endDate: [this.formatDate(nextFriday), Validators.required],
      schoolId: [null],
      filiereId: [null],
      groupIds: [[]],
      excludeWeekends: [true],
      dailyStartTime: ['08:00', Validators.required],
      dailyEndTime: ['18:00', Validators.required],
      sessionDuration: [120, [Validators.required, Validators.min(30), Validators.max(240)]],
      breakDuration: [15, [Validators.required, Validators.min(0), Validators.max(60)]]
    });
  }

  setupFormListeners(): void {
    this.form.get('schoolId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(schoolId => {
        this.filieres = [];
        this.form.patchValue({ filiereId: null, groupIds: [] });
        if (schoolId) {
          this.loadFilieres(schoolId);
          this.loadGroups(schoolId);
        }
      });

    this.form.get('filiereId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filiereId => {
        this.form.patchValue({ groupIds: [] });
        if (filiereId) {
          // Filtrer les groupes par filière si nécessaire
        }
      });
  }

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

  loadGroups(schoolId: number): void {
    this.loadingGroups = true;
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

  onGenerate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validation des dates
    const startDate = new Date(this.form.value.startDate);
    const endDate = new Date(this.form.value.endDate);
    
    if (endDate < startDate) {
      this.result = {
        success: false,
        message: 'La date de fin doit être après la date de début',
        sessionsCreated: 0,
        conflicts: 0
      };
      return;
    }

    this.generating = true;
    this.generated = false;
    this.result = null;
    this.progress = 0;
    this.progressMessage = 'Initialisation...';

    // Simuler la progression
    this.simulateProgress();

    const config: GenerationConfig = this.form.value;
    
    this.scheduleService.generateAuto().subscribe({
      next: (response) => {
        this.progress = 100;
        this.progressMessage = 'Génération terminée!';
        
        setTimeout(() => {
          this.generating = false;
          this.generated = true;
          this.result = {
            success: true,
            message: response.message || 'Génération terminée avec succès',
            sessionsCreated: 0, // À récupérer du backend
            conflicts: 0
          };
        }, 500);
      },
      error: (err) => {
        console.error('Erreur génération:', err);
        this.generating = false;
        this.result = {
          success: false,
          message: err.error?.message || 'Erreur lors de la génération automatique',
          sessionsCreated: 0,
          conflicts: 0
        };
      }
    });
  }

  simulateProgress(): void {
    const messages = [
      'Analyse des disponibilités des enseignants...',
      'Construction du graphe de flux...',
      'Application de l\'algorithme Ford-Fulkerson...',
      'Recherche des chemins augmentants...',
      'Attribution optimale des salles...',
      'Création des séances...',
      'Vérification des conflits...',
      'Finalisation...'
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (!this.generating || step >= messages.length) {
        clearInterval(interval);
        return;
      }
      
      this.progress = Math.min(90, (step + 1) * 12);
      this.progressMessage = messages[step];
      step++;
    }, 800);
  }

  onCancel(): void {
    this.router.navigate(['/app/schedules']);
  }

  viewSchedule(): void {
    this.router.navigate(['/app/schedules']);
  }

  generateAgain(): void {
    this.generated = false;
    this.result = null;
  }

  get f() {
    return this.form.controls;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  toggleGroup(groupId: number): void {
    const current: number[] = this.form.value.groupIds || [];
    const index = current.indexOf(groupId);
    
    if (index === -1) {
      this.form.patchValue({ groupIds: [...current, groupId] });
    } else {
      this.form.patchValue({ groupIds: current.filter(id => id !== groupId) });
    }
  }

  isGroupSelected(groupId: number): boolean {
    return (this.form.value.groupIds || []).includes(groupId);
  }

  selectAllGroups(): void {
    this.form.patchValue({ groupIds: this.groups.map(g => g.id!) });
  }

  deselectAllGroups(): void {
    this.form.patchValue({ groupIds: [] });
  }
}

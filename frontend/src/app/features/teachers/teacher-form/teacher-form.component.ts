import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherService } from '../../../core/services/teacher.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Teacher, TeacherGrade, TeacherStatus } from '../../../shared/models/teacher.model';

@Component({
  selector: 'app-teacher-form',
  templateUrl: './teacher-form.component.html',
  styleUrls: ['./teacher-form.component.css']
})
export class TeacherFormComponent implements OnInit {
  teacherForm!: FormGroup;
  isEditMode = false;
  teacherId?: number;
  formSubmitted = false;
  gradeOptions = [
    { label: 'Assistant', value: TeacherGrade.ASSISTANT },
    { label: 'Chef de travaux', value: TeacherGrade.CHEF_TRAVAUX },
    { label: 'Professeur', value: TeacherGrade.PROFESSEUR }
  ];

  statusOptions = [
    { label: 'Actif', value: TeacherStatus.ACTIVE },
    { label: 'Inactif', value: TeacherStatus.INACTIVE },
    { label: 'En congé', value: TeacherStatus.EN_CONGE }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private teacherService: TeacherService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.teacherId = +params['id'];
        this.loadTeacher(this.teacherId);
      }
    });
  }

  initForm(): void {
    this.teacherForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      specialite: [''],
      grade: [TeacherGrade.ASSISTANT, Validators.required],
      status: [TeacherStatus.ACTIVE, Validators.required]
    });
  }

  loadTeacher(id: number): void {
    this.teacherService.getTeacherById(id).subscribe({
      next: (teacher) => this.teacherForm.patchValue(teacher),
      error: (error) => {
        console.error('Erreur lors du chargement de l’enseignant', error);
        this.notificationService.error('Impossible de charger les informations');
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.teacherForm.invalid) {
      return;
    }

    const payload: Teacher = this.teacherForm.value;

    if (this.isEditMode && this.teacherId) {
      this.teacherService.updateTeacher(this.teacherId, payload).subscribe({
        next: () => {
          this.notificationService.success('Enseignant mis à jour avec succès');
          this.router.navigate(['/app/teachers']);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          this.notificationService.error('Mise à jour impossible');
        }
      });
    } else {
      this.teacherService.createTeacher(payload).subscribe({
        next: () => {
          this.notificationService.success('Enseignant créé avec succès');
          this.router.navigate(['/app/teachers']);
        },
        error: (error) => {
          console.error('Erreur lors de la création', error);
          this.notificationService.error('Création impossible');
        }
      });
    }
  }
}

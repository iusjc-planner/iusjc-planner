import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService, Student } from '../services/student.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEditMode = false;
  studentId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.studentId = params['id'];
        this.loadStudent(params['id']);
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      matricule: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.email]],
      telephone: [''],
      status: ['ACTIVE', Validators.required]
    });
  }

  loadStudent(id: number): void {
    this.loading = true;
    this.studentService.getById(id).subscribe({
      next: (student) => {
        this.form.patchValue(student);
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement');
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.form.valid) return;
    
    this.loading = true;
    const student: Student = this.form.value;
    
    const request = this.isEditMode && this.studentId
      ? this.studentService.update(this.studentId, student)
      : this.studentService.create(student);

    request.subscribe({
      next: () => {
        this.notificationService.success(this.isEditMode ? 'Étudiant mis à jour' : 'Étudiant créé');
        this.router.navigate(['/app/students']);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erreur lors de la sauvegarde');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/app/students']);
  }
}

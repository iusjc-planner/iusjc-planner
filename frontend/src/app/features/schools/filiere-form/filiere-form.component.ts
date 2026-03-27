import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FiliereService, Filiere } from '../services/filiere.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-filiere-form',
  templateUrl: './filiere-form.component.html',
  styleUrls: ['./filiere-form.component.css']
})
export class FiliereFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEditMode = false;
  filiereId: number | null = null;
  schoolId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private filiereService: FiliereService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe(params => {
      this.schoolId = params['schoolId'];
      if (params['id']) {
        this.isEditMode = true;
        this.filiereId = params['id'];
        this.loadFiliere(params['id']);
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(500)]],
      status: ['ACTIVE', Validators.required]
    });
  }

  loadFiliere(id: number): void {
    this.loading = true;
    this.filiereService.getById(id).subscribe({
      next: (filiere) => {
        this.form.patchValue(filiere);
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
    const filiere: Filiere = {
      ...this.form.value,
      schoolId: this.schoolId
    };
    
    const request = this.isEditMode && this.filiereId
      ? this.filiereService.update(this.filiereId, filiere)
      : this.filiereService.create(filiere);

    request.subscribe({
      next: () => {
        this.notificationService.success(this.isEditMode ? 'Filière mise à jour' : 'Filière créée');
        this.router.navigate(['/app/schools', this.schoolId, 'filieres']);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erreur lors de la sauvegarde');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/app/schools', this.schoolId, 'filieres']);
  }
}

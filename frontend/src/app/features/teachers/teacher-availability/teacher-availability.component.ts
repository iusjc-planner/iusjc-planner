import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Teacher, TeacherAvailability, AvailabilityGrid, IcsImportResult } from '../../../shared/models/teacher.model';
import { TeacherService } from '../../../core/services/teacher.service';
import { NotificationService } from '../../../shared/services/notification.service';

type GridAvailabilityStatus = 'available' | 'unavailable' | 'scheduled' | 'break' | 'preferred';

interface Exception {
  id: number;
  startDate: string;
  endDate?: string;
  reason: string;
  type: 'SPECIFIC_DATE' | 'DATE_RANGE';
}

@Component({
  selector: 'app-teacher-availability',
  templateUrl: './teacher-availability.component.html',
  styleUrls: ['./teacher-availability.component.css']
})
export class TeacherAvailabilityComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  teacherId?: number;
  teacher?: Teacher;
  loading = false;
  uploading = false;
  
  days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  dayMapping: { [key: string]: number } = {
    'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6
  };
  
  timeSlots = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00'
  ];

  // Grille de disponibilites : day -> slot -> status
  availability: Map<string, Map<string, GridAvailabilityStatus>> = new Map();
  
  // Exceptions (indisponibilites ponctuelles)
  exceptions: Exception[] = [];
  
  // Import ICS
  selectedFile: File | null = null;
  replaceExisting = false;
  lastImportResult: IcsImportResult | null = null;

  constructor(
    private route: ActivatedRoute,
    private teacherService: TeacherService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.teacherId = +params['id'];
        this.loadTeacher(this.teacherId);
        this.loadAvailability(this.teacherId);
      }
    });
  }

  loadTeacher(id: number): void {
    this.teacherService.getTeacherById(id).subscribe({
      next: (teacher) => this.teacher = teacher,
      error: (error) => {
        console.error('Erreur lors du chargement de l\'enseignant', error);
        this.notificationService.error('Impossible de charger les informations de l\'enseignant');
      }
    });
  }

  loadAvailability(teacherId: number): void {
    this.loading = true;
    
    // Initialiser toutes les cases comme disponibles par defaut
    this.initializeGrid();

    // Charger la grille depuis l'API
    this.teacherService.getAvailabilityGrid(teacherId).subscribe({
      next: (grid: AvailabilityGrid) => {
        this.applyGridFromApi(grid);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des disponibilites', error);
        // Garder la grille par defaut
        this.loading = false;
      }
    });

    // Charger les exceptions
    this.teacherService.getAvailabilityExceptions(teacherId).subscribe({
      next: (availabilities: TeacherAvailability[]) => {
        this.exceptions = availabilities.map(av => ({
          id: av.id!,
          startDate: av.specificDate!,
          endDate: av.endDate,
          reason: av.reason || 'Indisponible',
          type: av.availabilityType as 'SPECIFIC_DATE' | 'DATE_RANGE'
        }));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des exceptions', error);
      }
    });
  }

  initializeGrid(): void {
    this.days.forEach(day => {
      const dayMap = new Map<string, GridAvailabilityStatus>();
      this.timeSlots.forEach(slot => {
        // 12:00-13:00 est marque comme pause dejeuner
        if (slot === '12:00-13:00') {
          dayMap.set(slot, 'break');
        } else {
          dayMap.set(slot, 'available');
        }
      });
      this.availability.set(day, dayMap);
    });
  }

  applyGridFromApi(grid: AvailabilityGrid): void {
    for (const [dayNumber, slots] of Object.entries(grid)) {
      const dayName = this.getDayNameFromNumber(Number(dayNumber));
      if (dayName) {
        const dayMap = this.availability.get(dayName);
        if (dayMap) {
          for (const [slot, status] of Object.entries(slots)) {
            dayMap.set(slot, status as GridAvailabilityStatus);
          }
        }
      }
    }
  }

  getDayNameFromNumber(dayNumber: number): string | null {
    const mapping: { [key: number]: string } = {
      1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi'
    };
    return mapping[dayNumber] || null;
  }

  setAvailability(day: string, slot: string, status: GridAvailabilityStatus): void {
    const dayMap = this.availability.get(day);
    if (dayMap) {
      dayMap.set(slot, status);
    }
  }

  getAvailabilityStatus(day: string, slot: string): GridAvailabilityStatus {
    const dayMap = this.availability.get(day);
    return dayMap?.get(slot) || 'available';
  }

  getCellClass(day: string, slot: string): string {
    const status = this.getAvailabilityStatus(day, slot);
    switch (status) {
      case 'available':
        return 'bg-success text-white';
      case 'unavailable':
        return 'bg-danger text-white';
      case 'scheduled':
        return 'bg-warning text-dark';
      case 'break':
        return 'bg-light text-muted';
      case 'preferred':
        return 'bg-info text-white';
      default:
        return '';
    }
  }

  // === Gestion de l'upload ICS ===

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Verifier l'extension
      if (!file.name.toLowerCase().endsWith('.ics')) {
        this.notificationService.error('Veuillez selectionner un fichier ICS (.ics)');
        this.selectedFile = null;
        return;
      }
      
      this.selectedFile = file;
      this.lastImportResult = null;
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.lastImportResult = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  importIcsFile(): void {
    if (!this.selectedFile || !this.teacherId) {
      this.notificationService.error('Veuillez selectionner un fichier ICS');
      return;
    }

    this.uploading = true;
    
    this.teacherService.importIcsFile(this.teacherId, this.selectedFile, this.replaceExisting).subscribe({
      next: (result: IcsImportResult) => {
        this.uploading = false;
        this.lastImportResult = result;
        
        if (result.success) {
          this.notificationService.success(result.message);
          // Recharger les disponibilites
          this.loadAvailability(this.teacherId!);
          this.clearSelectedFile();
        } else {
          this.notificationService.error(result.message);
        }
      },
      error: (error) => {
        this.uploading = false;
        console.error('Erreur lors de l\'import ICS', error);
        this.notificationService.error('Erreur lors de l\'import du fichier ICS');
      }
    });
  }

  deleteIcsImports(): void {
    if (!this.teacherId) return;
    
    if (!confirm('Etes-vous sur de vouloir supprimer toutes les indisponibilites importees via ICS ?')) {
      return;
    }

    this.teacherService.deleteIcsImportedAvailabilities(this.teacherId).subscribe({
      next: (response) => {
        this.notificationService.success(response.message);
        this.loadAvailability(this.teacherId!);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression', error);
        this.notificationService.error('Erreur lors de la suppression des imports ICS');
      }
    });
  }

  // === Gestion des exceptions (indisponibilites ponctuelles) ===

  deleteException(exceptionId: number): void {
    if (!this.teacherId) return;
    
    if (!confirm('Etes-vous sur de vouloir supprimer cette indisponibilite ?')) {
      return;
    }

    this.teacherService.deleteAvailability(this.teacherId, exceptionId).subscribe({
      next: () => {
        this.notificationService.success('Indisponibilite supprimee');
        this.exceptions = this.exceptions.filter(e => e.id !== exceptionId);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression', error);
        this.notificationService.error('Erreur lors de la suppression');
      }
    });
  }

  formatExceptionDate(exception: Exception): string {
    if (exception.type === 'DATE_RANGE' && exception.endDate) {
      return `${this.formatDate(exception.startDate)} au ${this.formatDate(exception.endDate)}`;
    }
    return this.formatDate(exception.startDate);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }
}

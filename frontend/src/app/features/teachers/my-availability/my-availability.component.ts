import { Component, OnInit } from '@angular/core';
import { TeacherService } from '../services/teacher.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

interface TimeSlot {
  day: string;
  dayIndex: number;
  hour: number;
  startTime: string;
  endTime: string;
  isSelected: boolean;
  originalState: boolean;
  groupColor?: number; // Couleur du groupe de créneaux consécutifs
}

@Component({
  selector: 'app-my-availability',
  templateUrl: './my-availability.component.html',
  styleUrls: ['./my-availability.component.css']
})
export class MyAvailabilityComponent implements OnInit {
  days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']; // Lundi à samedi
  hours = [8, 9, 10, 11, 13, 14, 15, 16, 17]; // 8h à 17h, sans 12h (pause déjeuner)
  
  timeSlots: TimeSlot[] = [];
  loading = false;
  saving = false;
  teacherId: number | null = null;
  currentWeekStart: Date = new Date();
  weekDisplay: string = '';
  
  // Tracking des changements
  addedSlots: TimeSlot[] = [];
  removedSlots: TimeSlot[] = [];

  constructor(
    private teacherService: TeacherService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setCurrentWeekStart();
    this.initializeTimeSlots();
    this.loadTeacherAndAvailabilities();
  }

  loadTeacherAndAvailabilities(): void {
    // Récupérer l'utilisateur connecté depuis le AuthService (stocké localement)
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.error('Utilisateur non connecté');
      this.notificationService.error('Vous devez être connecté');
      return;
    }

    console.log('Utilisateur connecté:', currentUser);

    // Récupérer l'utilisateur complet pour obtenir son ID
    this.teacherService.getUserByLogin(currentUser.login).subscribe({
      next: (user) => {
        console.log('Utilisateur complet récupéré:', user);
        // Utiliser directement l'ID utilisateur
        // (Teacher est un User avec rôle USER, donc on utilise l'ID utilisateur)
        this.teacherId = user.id;
        console.log('TeacherId défini à:', this.teacherId);
        this.loadAvailabilities();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        this.notificationService.error('Impossible de récupérer vos informations');
      }
    });
  }

  setCurrentWeekStart(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Réinitialiser l'heure
    
    const day = today.getDay();
    // Calculer le lundi de la semaine actuelle (0 = dimanche, 1 = lundi)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    this.currentWeekStart = new Date(today.getFullYear(), today.getMonth(), diff);
    this.currentWeekStart.setHours(0, 0, 0, 0);
    
    console.log('Semaine actuelle commence le:', this.currentWeekStart.toISOString());
    this.updateWeekDisplay();
  }

  updateWeekDisplay(): void {
    const weekEnd = new Date(this.currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 5); // Samedi
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const startStr = this.currentWeekStart.toLocaleDateString('fr-FR', options);
    const endStr = weekEnd.toLocaleDateString('fr-FR', options);
    
    this.weekDisplay = `${startStr} - ${endStr}`;
  }

  goToPreviousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.currentWeekStart.setHours(0, 0, 0, 0);
    this.updateWeekDisplay();
    this.initializeTimeSlots();
    this.loadAvailabilities();
  }

  goToCurrentWeek(): void {
    this.setCurrentWeekStart();
    this.initializeTimeSlots();
    this.loadAvailabilities();
  }

  initializeTimeSlots(): void {
    this.timeSlots = [];
    for (let dayIndex = 0; dayIndex < 6; dayIndex++) { // 6 jours: lundi à samedi
      for (const hour of this.hours) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        this.timeSlots.push({
          day: this.days[dayIndex],
          dayIndex: dayIndex,
          hour: hour,
          startTime: startTime,
          endTime: endTime,
          isSelected: false,
          originalState: false,
          groupColor: undefined
        });
      }
    }
    this.updateGroupColors();
  }

  loadAvailabilities(): void {
    this.loading = true;

    if (!this.teacherId) {
      console.error('Teacher ID not set');
      this.loading = false;
      return;
    }

    // Calculer les dates de début et fin de semaine
    const startDate = this.currentWeekStart.toISOString().split('T')[0];
    const endDate = new Date(this.currentWeekStart);
    endDate.setDate(endDate.getDate() + 5);
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Chargement des disponibilités pour l'utilisateur ${this.teacherId} du ${startDate} au ${endDateStr}`);

    this.teacherService.getDisponibilitesByDateRange(this.teacherId, startDate, endDateStr).subscribe({
      next: (disponibilites) => {
        console.log('Disponibilités chargées:', disponibilites);
        this.markAvailabilitiesAsSelected(disponibilites);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des disponibilités:', error);
        this.loading = false;
      }
    });
  }

  markAvailabilitiesAsSelected(disponibilites: any[]): void {
    console.log('Marquage des disponibilités chargées:', disponibilites);
    
    // Stocker les disponibilités chargées avec leurs IDs
    disponibilites.forEach(dispo => {
      console.log('Traitement de la disponibilité:', dispo);
      
      // Trouver tous les créneaux qui correspondent à cette disponibilité
      const startHour = parseInt(dispo.heureDebut.split(':')[0]);
      const durationHours = dispo.duree / 60;
      const dayIndex = this.getDayIndexFromDate(dispo.date);
      
      console.log(`Date: ${dispo.date}, DayIndex: ${dayIndex}, StartHour: ${startHour}, Duration: ${durationHours}h`);
      
      for (let i = 0; i < durationHours; i++) {
        const hour = startHour + i;
        const slot = this.timeSlots.find(s => 
          s.dayIndex === dayIndex && 
          s.hour === hour
        );
        
        console.log(`Cherchant slot pour heure ${hour} du jour ${dayIndex}:`, slot);
        
        if (slot) {
          slot.isSelected = true;
          slot.originalState = true;
          // Stocker l'ID de la disponibilité pour pouvoir la modifier/supprimer
          slot['disponibiliteId'] = dispo.id;
          slot['disponibiliteDate'] = dispo.date;
          console.log(`Slot marqué comme sélectionné:`, slot);
        }
      }
    });

    console.log('Slots après marquage:', this.timeSlots.filter(s => s.isSelected));
    
    // Recalculer les couleurs de groupe
    this.updateGroupColors();
  }

  getDayIndexFromDate(dateStr: string): number {
    const date = new Date(dateStr + 'T00:00:00'); // Ajouter l'heure pour éviter les problèmes de timezone
    const weekStart = new Date(this.currentWeekStart);
    weekStart.setHours(0, 0, 0, 0); // Réinitialiser l'heure
    
    const diffTime = date.getTime() - weekStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`getDayIndexFromDate: ${dateStr} -> dayIndex: ${diffDays} (weekStart: ${weekStart.toISOString()})`);
    
    return diffDays;
  }

  toggleSlot(slot: TimeSlot): void {
    if (slot) {
      const wasSelected = slot.isSelected;
      slot.isSelected = !slot.isSelected;

      // Tracker les changements
      if (!wasSelected && slot.isSelected) {
        // Ajout
        if (!this.addedSlots.includes(slot)) {
          this.addedSlots.push(slot);
        }
        // Retirer de la liste des suppressions si présent
        this.removedSlots = this.removedSlots.filter(s => s !== slot);
      } else if (wasSelected && !slot.isSelected) {
        // Suppression
        if (slot.originalState && !this.removedSlots.includes(slot)) {
          this.removedSlots.push(slot);
        }
        // Retirer de la liste des ajouts si présent
        this.addedSlots = this.addedSlots.filter(s => s !== slot);
      }

      // Recalculer les couleurs de groupe
      this.updateGroupColors();
    }
  }

  updateGroupColors(): void {
    // Réinitialiser les couleurs de groupe
    this.timeSlots.forEach(slot => {
      slot.groupColor = undefined;
    });

    // Grouper par jour
    const slotsByDay: { [key: number]: TimeSlot[] } = {};
    this.timeSlots.forEach(slot => {
      if (!slotsByDay[slot.dayIndex]) {
        slotsByDay[slot.dayIndex] = [];
      }
      slotsByDay[slot.dayIndex].push(slot);
    });

    // Pour chaque jour, assigner les couleurs de groupe
    Object.keys(slotsByDay).forEach(dayIndex => {
      const daySlotsArray = slotsByDay[parseInt(dayIndex)];
      
      // Trier par heure
      daySlotsArray.sort((a, b) => a.hour - b.hour);

      let groupColor = 0;
      let lastWasSelected = false;

      daySlotsArray.forEach(slot => {
        if (slot.isSelected) {
          if (!lastWasSelected) {
            // Nouveau groupe
            groupColor = (groupColor + 1) % 9;
          }
          slot.groupColor = groupColor;
          lastWasSelected = true;
        } else {
          lastWasSelected = false;
        }
      });
    });
  }

  saveAvailabilities(): void {
    if (this.addedSlots.length === 0 && this.removedSlots.length === 0) {
      this.notificationService.info('Aucun changement à enregistrer');
      return;
    }

    if (!this.teacherId) {
      this.notificationService.error('Teacher ID not set');
      return;
    }

    this.saving = true;

    // Traiter les modifications (créneaux supprimés d'une disponibilité existante)
    const { toAdd, toRemove } = this.processAvailabilityChanges();

    console.log('Disponibilités à ajouter:', JSON.stringify(toAdd, null, 2));
    console.log('Disponibilités à supprimer:', JSON.stringify(toRemove, null, 2));

    // Traiter les suppressions et modifications
    let operationsCount = 0;
    let completedOperations = 0;

    // Supprimer les disponibilités d'abord
    if (toRemove.length > 0) {
      operationsCount++;
      this.teacherService.deleteMultipleDisponibilites(this.teacherId, toRemove).subscribe({
        next: () => {
          console.log('Disponibilités supprimées');
          this.notificationService.success(`${toRemove.length} disponibilité(s) supprimée(s)`);
          completedOperations++;
          if (completedOperations === operationsCount) {
            this.finalizeSave();
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression des disponibilités:', error);
          this.notificationService.error('Erreur lors de la suppression');
          this.saving = false;
        }
      });
    }

    // Ajouter les nouvelles disponibilités
    if (toAdd.length > 0) {
      operationsCount++;
      this.teacherService.createMultipleDisponibilites(this.teacherId, toAdd).subscribe({
        next: (response) => {
          console.log('Disponibilités ajoutées:', response);
          this.notificationService.success(`${toAdd.length} disponibilité(s) ajoutée(s)`);
          completedOperations++;
          if (completedOperations === operationsCount) {
            this.finalizeSave();
          }
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout des disponibilités:', error);
          this.notificationService.error('Erreur lors de l\'enregistrement');
          this.saving = false;
        }
      });
    }

    if (operationsCount === 0) {
      this.finalizeSave();
    }
  }

  processAvailabilityChanges(): { toAdd: any[], toRemove: number[] } {
    const toAdd: any[] = [];
    const toRemove: number[] = [];

    console.log('=== DEBUT processAvailabilityChanges ===');
    console.log('addedSlots:', this.addedSlots.length);
    console.log('removedSlots:', this.removedSlots.length);

    // Pour les ajouts : créer une disponibilité par créneau (1h chacun)
    this.addedSlots.forEach(slot => {
      toAdd.push({
        date: this.getDateForDay(slot.dayIndex),
        heureDebut: slot.startTime,
        duree: 60, // 1 heure = 60 minutes
        isAvailable: true,
        reason: null,
        fromIcsImport: false,
        icsEventUid: null
      });
    });

    console.log('Disponibilités à ajouter (individuelles):', toAdd.length);

    // Traiter les suppressions
    // Grouper les créneaux supprimés par disponibilité originale
    const removedByDisponibilite: { [key: number]: TimeSlot[] } = {};
    
    this.removedSlots.forEach(slot => {
      if (slot['disponibiliteId']) {
        if (!removedByDisponibilite[slot['disponibiliteId']]) {
          removedByDisponibilite[slot['disponibiliteId']] = [];
        }
        removedByDisponibilite[slot['disponibiliteId']].push(slot);
      }
    });

    console.log('Disponibilités avec suppressions:', Object.keys(removedByDisponibilite).length);

    // Pour chaque disponibilité originale avec des suppressions
    Object.keys(removedByDisponibilite).forEach(disponibiliteIdStr => {
      const disponibiliteId = parseInt(disponibiliteIdStr);
      const removedSlotsForDispo = removedByDisponibilite[disponibiliteId];
      
      console.log(`\nTraitement disponibilité ${disponibiliteId}:`);
      console.log(`  Créneaux supprimés: ${removedSlotsForDispo.length}`);
      
      // Récupérer tous les créneaux de cette disponibilité
      const allSlotsOfDisponibilite = this.timeSlots.filter(s => s['disponibiliteId'] === disponibiliteId);
      
      console.log(`  Total créneaux de cette disponibilité: ${allSlotsOfDisponibilite.length}`);
      
      // Trier par heure
      allSlotsOfDisponibilite.sort((a, b) => a.hour - b.hour);
      
      // Identifier les segments restants (créneaux toujours sélectionnés)
      const remainingSegments: TimeSlot[][] = [];
      let currentSegment: TimeSlot[] = [];
      
      allSlotsOfDisponibilite.forEach(slot => {
        console.log(`    Slot ${slot.hour}h: isSelected=${slot.isSelected}`);
        if (slot.isSelected) {
          currentSegment.push(slot);
        } else {
          if (currentSegment.length > 0) {
            remainingSegments.push(currentSegment);
            currentSegment = [];
          }
        }
      });
      
      if (currentSegment.length > 0) {
        remainingSegments.push(currentSegment);
      }
      
      console.log(`  Segments restants: ${remainingSegments.length}`);
      
      // Supprimer la disponibilité originale
      toRemove.push(disponibiliteId);
      
      // Créer les nouvelles disponibilités pour les segments restants
      // Chaque segment devient une disponibilité (fusionnée si consécutive)
      remainingSegments.forEach((segment, segIdx) => {
        const startSlot = segment[0];
        const durationHours = segment.length;
        
        console.log(`    Segment ${segIdx}: ${startSlot.hour}h, durée ${durationHours}h`);
        
        toAdd.push({
          date: this.getDateForDay(startSlot.dayIndex),
          heureDebut: startSlot.startTime,
          duree: durationHours * 60,
          isAvailable: true,
          reason: null,
          fromIcsImport: false,
          icsEventUid: null
        });
      });
    });

    console.log('\n=== RESULTAT FINAL ===');
    console.log('À ajouter:', toAdd.length);
    console.log('À supprimer:', toRemove.length);
    console.log('=== FIN processAvailabilityChanges ===\n');

    return { toAdd, toRemove };
  }

  finalizeSave(): void {
    this.addedSlots = [];
    this.removedSlots = [];

    this.notificationService.success('Disponibilités enregistrées avec succès');
    this.saving = false;
    
    // Réinitialiser le calendrier et recharger les disponibilités
    this.initializeTimeSlots();
    this.loadAvailabilities();
  }

  mergeConsecutiveSlots(slots: TimeSlot[]): any[] {
    if (slots.length === 0) return [];

    // Grouper par jour
    const slotsByDay: { [key: number]: TimeSlot[] } = {};
    slots.forEach(slot => {
      if (!slotsByDay[slot.dayIndex]) {
        slotsByDay[slot.dayIndex] = [];
      }
      slotsByDay[slot.dayIndex].push(slot);
    });

    const merged: any[] = [];

    // Pour chaque jour, fusionner les créneaux consécutifs
    Object.keys(slotsByDay).forEach(dayIndex => {
      const daySlotsArray = slotsByDay[parseInt(dayIndex)];
      
      // Trier par heure
      daySlotsArray.sort((a, b) => a.hour - b.hour);

      let currentBlock: TimeSlot | null = null;
      let blockEndHour = 0;

      daySlotsArray.forEach(slot => {
        if (currentBlock === null) {
          currentBlock = slot;
          blockEndHour = slot.hour + 1;
        } else if (slot.hour === blockEndHour) {
          blockEndHour = slot.hour + 1;
        } else {
          merged.push({
            date: this.getDateForDay(currentBlock.dayIndex),
            heureDebut: currentBlock.startTime, // Format: "HH:mm"
            duree: (blockEndHour - currentBlock.hour) * 60,
            isAvailable: true,
            reason: null,
            fromIcsImport: false,
            icsEventUid: null
          });

          currentBlock = slot;
          blockEndHour = slot.hour + 1;
        }
      });

      if (currentBlock !== null) {
        merged.push({
          date: this.getDateForDay(currentBlock.dayIndex),
          heureDebut: currentBlock.startTime, // Format: "HH:mm"
          duree: (blockEndHour - currentBlock.hour) * 60,
          isAvailable: true,
          reason: null,
          fromIcsImport: false,
          icsEventUid: null
        });
      }
    });

    return merged;
  }

  getDateForDay(dayIndex: number): string {
    const date = new Date(this.currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    date.setHours(0, 0, 0, 0);
    
    // Formater la date en YYYY-MM-DD sans conversion timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  getSelectedCount(): number {
    return this.timeSlots.filter(slot => slot.isSelected).length;
  }

  hasChanges(): boolean {
    return this.addedSlots.length > 0 || this.removedSlots.length > 0;
  }

  isCurrentWeek(): boolean {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    
    return this.currentWeekStart.toDateString() === weekStart.toDateString();
  }
}

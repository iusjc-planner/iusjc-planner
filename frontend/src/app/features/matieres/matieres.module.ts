import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatieresRoutingModule } from './matieres-routing.module';
import { MatiereListComponent } from './matiere-list/matiere-list.component';
import { MatiereFormComponent } from './matiere-form/matiere-form.component';
import { MatiereDetailComponent } from './matiere-detail/matiere-detail.component';

@NgModule({
  declarations: [
    MatiereListComponent,
    MatiereFormComponent,
    MatiereDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MatieresRoutingModule
  ]
})
export class MatieresModule { }

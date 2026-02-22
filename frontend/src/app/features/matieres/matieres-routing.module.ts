import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatiereListComponent } from './matiere-list/matiere-list.component';
import { MatiereDetailComponent } from './matiere-detail/matiere-detail.component';
import { MatiereFormComponent } from './matiere-form/matiere-form.component';

const routes: Routes = [
  { path: '', component: MatiereListComponent },
  { path: 'new', component: MatiereFormComponent },
  { path: ':id', component: MatiereDetailComponent },
  { path: ':id/edit', component: MatiereFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MatieresRoutingModule { }

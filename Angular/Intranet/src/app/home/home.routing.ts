import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { homeComponent } from './home.component';

const routes: Routes = [
  { path: '', component: homeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class homeRoutingModule { }

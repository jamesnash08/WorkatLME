import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { dimensionerComponent } from './dimensioner.component';

const routes: Routes = [
  { path: '', component: dimensionerComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class dimensionerRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PotentialCalculatorComponent } from './potential-calculator/potential-calculator.component';

const appRoutes: Routes = [
  { path: '', component: PotentialCalculatorComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { PotentialCalculatorComponent } from './potential-calculator/potential-calculator.component';

@NgModule({
  declarations: [AppComponent, PotentialCalculatorComponent],
  imports: [AppRoutingModule, BrowserModule, MaterialModule, NoopAnimationsModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

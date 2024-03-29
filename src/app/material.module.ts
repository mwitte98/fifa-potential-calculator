import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  imports: [DragDropModule, MatIconModule, MatInputModule, MatListModule, MatSelectModule, MatToolbarModule],
  exports: [DragDropModule, MatIconModule, MatInputModule, MatListModule, MatSelectModule, MatToolbarModule],
  providers: [{ provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: { disabled: true } }]
})
export class MaterialModule {}

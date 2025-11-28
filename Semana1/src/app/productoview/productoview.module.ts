import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';

import { ProductoviewPageRoutingModule } from './productoview-routing.module';

import { ProductoviewPage } from './productoview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductoviewPageRoutingModule,
    MatFormFieldModule,
    MatInputModule ,
    MatButtonModule,
    MatIconModule 
  ],
  declarations: [ProductoviewPage]
})
export class ProductoviewPageModule {}

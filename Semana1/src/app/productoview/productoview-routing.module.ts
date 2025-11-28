import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductoviewPage } from './productoview.page';

const routes: Routes = [
  {
    path: '',
    component: ProductoviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductoviewPageRoutingModule {}

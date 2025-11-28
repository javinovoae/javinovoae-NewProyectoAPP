import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../guards/auth.guard'; 

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'cuenta',
        loadChildren: () => import('../cuenta/principal.module').then(m => m.PrincipalPageModule),
        canActivate: [AuthGuard] 
      },
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule),
        canActivate: [AuthGuard] 
      },
      {
        path: 'historial-ventas',
        loadChildren: () => import('../historial-ventas/historial-ventas.module').then(m => m.HistorialVentasPageModule),
        canActivate: [AuthGuard] 
      },
      {
        path: 'inventario',
        loadChildren: () => import('../inventario/inventario.module').then(m => m.InventarioPageModule),
        canActivate: [AuthGuard] 
      },
      {
        path: 'evento',
        loadChildren: () => import('../evento/evento.module').then(m => m.EventoPageModule),
        canActivate: [AuthGuard] 
      },
      {
        path: 'productoview/:id',
        loadChildren: () => import('../productoview/productoview.module').then(m => m.ProductoviewPageModule),
        canActivate: [AuthGuard] 
      },
      {
        path: 'venta',
        loadChildren: () => import('../venta/venta.module').then(m => m.VentaPageModule),
        canActivate: [AuthGuard] 
      },

      { 
        path: '',
        redirectTo: '/tabs/home', 
        pathMatch: 'full'
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
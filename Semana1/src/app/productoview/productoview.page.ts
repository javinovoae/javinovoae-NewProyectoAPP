import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { Product } from '../models/product.model'; 

@Component({
  selector: 'app-productoview',
  templateUrl: './productoview.page.html',
  styleUrls: ['./productoview.page.scss'],
  standalone: false,
})
export class ProductoviewPage implements OnInit {

  productosInventario: Product[] = [];

  userId: number | null = null; 

  constructor(
    private router: Router,
    private toastController: ToastController,
    private apiService: ApiService 
  ) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.checkAndLoadUserAndProducts(); 
  }
  private checkAndLoadUserAndProducts() {
    const storedUserIdString = localStorage.getItem('userId'); 

    if (storedUserIdString) {
      this.userId = parseInt(storedUserIdString, 10);
      this.loadProductosFromAPI();
    } else {
      this.userId = null; 
      this.presentToast('No se ha iniciado sesión. Por favor, inicie sesión.', 'warning');
      this.router.navigateByUrl('/login', { replaceUrl: true }); 
    }
  }

  loadProductosFromAPI() {
    if (this.userId === null) {
      console.warn('userId es null. No se pueden cargar productos para vista de inventario.');
      this.presentToast('Error: Usuario no identificado para cargar productos.', 'danger');
      return;
    }

    // Llama al servicio para obtener los productos del backend
    this.apiService.getProductos(this.userId).subscribe({
      next: (data) => {
        this.productosInventario = data;
        if (this.productosInventario.length === 0) {
          this.presentToast('No hay productos en inventario. Por favor, agregue algunos.', 'warning');
          this.router.navigate(['/tabs', 'inventario']);
        }
      },
      error: (err: any) => { 
        console.error('Error al cargar productos para vista:', err);
        const errorMessage = err.message || 'Desconocido';
        this.presentToast('Error al cargar productos: ' + errorMessage, 'danger');
        this.router.navigate(['/tabs', 'inventario']);
      }
    });
  }
  // Función para redirigir al inventario si se desea editar o añadir
  redirigirAInventario() {
    this.router.navigate(['/tabs', 'inventario']);
  }

  aceptarProductos() {
    if (this.productosInventario.length === 0) {
      this.presentToast('No hay productos para aceptar. Por favor, añada algunos en el inventario.', 'danger');
      return;
    }

    // Aquí, en lugar de localStorage, podrías considerar si necesitas enviar
    // estos productos a otro endpoint de tu API (ej. /ventas/dia)
    // Por ahora, mantendremos la lógica de localStorage si es solo para el frontend
    localStorage.setItem('productosParaVentaDelDia', JSON.stringify(this.productosInventario));
    this.presentToast('Productos listos para comenzar las ventas!', 'success');

    this.router.navigate(['/tabs','venta']);
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}

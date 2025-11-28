import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Product } from '../models/product.model'; 
import { CantidadTicketCreate, TicketCreate, TicketResponse} from '../models/venta.model';
import { HttpErrorResponse } from '@angular/common/http'; 
import { Event } from '../models/event.model'; 


interface ProductoVenta {
  id: number; 
  nombre: string;
  costo: number;
  cantidad: number; 
  subtotal: number; 
}

@Component({
  selector: 'app-venta',
  templateUrl: './venta.page.html',
  styleUrls: ['./venta.page.scss'],
  standalone: false,
})

export class VentaPage implements OnInit {
  ventaForm!: FormGroup;
  productosParaVenta: ProductoVenta[] = [];
  nombreEvento: string = 'Cargando evento...'; 
  fechaEvento: string = 'Cargando fecha...'; 
  currentUserId: number | null = null; 
  currentEventId: number | null = null; 

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private router: Router,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.checkAndLoadUserAndEvent(); 
    this.initForm();
    this.calcularTotales();
  }

  ionViewWillEnter() {
    this.checkAndLoadUserAndEvent(); 
    this.getProductosFormArray().clear(); 
    this.loadProductosParaVenta();
    this.calcularTotales();
  }

  private checkAndLoadUserAndEvent() {
    const storedUserIdString = localStorage.getItem('userId');
    const storedEvento = localStorage.getItem('eventoInfo');

    if (storedUserIdString) {
      this.currentUserId = parseInt(storedUserIdString, 10);
    } else {
      this.presentToast('No se ha iniciado sesión. Por favor, inicie sesión.', 'warning');
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    if (storedEvento) {
      const eventoInfo = JSON.parse(storedEvento);
      this.nombreEvento = eventoInfo.nombreEvento || 'Evento sin nombre';
      this.fechaEvento = eventoInfo.fechaEvento || 'Fecha sin especificar';
      this.currentEventId = eventoInfo.id; 
      if (!this.currentEventId) {
        this.presentToast('ID de evento no encontrado. Seleccione un evento válido.', 'warning');

        return;
      }
    } else {
      this.presentToast('No se encontró información del evento. Cree uno en la sección Eventos.', 'warning');

      return;
    }
    this.loadProductosParaVenta();
  }


  initForm() {
    this.ventaForm = this.fb.group({
      productos: this.fb.array([]),
      totalVenta: [{ value: 0, disabled: true }],
    });

    this.getProductosFormArray().valueChanges.subscribe(() => this.calcularTotales());
  }

  getProductosFormArray(): FormArray {
    return this.ventaForm.get('productos') as FormArray;
  }

loadProductosParaVenta() {
    if (this.currentUserId === null) {
      console.warn('userId es null. No se pueden cargar productos para venta.');
      this.presentToast('Usuario no identificado. No se pueden cargar productos.', 'danger');
      return;
    }

    this.apiService.getProductos(this.currentUserId).subscribe({
      next: (data: Product[]) => {
        if (data.length === 0) {
          this.presentToast('No hay productos en tu inventario para vender. Agrega productos en la sección Inventario.', 'warning');
          this.router.navigate(['/tabs', 'inventario']);
          return;
        }

        this.productosParaVenta = data.map(p => ({
          id: p.id,
          nombre: p.name,
          costo: p.price,
          cantidad: 0,
          subtotal: 0
        }));

        while (this.getProductosFormArray().length !== 0) {
          this.getProductosFormArray().removeAt(0);
        }

        this.productosParaVenta.forEach(producto => {
          this.getProductosFormArray().push(this.fb.group({
            id: [producto.id],
            nombre: [producto.nombre],
            costo: [producto.costo],
            cantidad: [0, [Validators.required, Validators.min(0)]],
            subtotal: [{ value: 0, disabled: true }]
          }));
        });
        this.calcularTotales();
      },
      error: (err: HttpErrorResponse) => { 
        console.error('Error al cargar productos para venta:', err);
        const errorMessage = err.message || 'Desconocido';
        this.presentToast('Error al cargar productos para venta: ' + errorMessage, 'danger');
        this.router.navigate(['/tabs', 'inventario']);
      }
    });
  }


  onCantidadChange(index: number) {
    const productoControl = this.getProductosFormArray().at(index);
    const cantidad = productoControl.get('cantidad')?.value || 0;
    const costo = productoControl.get('costo')?.value || 0;
    const subtotal = cantidad * costo;

    productoControl.get('subtotal')?.setValue(subtotal);
    this.productosParaVenta[index].cantidad = cantidad;
    this.productosParaVenta[index].subtotal = subtotal;

    this.calcularTotales();
  }

  calcularTotales() {
    let total = 0;
    this.getProductosFormArray().controls.forEach(control => {
      total += control.get('subtotal')?.value || 0;
    });
    this.ventaForm.get('totalVenta')?.setValue(total);
  }


  async realizarPago() {

    if (this.currentUserId === null || this.currentEventId === null) {
      this.presentToast('Error: Usuario o evento no identificado para registrar la venta.', 'danger');
      return;
    }

    const totalVenta = this.ventaForm.get('totalVenta')?.value;
    if (totalVenta <= 0) {
        this.presentToast('El total de la venta debe ser mayor a cero para registrarla.', 'warning');
        return;
    }

    const productosVendidosForm = this.getProductosFormArray().value as ProductoVenta[];
    const ticketItems: CantidadTicketCreate[] = productosVendidosForm
      .filter(p => p.cantidad > 0)
      .map(p => ({
        product_id: p.id, 
        cantidad_prod_ticket: p.cantidad
      }));

    if (ticketItems.length === 0) {
      this.presentToast('Debe seleccionar al menos un producto con una cantidad mayor a cero para registrar la venta.', 'warning');
      return;
    }

    const ticketData: TicketCreate = {
      buyer_id: this.currentUserId,
      event_id: this.currentEventId,
      ticket_items: ticketItems,
    };

    console.log('Datos de venta a enviar:', ticketData);

    this.apiService.createTicket(ticketData).subscribe({
      next: (response: TicketResponse) => {
        console.log('Venta registrada exitosamente en el backend:', response);
        this.presentToast('¡Venta registrada con éxito!', 'success');
        this.resetVenta();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al registrar venta:', err);
        const errorMessage = err.error?.detail || err.message || 'Error al registrar la venta.';
        this.presentToast('Error al registrar venta: ' + errorMessage, 'danger');
      }
    });
  }

  resetVenta() {
    this.ventaForm.reset({
      totalVenta: 0,
    });
    while (this.getProductosFormArray().length !== 0) {
      this.getProductosFormArray().removeAt(0);
    }
    this.productosParaVenta = [];
    this.loadProductosParaVenta(); 
  }

  redirigirHistorial() {
    this.router.navigate(['/tabs', 'historial-ventas']);
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
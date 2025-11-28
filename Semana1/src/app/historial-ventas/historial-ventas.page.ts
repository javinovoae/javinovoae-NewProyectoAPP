import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router,ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service'; // Importar ApiService
import { HttpErrorResponse } from '@angular/common/http';
import { TicketCreate,TicketResponse} from '../models/venta.model'; // Ajusta la ruta y el nombre si es diferente


interface TicketDisplay {
  id: number;
  sale_date: string; 
  price_ticket: number; 
  ticket_items: {
    product_id: number;
    cantidad_prod_ticket: number;
  }[];
}

@Component({
  selector: 'app-historial-ventas',
  templateUrl: './historial-ventas.page.html',
  styleUrls: ['./historial-ventas.page.scss'],
  standalone: false,
})
export class HistorialVentasPage implements OnInit {
  
  historialVentas: TicketResponse[] = [];
 // Cambiado a historialTickets para reflejar que son tickets de la API
  totalGeneralVentas: number = 0;
  nombreEvento: string = 'Cargando evento...';
  fechaEvento: string = 'Cargando fecha...';
  currentUserId: number | null = null;
  currentEventId: number | null = null;

  constructor(
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private apiService: ApiService // Inyecta el ApiService
  ) { }

  ngOnInit() {
    this.loadEventInfo();
    // La carga de historial se hace en ionViewWillEnter para asegurar que se actualice al volver
  }
ionViewWillEnter() {
    // Recargamos la información del evento y el historial cada vez que se entra a la página
    this.loadEventInfo();
    this.loadHistorialVentas(); // Llama a la carga aquí
  }

  loadEventInfo() {
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
        this.router.navigateByUrl('/tabs/eventos', { replaceUrl: true });
        return;
      }
    } else {
      this.presentToast('No se encontró información del evento. Cree uno en la sección Eventos.', 'warning');
      this.router.navigateByUrl('/tabs/eventos', { replaceUrl: true });
      return;
    }
  }

  /**
   * Carga el historial de ventas (tickets) desde el backend a través de ApiService.
   */

  loadHistorialVentas() {
    if (this.currentEventId === null || this.currentUserId === null) {
      this.presentToast('No se puede cargar el historial de ventas: ID de evento o usuario no disponible.', 'danger');
      this.historialVentas = []; // Asegurarse de limpiar por si acaso
      this.totalGeneralVentas = 0;
      return;
    }

    // ¡Aquí usamos tu método del ApiService!
    this.apiService.getTicketsByEventAndUser(this.currentEventId, this.currentUserId).subscribe({
      next: (tickets: TicketResponse[]) => {
        console.log('Tickets cargados para el usuario y evento:', tickets);
        this.historialVentas = tickets; // Asigna los tickets directamente a historialVentas

        // Calcula el total general de ventas a partir de los tickets cargados
        this.calcularTotalGeneralVentas();


        if (this.historialVentas.length === 0) {
          this.presentToast('No hay tickets registrados para este evento y usuario.', 'info');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar el historial de ventas:', err);
        const errorMessage = err.error?.detail || err.message || 'Error desconocido al cargar historial.';
        this.presentToast('Error al cargar el historial de ventas: ' + errorMessage, 'danger');
        this.historialVentas = []; // Limpia el array en caso de error
        this.totalGeneralVentas = 0; // Reinicia el total
      }
    });
  }

  /**
   * Calcula el total general de ventas sumando el precio de todos los tickets cargados.
   */
  calcularTotalGeneralVentas() {
    this.totalGeneralVentas = this.historialVentas.reduce((acc, ticket) => acc + ticket.price_ticket, 0);
  }

  /**
   * Método para mostrar mensajes Toast.
   */
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
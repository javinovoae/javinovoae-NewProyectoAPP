import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular'; 
import { Router } from '@angular/router';
import { ApiService } from '../../app/services/api.service'; 
import { Event, EventCreate }  from '../../app/models/event.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.page.html',
  styleUrls: ['./evento.page.scss'],
  standalone: false,
})
export class EventoPage implements OnInit {
  nombreEvento: string = '';
  fechaEvento: Date | null = null;

  constructor(
    private toastController: ToastController,
    private router: Router,
    private apiService: ApiService, 
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  async guardarInformacionEvento() {
    if (!this.nombreEvento || !this.fechaEvento) {
      this.presentToast('Por favor, rellene todos los campos.', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando evento...',
    });
    await loading.present();

    //recuperar el id de la persona usando la app
    const loggedInUserIdString = localStorage.getItem('userId');
    if (!loggedInUserIdString) {
      await loading.dismiss();
      this.presentToast('Debe iniciar sesión para crear un evento.', 'danger');
      this.router.navigateByUrl('/tabs/login'); 
      return;
    }
    const loggedInUserId = parseInt(loggedInUserIdString, 10); 

    const eventDateFormatted = this.fechaEvento.toISOString();
    
    // envio a la api
    const eventData: EventCreate = {
      name: this.nombreEvento,
      event_date: this.fechaEvento.toISOString(),
      manager_id: loggedInUserId, 
    };

    // ---  buscar si el evento ya existe ---
    this.apiService.searchEventByNameDateManager(this.nombreEvento, eventDateFormatted, loggedInUserId).subscribe({
      next: async (existingEvent: Event | null) => {
        if (existingEvent) {
          
          const eventoInfo = {
            nombreEvento: existingEvent.name,
            fechaEvento: existingEvent.event_date,
            id: existingEvent.id
          };
          localStorage.setItem('eventoInfo', JSON.stringify(eventoInfo));

          await loading.dismiss();
          console.log('Evento ya existe, cargando productos asociados:', existingEvent);
          await this.presentToast('El evento ya existe. Cargando sus productos.', 'success');
          this.router.navigate(['/tabs/productoview', existingEvent.id]); 
        } else {
          // Si el evento NO EXISTE, procede a crearlo
          const eventData: EventCreate = {
            name: this.nombreEvento,
            event_date: eventDateFormatted,
            manager_id: loggedInUserId,
          };

          this.apiService.createEvent(eventData).subscribe({
            next: async (res) => {
              await loading.dismiss();
              console.log('Evento creado exitosamente:', res);
              await this.presentToast('Evento guardado correctamente.', 'success');
              
              //objeto con la informacion 
              const eventoInfo = {
              nombreEvento: res.name, 
              fechaEvento: res.event_date, 
              id: res.id 
            };

            // 2. Convierte el objeto a una cadena JSON y guárdalo en localStorage
            localStorage.setItem('eventoInfo', JSON.stringify(eventoInfo));
            console.log('Información del evento guardada en localStorage:', eventoInfo);

              this.router.navigate(['/tabs/productoview', res.id]);
            },
            error: async (err) => {
              await loading.dismiss();
              console.error('Error al crear evento:', err);
              const errorMessage = err.message || 'No se pudo crear el evento. Inténtalo de nuevo.';
              await this.presentToast(errorMessage, 'danger');
            }
          });
        }
      },
      error: async (err: HttpErrorResponse) => {
        // Error durante la búsqueda inicial
        await loading.dismiss();
        console.error('Error al buscar evento existente:', err);
        const errorMessage = err.message || 'No se pudo verificar el evento. Inténtalo de nuevo.';
        await this.presentToast(errorMessage, 'danger');
      }
    });
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
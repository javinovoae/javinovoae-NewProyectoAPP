import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NavController, IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs'; 
import { EventoPage } from './evento.page';
import { ApiService } from '../../app/services/api.service';
import { FormsModule } from '@angular/forms'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// Objeto mock 
const mockEvent = {
  id: 123,
  name: 'Evento de prueba',
  event_date: new Date().toISOString(), 
  total_earnings: 100,
  manager_id: 1
};

describe('EventoPage', () => {
  let component: EventoPage;
  let fixture: ComponentFixture<EventoPage>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;
  let routerSpy: jasmine.SpyObj<Router>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

  beforeEach(waitForAsync(() => {
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['searchEventByNameDateManager', 'createEvent']);
    navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward']);

    // Configura el espía de ApiService 
    apiServiceSpy.searchEventByNameDateManager.and.returnValue(of(mockEvent));
    apiServiceSpy.createEvent.and.returnValue(of(mockEvent));

    TestBed.configureTestingModule({
      declarations: [EventoPage],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatIconModule,
        MatNativeDateModule,
      ],
      providers: [
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: LoadingController, useValue: loadingControllerSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EventoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // validar campos vacíos
  it('debería mostrar una alerta si el nombre del evento está vacío', async () => {
    const createSpy = toastControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    } as any));

    component.nombreEvento = ''; 
    component.fechaEvento = new Date();
    
    await component.guardarInformacionEvento();

    expect(createSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      message: 'Por favor, rellene todos los campos.',
      color: 'danger'
    }));
  });

  // FechaEvento vacío/nulo
  it('debería mostrar una alerta si la fecha del evento está vacía', async () => {
    const createSpy = toastControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    } as any));

    component.nombreEvento = 'Mi Evento Válido'; 
    component.fechaEvento = null; 

    await component.guardarInformacionEvento();

    expect(createSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      message: 'Por favor, rellene todos los campos.',
      color: 'danger'
    }));
  });

  // cambos campos (nombre y fecha) están vacíos
  it('debería mostrar una alerta si ambos campos (nombre y fecha) están vacíos', async () => {
    const createSpy = toastControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    } as any));

    component.nombreEvento = '';    
    component.fechaEvento = null;  

    await component.guardarInformacionEvento();

    expect(createSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      message: 'Por favor, rellene todos los campos.',
      color: 'danger'
    }));
  });
});
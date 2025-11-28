import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PrincipalPage } from './principal.page';
import { ApiService } from '../services/api.service';


// Aquí se declara la variable del espía
let apiServiceSpy: jasmine.SpyObj<ApiService>;

describe('PrincipalPage', () => {
  let component: PrincipalPage;
  let fixture: ComponentFixture<PrincipalPage>;

  beforeEach(waitForAsync(() => {
    // 1. Aquí se inicializa el espía
    // (Reemplaza 'yourMethod' con el nombre del método que tu componente usa de ApiService)
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['yourMethod']);

TestBed.configureTestingModule({
      declarations: [ PrincipalPage ],
      imports: [
        IonicModule.forRoot(),
        FormsModule, // Necesario para 'ngModel'
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        BrowserAnimationsModule // Importa esto para que las animaciones de Material funcionen
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // Necesario para 'lottie-player'
    }).compileComponents();

    fixture = TestBed.createComponent(PrincipalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

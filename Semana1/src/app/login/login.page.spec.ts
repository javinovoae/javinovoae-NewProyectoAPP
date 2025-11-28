import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { IonicModule, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiService } from '../../app/services/api.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http'; 

// Mocks de datos de respuesta

const mockSuccessfulLoginResponse = {
  token: 'mock-jwt-token',
  user_id: 1,
  username: 'validUser', 
};

const mockLoginError = new Error('Credenciales inválidas');

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;
  let routerSpy: jasmine.SpyObj<Router>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let errorMessage = 'Ocurrió un error inesperado al iniciar sesión.';


  beforeEach(waitForAsync(() => {
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    apiServiceSpy = jasmine.createSpyObj<ApiService>('ApiService', ['login']);
    
    toastControllerSpy.create.and.returnValue(Promise.resolve({ present: () => Promise.resolve() } as any));
    loadingControllerSpy.create.and.returnValue(Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() } as any));
    alertControllerSpy.create.and.returnValue(Promise.resolve({ present: () => Promise.resolve() } as any));

    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: LoadingController, useValue: loadingControllerSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AlertController, useValue: alertControllerSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería establecer globalError si los campos están vacíos', async () => {
    component.username = '';
    component.password = '';
    fixture.detectChanges();

    await component.login();
    fixture.detectChanges();

    expect(component.globalError).toBe('Por favor, complete todos los campos.');
    expect(apiServiceSpy.login).not.toHaveBeenCalled();
  });

  describe('Flujo de Login', () => {

    it('debería permitir login exitoso', async () => {
    component.username = 'validUser';
    component.password = '1234';
    apiServiceSpy.login.and.returnValue(of(mockSuccessfulLoginResponse));

    await component.login();
    fixture.detectChanges(); 

    expect(apiServiceSpy.login).toHaveBeenCalledWith({
      username: 'validUser',
      password: '1234'
    });

  });

});
});
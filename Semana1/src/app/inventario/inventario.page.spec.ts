import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs'; 
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NavController } from '@ionic/angular';
import { InventarioPage } from './inventario.page';
import { ApiService } from '../services/api.service';
import { Product, ProductCreate } from '../models/product.model';

// --- MOCK DATA ---
const mockProductList: Product[] = [
  { id: 1, name: 'Laptop', price: 1500 },
  { id: 2, name: 'Mouse', price: 25 }
];

const mockNewProduct: Product = {
  id: 3,
  name: 'Teclado',
  price: 75,
};

const mockHttpError = new HttpErrorResponse({
  error: { detail: 'Error de prueba' },
  status: 404,
  statusText: 'Not Found'
});

describe('InventarioPage', () => {
  let component: InventarioPage;
  let fixture: ComponentFixture<InventarioPage>;

  // Spies para las dependencias del componente
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

  beforeEach(waitForAsync(() => {
    // 1. Configurar los spies
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getProductos', 'createProducto', 'deleteProducto']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateBack', 'setRoot']); 

    // Mock para el método `create` de ToastController
    toastControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve(),
      dismiss: () => Promise.resolve()
    } as any));

    // 2. Configurar el TestBed
    TestBed.configureTestingModule({
      declarations: [InventarioPage],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        // Incluye los módulos de Material para evitar errores en el template
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatDatepickerModule,
      ],
      providers: [
        // Proveedores mock para las dependencias
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavController, useValue: navControllerSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Para elementos como 'lottie-player'
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioPage);
    component = fixture.componentInstance;
  }));

  // --- PRUEBA BÁSICA ---
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // --- ionViewWillEnter y manejo de usuario ---
  describe('ionViewWillEnter', () => {
    let localStorageSpy: jasmine.Spy;

    beforeEach(() => {
      // Espía el método `getItem` de `localStorage` antes de cada prueba
      localStorageSpy = spyOn(localStorage, 'getItem');
    });

    it('debería cargar el usuario y productos si la sesión está guardada', () => {
      localStorageSpy.and.callFake((key: string) => {
        if (key === 'username') return 'TestUser';
        if (key === 'userId') return '123';
        return null;
      });

      // Mockear la llamada a `getProductos` para que no de error
      apiServiceSpy.getProductos.and.returnValue(of(mockProductList));

      // Llamar al método del ciclo de vida
      component.ionViewWillEnter();

      // Verificar que las propiedades del componente se han actualizado
      expect(component.username).toBe('TestUser');
      expect(component.userId).toBe(123);
      // Verificar que se llamó a la API para cargar productos
      expect(apiServiceSpy.getProductos).toHaveBeenCalledWith(123);
    });

    it('debería mostrar toast y redirigir a /login si no hay sesión', () => {
      localStorageSpy.and.returnValue(null); // Simular que no hay nada en localStorage

      component.ionViewWillEnter();

      // Verificar que se llamó al toast
      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'No se ha iniciado sesión. Por favor, inicie sesión.',
        color: 'warning'
      }));
      // Verificar que se llamó a la redirección
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login', { replaceUrl: true });
    });
  });

  // --- guardarProducto ---
  describe('guardarProducto', () => {
    it('debería mostrar un toast si los campos están vacíos o inválidos', async () => {
      component.nombreProducto = '';
      component.costoProducto = 0;

      await component.guardarProducto();

      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Por favor, ingrese un nombre y un costo válido (mayor a 0) para el producto.',
        color: 'danger'
      }));
      expect(apiServiceSpy.createProducto).not.toHaveBeenCalled();
    });

    it('debería mostrar un toast si el usuario no está identificado', async () => {
      component.nombreProducto = 'Producto válido';
      component.costoProducto = 10;
      component.userId = null; // Simular usuario no identificado

      await component.guardarProducto();

      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Error: Usuario no identificado para guardar el producto.',
        color: 'danger'
      }));
      expect(apiServiceSpy.createProducto).not.toHaveBeenCalled();
    });

    it('debería guardar el producto y actualizar la lista', async () => {
      component.nombreProducto = 'Teclado';
      component.costoProducto = 75;
      component.userId = 123;
      component.productosGuardados = [...mockProductList]; // Lista inicial
      
      // Mockear la llamada exitosa a la API
      apiServiceSpy.createProducto.and.returnValue(of(mockNewProduct));

      await component.guardarProducto();

      // Verificar que la API fue llamada con los datos correctos
      expect(apiServiceSpy.createProducto).toHaveBeenCalledWith({
        name: 'Teclado',
        price: 75,
        user_id: 123
      });
      // Verificar que el producto fue añadido a la lista
      expect(component.productosGuardados.length).toBe(3);
      expect(component.productosGuardados[2]).toEqual(mockNewProduct);
      // Verificar que los campos se limpiaron y se mostró el toast de éxito
      expect(component.nombreProducto).toBe('');
      expect(component.costoProducto).toBeNull();
      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Producto guardado correctamente.',
        color: 'success'
      }));
    });

    it('debería mostrar un toast de error si la API falla', async () => {
      component.nombreProducto = 'Teclado';
      component.costoProducto = 75;
      component.userId = 123;
      
      // Mockear la llamada fallida a la API
      apiServiceSpy.createProducto.and.returnValue(throwError(() => mockHttpError));

      await component.guardarProducto();

      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Error de prueba',
        color: 'danger'
      }));
    });
  });

  // --- eliminarProducto ---
  describe('eliminarProducto', () => {
    beforeEach(() => {
        // Inicializar la lista de productos para cada prueba
        component.productosGuardados = [...mockProductList];
        component.userId = 123;
    });

    it('debería eliminar un producto correctamente', async () => {
      apiServiceSpy.deleteProducto.and.returnValue(of()); 
      const productIdToDelete = 1;

      await component.eliminarProducto(productIdToDelete);
      await fixture.whenStable()

      // Verificar que la API fue llamada con el ID correcto
      expect(apiServiceSpy.deleteProducto).toHaveBeenCalledWith(productIdToDelete);
      // Verificar que el producto se eliminó de la lista del componente
      expect(component.productosGuardados.length).toBe(1);
      expect(component.productosGuardados.find(p => p.id === productIdToDelete)).toBeUndefined();
      // Verificar que se mostró el toast de advertencia
      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Producto eliminado.',
        color: 'warning'
      }));
    });

    it('debería mostrar un toast de error si la API falla', async () => {
      apiServiceSpy.deleteProducto.and.returnValue(throwError(() => mockHttpError));
      const productIdToDelete = 1;

      await component.eliminarProducto(productIdToDelete);
      await fixture.whenStable()
      
        const calls = toastControllerSpy.create.calls.allArgs();
  console.log('Argumentos reales pasados a toastControllerSpy.create:', JSON.stringify(calls, null, 2));

      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Error de prueba',
        color: 'danger',
        duration: 2000,   
        position: 'bottom' 
      }));
      // Verificar que el producto no se eliminó de la lista
      expect(component.productosGuardados.length).toBe(2);
    });
  });
});
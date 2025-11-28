import { ComponentFixture, TestBed,waitForAsync  } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { ProductoviewPage } from './productoview.page';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; 
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

let apiServiceSpy: jasmine.SpyObj<ApiService>;

describe('ProductoviewPage', () => {
  let component: ProductoviewPage;
  let fixture: ComponentFixture<ProductoviewPage>;

  beforeEach(waitForAsync(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['yourMethod']);

    TestBed.configureTestingModule({
      declarations: [ProductoviewPage],
      imports: [
      IonicModule.forRoot(),
      MatIconModule, 
      MatFormFieldModule, 
      MatInputModule, 
      MatNativeDateModule ,
      FormsModule 
  ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
import { ComponentFixture, TestBed,waitForAsync  } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { RegistroPage } from './registro.page';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; 
import { MatNativeDateModule } from '@angular/material/core';

let apiServiceSpy: jasmine.SpyObj<ApiService>;

describe('RegistroPage', () => {
  let component: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;

  beforeEach(waitForAsync(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['yourMethod']);

    TestBed.configureTestingModule({
      declarations: [RegistroPage],
    imports: [
    IonicModule.forRoot(),
    MatIconModule, // <-- Añade
    MatFormFieldModule, // <-- Añade
    MatInputModule, 
    MatNativeDateModule ,
    FormsModule 
  ],
      providers: [
        // 2. Aquí se le dice al TestBed que use el espía en lugar del servicio real
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
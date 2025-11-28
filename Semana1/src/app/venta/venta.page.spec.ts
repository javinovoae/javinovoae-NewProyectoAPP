
import { ComponentFixture, TestBed,waitForAsync  } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { VentaPage } from './venta.page';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

// Mock de ActivatedRoute para pruebas
const activatedRouteMock = {
  snapshot: {
    paramMap: {
      get: (key: string) => '1' 
    }
  },
  paramMap: of(new Map([['id', '1']]))
};

let apiServiceSpy: jasmine.SpyObj<ApiService>;

describe('VentaPage', () => {
  let component: VentaPage;
  let fixture: ComponentFixture<VentaPage>;

  beforeEach(waitForAsync(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['yourMethod']);

    TestBed.configureTestingModule({
      declarations: [VentaPage],
      imports: [
        IonicModule.forRoot(),
        MatFormFieldModule, 
        MatInputModule,     
        MatIconModule       
  ],
  providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VentaPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

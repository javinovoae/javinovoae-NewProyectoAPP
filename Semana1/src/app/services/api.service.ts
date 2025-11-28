
import { Observable, from, throwError } from 'rxjs'; 
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,HttpParams  } from '@angular/common/http'; 
import { catchError, map } from 'rxjs/operators';
import { UserCreate, UserLogin, LoginResponse, UserProfileUpdate, UserProfile } from '../../app/models/usuario.model';
import { Event,EventCreate } from '../../app/models/event.model';
import { Product, ProductCreate } from '../models/product.model';
import { TicketCreate, TicketResponse, CantidadTicketCreate } from '../models/venta.model'; 

const API_BASE_URL = 'http://127.0.0.1:8000'; 

@Injectable({
  providedIn: 'root'
})
export class ApiService { 
  private apiUrl = API_BASE_URL; 

  constructor(
    private http: HttpClient,
  ) {}

  // Manejo de errores centralizado
  private handleError(error: HttpErrorResponse) {
    console.error('Error del API:', error); 
    let errorMessage = 'Ocurrió un error inesperado en la conexión con el servidor.';
    if (error.error instanceof ErrorEvent) {
      // Errores del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Asegúrate de que el backend esté en ejecución y la URL sea correcta.';
      } else if (error.error && error.error.detail) {
        if (typeof error.error.detail === 'string') {
          errorMessage = error.error.detail;
        } else if (Array.isArray(error.error.detail)) {
          errorMessage = error.error.detail.map((err: any) => {
            const field = err.loc.length > 1 ? err.loc[1] : 'unknown field';
            return `Campo '${field}': ${err.msg}`;
          }).join('; ');
        }
      } else if (error.status === 401) {
        errorMessage = 'Credenciales incorrectas o no autorizado.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado.';
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText || 'Error del servidor'}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  
  // Métodos de Usuario y Autenticación

  createUser(userData: UserCreate): Observable<UserProfile> { 
    return this.http.post<UserProfile>(`${this.apiUrl}/users/`, userData).pipe(
      catchError(this.handleError)
    );
  }
  
  login(credentials: UserLogin): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      catchError(this.handleError)
    );
  }

  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateUserProfile(userId: number, userData: UserProfileUpdate): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/users/${userId}`, userData).pipe(
      catchError(this.handleError)
    );
  }


  // Métodos de Eventos
  createEvent(eventData: EventCreate): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events/`, eventData).pipe( 
      catchError(this.handleError)
    );
  }

  getEventById(eventId: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${eventId}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // Buscar evento por nombre, fecha y manager_id
  searchEventByNameDateManager(eventName: string, eventDate: string, managerId: number): Observable<Event | null> {
    const params = {
      name: eventName,
      event_date: eventDate,
      manager_id: managerId.toString()
    };
    return this.http.get<Event[]>(`${this.apiUrl}/events/search/`, { params }).pipe(
      map(events => events.length > 0 ? events[0] : null),
      catchError(this.handleError)
    );
  }

  // Métodos de Productos 

  getProductos(userId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/users/${userId}/products/`).pipe(
      catchError(this.handleError) 
    );
  }

  createProducto(producto: ProductCreate): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products/`, producto).pipe(
      catchError(this.handleError) 
    );
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`).pipe(
      catchError(this.handleError) 
    );
  }

  // Métodos de Venta (Tickets)
  createTicket(ticketData: TicketCreate): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(`${this.apiUrl}/tickets/`, ticketData).pipe(
      catchError(this.handleError)
    );
  }

getTicketsByEventAndUser(eventId: number, buyerId: number): Observable<TicketResponse[]> {
    const params = new HttpParams()
      .set('event_id', eventId.toString())
      .set('buyer_id', buyerId.toString());

    return this.http.get<TicketResponse[]>(`${this.apiUrl}/tickets/`, { params }).pipe(
      catchError(this.handleError)
    );
    }

}


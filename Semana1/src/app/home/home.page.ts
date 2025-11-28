import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // <--- IMPORTA EL AUTHSERVICE


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  username: string = 'Usuario'; 

  constructor(private router: Router,
    private authService: AuthService 
  ) {}

  ngOnInit() {

        const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
      console.log('Usuario cargado desde localStorage:', storedUsername);
    }
  }

  goToProductos() {
    this.router.navigate(['/tabs/inventario']); 
  }

  goToEventos() {
    
    this.router.navigate(['/tabs/evento']); 
  }

  goToHistorial() {
    
    this.router.navigate(['/tabs/historial-ventas']); 
  }

  async logout() {
    await this.authService.logout(); // Llama al método logout de tu AuthService
    // El AuthService ya maneja la redirección a la página de login
    // Después de esto, el usuario será redirigido a /tabs/login
  }

  }




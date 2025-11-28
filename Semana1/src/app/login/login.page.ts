import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { UserLogin, LoginResponse } from '../../app/models/usuario.model';
import { ApiService } from '../../app/services/api.service';
import { AuthService } from '../../app/services/auth.service'; 



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  username: string = ''; 
  password: string = ''; 
  globalError: string = '';  
  hidePassword: boolean = true; 

  constructor(
    private router: Router,
    private apiService: ApiService, 
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.username = this.authService.getUsername() || '';
      console.log('Usuario cargado desde localStorage (vía AuthService):', this.username);
      // Opcional: Redirigir si ya está logueado, aunque PublicGuard lo haría:
      // this.router.navigate(['/tabs', 'home'], { replaceUrl: true });
    }
  }


  isFormValid(): boolean {
    return !!this.username && !!this.password;
  }

  async login() {
    if (!this.isFormValid()) {
      this.globalError = 'Por favor, complete todos los campos.';
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión',
    });
    await loading.present();

    const credentials: UserLogin = {
      username: this.username,
      password: this.password,
    };

        this.apiService.login(credentials).subscribe({
      next: async (res: LoginResponse) => {
        await loading.dismiss();
        console.log('Login exitoso:', res);
        this.globalError = ''; // Limpiar cualquier mensaje de error previo

        // **¡CORRECCIÓN AQUÍ!**
        // 1. **Eliminamos:** localStorage.setItem('username', this.username);
        // 2. **Eliminamos:** localStorage.setItem('userId', res.user_id.toString());
        // La siguiente línea (authService.login) ya hace esto por ti de forma centralizada.
        this.authService.login(res.username || this.username, res.user_id);


        const toast = await this.toastController.create({
          message: `¡Bienvenido, ${res.username || this.username}!`,
          duration: 3000,
          color: 'success',
        });
        await toast.present();

        
        this.router.navigate(['/tabs', 'home'], {
          queryParams: {
            username: res.username || this.username,
            userId: res.user_id
          },
          replaceUrl: true
        });
      },
      error: async (err: any) => {
        await loading.dismiss();
        console.error('Error durante el login:', err);

        let errorMessage = 'Ocurrió un error inesperado al iniciar sesión.';

        if (err && typeof err === 'object') {
            if (err.error && typeof err.error === 'object' && err.error.message) {
                errorMessage = err.error.message;
            } else if (err.error && typeof err.error === 'string') {
                try {
                    const parsedError = JSON.parse(err.error);
                    if (parsedError.message) {
                        errorMessage = parsedError.message;
                    } else {
                        errorMessage = err.error;
                    }
                } catch (e) {
                    errorMessage = err.error;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            if (err.status === 0) {
                errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
            } else if (err.status === 401) {
                errorMessage = 'Credenciales inválidas. Por favor, verifica tu usuario y contraseña.';
            }
        }

        const alert = await this.alertController.create({
          header: 'Error de Login',
          message: errorMessage,
          buttons: ['OK'],
        });
        await alert.present();
        this.globalError = errorMessage;
      }
    });
  }

  toggleHidePassword() {
    this.hidePassword = !this.hidePassword;
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }

  isRegisterLinkActive(): boolean {
    return true;
  }
}
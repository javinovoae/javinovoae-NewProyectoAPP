import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { UserLogin, LoginResponse,UserCreate,UserProfile } from '../../app/models/usuario.model';
import { ApiService } from '../../app/services/api.service'; 

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})

export class RegistroPage implements OnInit {
  
  registerCredentials: UserCreate = {
    username: '',
    password: '',
    is_active: true,
  };

  repeatPassword: string = ''; 

  //contraseñas ocultas
  hidePassword = true; 
  hideRepeatPassword = true; 

  // Variables para mensajes de error
  usernameError: string | null = null;
  passwordError: string | null = null;
  passwordMismatchError: string | null = null; 
  globalError: string | null = null;

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
  }

  // Lógica de validación para el username
  validateUsername() {
    this.usernameError = null;
    if (this.registerCredentials.username.length < 3) {
      this.usernameError = 'Mínimo 3 caracteres.';
    } else if (this.registerCredentials.username.length > 8) {
      this.usernameError = 'Máximo 8 caracteres.';
    }
  }

  // Lógica de validación para la contraseña (individual)
  validatePassword() {
    this.passwordError = null;
    if (this.registerCredentials.password.length < 4 || this.registerCredentials.password.length > 4) {
      this.passwordError = 'La contraseña debe tener 4 caracteres.';
    }
    this.validatePasswordMatch();
  }

  // Lógica para validar que las contraseñas coincidan 
  validatePasswordMatch() {
    this.passwordMismatchError = null;
    if (this.registerCredentials.password !== this.repeatPassword) {
      this.passwordMismatchError = 'Las contraseñas no coinciden.';
    }
  }

  // Valida todo el formulario antes de enviar
  isFormValid(): boolean {
    const isUsernameValid = this.registerCredentials.username.length >= 3 && this.registerCredentials.username.length <= 8;
    const isPasswordValid = this.registerCredentials.password.length === 4;
    const passwordsMatch = this.registerCredentials.password === this.repeatPassword;

    return isUsernameValid && isPasswordValid && passwordsMatch;
  }

  // Función para registrar al usuario 
  async register() { 
    this.globalError = null; 

    // vformulario valido 
    if (!this.isFormValid()) {
      this.globalError = 'Por favor, corrige los errores del formulario.';
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registrando usuario...',
    });
    await loading.present();

    // crear el user en ApiService
    this.apiService.createUser(this.registerCredentials).subscribe({
      next: async (res: UserProfile) => { 
        await loading.dismiss();
        console.log('Registro exitoso:', res);
        const alert = await this.alertController.create({
          header: 'Registro Exitoso',
          message: `El usuario ${res.username} ha sido creado.`,
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: async (err: any) => { 
        await loading.dismiss();
        console.error('Error durante el registro:', err);
        const alert = await this.alertController.create({
          header: 'Error de Registro',
          message: err.message || 'No se pudo registrar el usuario. Inténtalo de nuevo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  } 
}
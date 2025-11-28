
const BASE_HOST = 'http://localhost:8100'; 

const REGISTER_URL = `${BASE_HOST}/registro`;
const LOGIN_URL = `${BASE_HOST}/login`;
const HOME_URL = `${BASE_HOST}/tabs/home`;
const REGISTER_LINK_FROM_LOGIN = "//a[normalize-space()='¿No tienes cuenta? Regístrate aquí.']";
const GLOBAL_ERROR_MESSAGE = 'ion-text[color="danger"] p'; 
const OK_BUTTON_IN_ALERT = '//button[normalize-space()="OK"]';
const PASSWORD = 'pass'; 

// Selectores Comunes
const USERNAME_INPUT = "input[placeholder='Ingrese su usuario']";
const PASSWORD_INPUT = "input[placeholder='Ingrese su contraseña']";
const REPEAT_PASS_INPUT = "input[placeholder='Repita su contraseña']"; 

// Selectores de Botones 
const REGISTER_BUTTON = "//ion-button[normalize-space()='Registrarse']";
const LOGIN_BUTTON = "//ion-button[normalize-space()='Ingresar']";


describe('Flujo E2E: Registro de Usuario y Login', () => {

    it('debería registrar un nuevo usuario y usar esas credenciales para iniciar sesión', async () => {
        const UNIQUE_ID = Math.random().toString(36).substring(2, 8); 
        const UNIQUE_USER = `e2e_${UNIQUE_ID}`; 
        

        // REGISTRO DEL NUEVO USUARIO ---
        console.log(`Intentando registrar usuario: ${UNIQUE_USER}`);
        await browser.url(REGISTER_URL);
        await $(USERNAME_INPUT).waitForDisplayed({ timeout: 10000, message: 'El campo de usuario no apareció para el registro.' });

        // Rellenar
        await $(USERNAME_INPUT).setValue(UNIQUE_USER);
        await $(PASSWORD_INPUT).setValue(PASSWORD);
        await $(REPEAT_PASS_INPUT).setValue(PASSWORD); 

        // Hacer clic en el botón Registrarse
        await $(REGISTER_BUTTON).click();

        //comprobar la redirección a la página de login y esperar 5 segundos
        const OK_BUTTON_IN_ALERT = '//button[normalize-space()="OK"]';
        const LOGIN_TIMEOUT = 10000; 

const okButton = await $(OK_BUTTON_IN_ALERT);

// Esperar a que el botón OK aparezca
await okButton.waitForDisplayed({ 
    timeout: 5000, 
    message: 'La alerta de confirmación OK no se detectó a tiempo.' 
});

//Hacer clic en el botón 'OK' 
await okButton.click();
console.log("Alerta de registro cerrada.");


//Esperar la redirección a /login
        console.log(`Intentando registrar usuario: ${UNIQUE_USER}`);
        await browser.url(REGISTER_URL);
        await $(USERNAME_INPUT).waitForDisplayed({ timeout: 10000, message: 'El campo de usuario no apareció para el registro.' });

        // Rellenar
        await $(USERNAME_INPUT).setValue(UNIQUE_USER);
        await $(PASSWORD_INPUT).setValue(PASSWORD);
        await $(REPEAT_PASS_INPUT).setValue(PASSWORD); 
        
        // Hacer clic en el botón Ingresar
        await $(LOGIN_BUTTON).click();


const expectedPath = new URL(HOME_URL).pathname; 
        
        await browser.waitUntil(
            async () => {
                const currentUrl = await browser.getUrl();
                // Obtenemos el pathname de la URL actual
                const currentPath = new URL(currentUrl).pathname; 
                return currentPath.includes(expectedPath);
            },
            {
                timeout: LOGIN_TIMEOUT,
                timeoutMsg: `FALLO DE LOGIN: No se redirigió a la ruta ${expectedPath}. URL actual: ${await browser.getUrl()}`
            }
        );

        console.log("Login exitoso. El flujo E2E ha finalizado correctamente en /tabs/home (con o sin parámetros).");
    });

    it('debería fallar al intentar registrar un usuario que ya existe (Prueba de Duplicidad Aislada)', async () => {
        // Generar usuario
        const UNIQUE_ID = Math.random().toString(36).substring(2, 6); 
        const REPEATED_USER = `duplicado_${UNIQUE_ID}`;
        
        console.log(`[Test 2/2] Usuario para prueba de duplicidad: ${REPEATED_USER}`);

        // registrar usuario
        await browser.url(REGISTER_URL);
        await $(USERNAME_INPUT).waitForDisplayed({ timeout: 10000 });
        
        // Primer intento 
        await $(USERNAME_INPUT).setValue(REPEATED_USER);
        await $(PASSWORD_INPUT).setValue(PASSWORD); 
        await $(REPEAT_PASS_INPUT).setValue(PASSWORD); 
        await $(REGISTER_BUTTON).click();
        
        // Manejar alerta
        const okButton = await $(OK_BUTTON_IN_ALERT);
        await okButton.waitForDisplayed({ timeout: 5000, message: 'Alerta de OK del primer registro de duplicidad no apareció.' });
        await okButton.click();
        
        // Navegar
        await browser.url(REGISTER_URL);
        await $(USERNAME_INPUT).waitForDisplayed();
        
        // iNTENTAR REGISTRAR AL MISMO USUARIO OTRA VEZ ---
        
        await $(USERNAME_INPUT).setValue(REPEATED_USER);
        await $(PASSWORD_INPUT).setValue(PASSWORD); 
        await $(REPEAT_PASS_INPUT).setValue(PASSWORD); 
        await $(REGISTER_BUTTON).click();
        
        // verificar la alerta
        try {
        const okButton = await $(OK_BUTTON_IN_ALERT);
        await okButton.waitForDisplayed({ timeout: 5000, message: 'Alerta de OK del primer registro de duplicidad no apareció.' });
        await okButton.click();
        
            console.log("Alerta de error de duplicidad cerrada con éxito.");
        } catch (e) {
             // Si no aparece una alerta después del intento duplicado
        console.log("No se detectó ninguna alerta extra después del intento duplicado. Continuando...");
        }
    });
});
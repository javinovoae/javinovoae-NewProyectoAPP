import time
import uuid
import os 
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException
from selenium.webdriver.remote.webelement import WebElement 

# --- 1. CONFIGURACIÓN DE CONSTANTES ---
BASE_HOST = 'http://localhost:8100' 
REGISTER_URL = f'{BASE_HOST}/registro'
LOGIN_URL = f'{BASE_HOST}/login'
HOME_URL = f'{BASE_HOST}/tabs/home'
PASSWORD = 'pass' 

# Usaremos 'By.CSS_SELECTOR' y 'By.XPATH'
USERNAME_INPUT = (By.XPATH, "//input[@placeholder='Ingrese su usuario']")
PASSWORD_INPUT = (By.XPATH, "//input[@placeholder='Ingrese su contraseña']")
LOGIN_BUTTON = (By.XPATH, "//ion-button[@class='mi-boton-personalizado']")
INTERCEPTOR_DIV = (By.CLASS_NAME, "contenedor-gen")
REGISTER_BUTTON = (By.XPATH, "//ion-button[normalize-space()='Registrarse']")
LOGIN_BUTTON = (By.XPATH, "//ion-button[normalize-space()='Ingresar']")
OK_BUTTON_IN_ALERT = (By.XPATH, '//button[normalize-space()="OK"]')
REPEAT_PASS_INPUT = (By.CSS_SELECTOR, "input[placeholder='Repita su contraseña']")
# Configuración de tiempo
TIMEOUT = 10  
SHORT_TIMEOUT = 5 

# --- 2. CONFIGURACIÓN DEL DRIVER 
DRIVER_PATH = "C:/Users/javie/chromedriver.exe"

# Inicialización del driver
try:
    # 1. Creamos el objeto Service con la ruta absoluta
    service = Service(DRIVER_PATH)
    
    # 2. Iniciamos el navegador.
    driver = webdriver.Chrome(service=service)
except Exception as e:
    # El mensaje de error es más específico sobre el diagnóstico:
    print("\n--- ¡ERROR CRÍTICO AL INICIAR EL DRIVER! ---")
    if not os.path.exists(DRIVER_PATH):
        print(f"Diagnóstico: El archivo NO EXISTE en la ruta absoluta especificada: {DRIVER_PATH}")
    else:
        print("Diagnóstico: El archivo EXISTE, pero falla por INCOMPATIBILIDAD de versión o PERMISOS.")
        print("Asegúrate de que la versión del driver 142.0.7444.175 coincida exactamente con tu Chrome y no esté bloqueada por OneDrive/Windows.")
    print(f"Detalle del error: {e}")
    exit(1)

# Función de ayuda para esperar elementos
def wait_for_element(selector, timeout=TIMEOUT):
    """Espera a que un elemento sea visible y lo retorna."""
    try:
        return WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located(selector)
        )
    except TimeoutException:
        raise TimeoutException(f"Elemento no encontrado o no visible dentro de {timeout}s: {selector}")

def wait_for_clickable(selector, timeout=TIMEOUT):
    """Espera a que un elemento sea clickeable (interactuable) y lo retorna.
    Esto soluciona los problemas de 'Element Click Intercepted' y 'Element Not Interactable'."""
    try:
        # Esto espera a que el elemento no esté deshabilitado, sea visible Y no esté interceptado
        return WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable(selector)
        )
    except TimeoutException:
        raise TimeoutException(f"Elemento no se hizo clickeable/interactuable dentro de {timeout}s: {selector}")

# Función para realizar el registro
def register_user(user, password):
    """Navega a la página de registro y registra un nuevo usuario."""
    print(f"Intentando registrar usuario: {user}")
    driver.get(REGISTER_URL)


def wait_for_invisibility(selector, timeout=SHORT_TIMEOUT):
    """Espera a que un elemento sea invisible o desaparezca del DOM."""
    try:
        WebDriverWait(driver, timeout).until(
            EC.invisibility_of_element_located(selector)
        )
        # No se imprime nada en éxito, solo se permite que el flujo continúe
    except TimeoutException:
        print(f"Advertencia: El interceptor {selector} aún está visible después de {timeout}s.")
        # Se permite la continuación para probar el clic con JS
    

def click_by_js(element: WebElement):
    """Ejecuta un clic a través de JavaScript, bypassando interceptores."""
    print(">>> Intentando click mediante JavaScript Executor (BYPASS)")
    driver.execute_script("arguments[0].click();", element)
    

# Función para realizar el registro
def register_user(user, password):
    """Navega a la página de registro y registra un nuevo usuario."""
    print(f"Intentando registrar usuario: {user}")
    driver.get(REGISTER_URL)

    # Rellenar formulario
    wait_for_element(USERNAME_INPUT).send_keys(user)
    wait_for_element(PASSWORD_INPUT).send_keys(password)
    wait_for_element(REPEAT_PASS_INPUT).send_keys(password) 

    # Clic en Registrarse
    wait_for_element(REGISTER_BUTTON).click()

    # Manejar alerta de confirmación (el botón 'OK')
    try:
        ok_button = wait_for_element(OK_BUTTON_IN_ALERT, SHORT_TIMEOUT)
        ok_button.click()
        print("Alerta de registro cerrada.")
    except TimeoutException:
        print("ADVERTENCIA: No se detectó la alerta de confirmación 'OK' después del registro. Podría ser un error esperado (duplicidad) o un problema de la aplicación.")
        return False 
    
    # Esperar la redirección a /login
    WebDriverWait(driver, TIMEOUT).until(
        EC.url_to_be(LOGIN_URL)
    )
    print("Redirigido a /login. El flujo puede continuar.")
    return True # Indica registro exitoso



# --- NUEVA FUNCIÓN SOLUCIONANDO EL ERROR CRÍTICO DEL LOGIN ---
def login_user(user, password, home_url):

    print(f"\nIntentando iniciar sesión con: {user}")

    # 1. Espera de presencia tras la redirección para el primer input
    try:
        WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located(USERNAME_INPUT)
        )
    except TimeoutException:
        print("ERROR: No se encontró la página de login a tiempo.")
        return False

    # 2. Rellenar Usuario y Contraseña
    wait_for_clickable(USERNAME_INPUT).send_keys(user)
    wait_for_clickable(PASSWORD_INPUT).send_keys(password)
    
    # --- ESTRATEGIA DE CLIC ROBUSTO ---
    print("Estrategia de clic robusta: Esperando habilitación del botón Y desaparición del interceptor.")
    # 3. ESPERA 1: Esperar a que el botón esté habilitado y clickeable
    print("Esperando a que el botón de Login esté habilitado...")
    login_btn = wait_for_clickable(LOGIN_BUTTON)

# 4. ESPERA 2: Esperar la invisibilidad del DIV interceptor
# Esto soluciona la ElementClickInterceptedException.
    print(f"Esperando la invisibilidad del interceptor {INTERCEPTOR_DIV}...")
    wait_for_invisibility(INTERCEPTOR_DIV, timeout=SHORT_TIMEOUT)
# 5. Intentar el clic normal (primera opción) con fallback a JavaScript
    try:
        print("Intentando clic normal...")
        login_btn.click()
    except ElementClickInterceptedException:
# Si el clic es interceptado justo en el último milisegundo, forzamos con JS
        print("Clic interceptado de nuevo. Forzando clic con JavaScript.")
        click_by_js(login_btn)

    # 6. Verificar la redirección
    try:
        WebDriverWait(driver, TIMEOUT).until(
            EC.url_contains(home_url)
        )
        print(f"Login exitoso. Redirigido a {home_url}.")
        return True
    except TimeoutException:
        print("ERROR: Fallo en el Login. No se pudo verificar la redirección a la página principal.")
        return False


# --- 3. PRUEBAS DE AUTOMATIZACIÓN (El equivalente a tus bloques 'it') ---

def test_registro_y_login():
    """Prueba 1: Debería registrar un nuevo usuario y usar esas credenciales para iniciar sesión."""
    print("\n--- INICIANDO PRUEBA 1: REGISTRO Y LOGIN EXITOSO ---")
    
    # Generar un usuario único
    unique_id = uuid.uuid4().hex[:6]
    unique_user = f'e_{unique_id}'
    
    # --- REGISTRO DEL NUEVO USUARIO ---
    register_successful = register_user(unique_user, PASSWORD)
    
    if not register_successful:
        print("FALLO EN REGISTRO INICIAL: La prueba no puede continuar.")
        return

    # --- LOGIN CON EL NUEVO USUARIO ---
    success = login_user(unique_user, PASSWORD, HOME_URL)
    if success:
        print("Prueba E2E finalizada correctamente.")
    else:
        print("La prueba falló durante el proceso de Login.")


def test_fallo_registro_duplicado():
    """Prueba 2: Debería fallar al intentar registrar un usuario que ya existe."""
    print("\n--- INICIANDO PRUEBA 2: PRUEBA DE DUPLICIDAD AISLADA ---")
    
    # Generar usuario
    unique_id = uuid.uuid4().hex[:4]
    repeated_user = f'dup_{unique_id}'
    
    print(f"Usuario para prueba de duplicidad: {repeated_user}")

    # --- Primer registro (debería ser exitoso) ---
    print("Paso 1: Primer registro (exitoso).")
    # Usa la función register_user para registrarlo
    register_user(repeated_user, PASSWORD)
    
    # --- Segundo registro (debería fallar) ---
    print("Paso 2: Intentando registrar el mismo usuario de nuevo.")
    driver.get(REGISTER_URL)
    
    # Rellenar formulario (usando la función robusta)
    wait_for_element(USERNAME_INPUT).send_keys(repeated_user)
    wait_for_element(PASSWORD_INPUT).send_keys(PASSWORD) 
    wait_for_element(REPEAT_PASS_INPUT).send_keys(PASSWORD) 
    
    # Clic en Registrarse (intento duplicado)
    print("Clic en el botón 'Registrarse' (intento duplicado)...")
    
    # Damos una pequeña pausa por si el framework necesita validar los campos
    time.sleep(2.0)
    
    wait_for_clickable(REGISTER_BUTTON).click()
    
    # Verificar la alerta de error
    try:
        error_alert = wait_for_element(OK_BUTTON_IN_ALERT, SHORT_TIMEOUT)
        print("¡ÉXITO! Se detectó la alerta de error de duplicidad.")
        error_alert.click()
    except TimeoutException:
        print("¡FALLO! La aplicación no mostró una alerta de error para un registro duplicado.")

# --- 4. EJECUCIÓN DEL PROGRAMA ---
if __name__ == '__main__':
    try:
        test_registro_y_login()
        test_fallo_registro_duplicado()
        
    except TimeoutException as e:
        print(f"\n¡ERROR CRÍTICO EN LA PRUEBA! (Timeout): {e}")
    except NoSuchElementException as e:
        print(f"\n¡ERROR CRÍTICO EN LA PRUEBA! (Elemento no encontrado): {e}")
    except Exception as e:
        print(f"\n¡ERROR CRÍTICO! {e}")
    finally:
        # Asegúrate de cerrar el navegador al terminar
        if 'driver' in locals() and driver:
            print("\nCerrando el navegador...")
            driver.quit()
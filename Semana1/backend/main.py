
from fastapi import FastAPI, Depends, HTTPException, status,Query
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError 
from backend.utils import get_password_hash, verify_password 
from backend import crud, models, schemas
from backend.database import engine, Base, get_db 

app = FastAPI(
    title="API Usuarios (SQLite + FastAPI)",
    description="Una API REST simple para gestión de usuarios con FastAPI y SQLite.",
    version="1.0.0",
    docs_url="/docs",       
    redoc_url="/redoc",     
)

Base.metadata.create_all(bind=engine)

# --- Configuración de CORS ---
origins = [
    "http://localhost",
    "http://localhost:8000",  
    "http://127.0.0.1:8000",  
    "capacitor://localhost",   
    "ionic://localhost",      
    "http://localhost:4200",  
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.database import SessionLocal 

# Definición de Endpoints API 

@app.get("/")
async def read_root():
    return {"message": "¡Hola desde FastAPI! La API de Usuarios está funcionando."}

# Endpoint de Creación de Usuario 
@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    
    # Hash de la contraseña 
    hashed_password = get_password_hash(user.password)
    user.password = hashed_password 
    
    try:
        created_user = crud.create_user(db=db, user=user)
        return created_user
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Error al crear el usuario. Podría ser un nombre de usuario duplicado.")


# --- Endpoint de Login ---
@app.post("/login/", response_model=schemas.LoginResponse)
async def login_for_access_token(form_data: schemas.UserLogin, db: Session = Depends(get_db)): 
    user = crud.get_user_by_username(db, username=form_data.username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # verificación de la contraseña
    if not verify_password(form_data.password, user.hashed_password): 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # verificación exitosa
    return {
        "message": "Login exitoso",
        "user_id": user.id,
        "username": user.username,

    }

# Endpoint para crear tickets
@app.post("/tickets/", response_model=schemas.Ticket, status_code=status.HTTP_201_CREATED)
async def create_ticket_api(
    ticket_data: schemas.TicketCreate,
    db: Session = Depends(get_db)
):
    try:
        if not ticket_data.ticket_items:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, # Usar 422 es más descriptivo
                detail="No se pueden registrar ventas sin productos. El campo 'ticket_items' no puede estar vacío."
            )
        # Si la validación pasa, procede con la lógica existente
        db_ticket = crud.create_ticket(db=db, ticket_data=ticket_data)
        return db_ticket
    except HTTPException as e: 
        raise e
    except ValueError as e:
        # Esto captura errores específicos del CRUD
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno del servidor: {e}")


# --- NUEVO ENDPOINT: Para obtener tickets (Historial de Ventas) ---
@app.get("/tickets/", response_model=list[schemas.Ticket]) # O list[schemas.TicketResponse] si tienes ese esquema
async def get_tickets_api(
    event_id: int = Query(..., description="ID del evento para filtrar tickets"),
    buyer_id: int = Query(..., description="ID del comprador/usuario para filtrar tickets"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de tickets filtrados por ID de evento y ID de comprador.
    """
    tickets = crud.get_tickets_by_event_and_buyer(db, event_id=event_id, buyer_id=buyer_id)
    if not tickets:
        # Puedes optar por devolver una lista vacía o 404 si no se encuentran tickets.
        # Para un historial, es común devolver una lista vacía.
        # raise HTTPException(status_code=404, detail="No se encontraron tickets para los criterios especificados.")
        return [] # Devolver una lista vacía es más amigable para un historial
    return tickets


# buscar evento
@app.post("/events/", response_model=schemas.Event, status_code=status.HTTP_201_CREATED)
async def create_new_event(event_data: schemas.EventCreate, db: Session = Depends(get_db)):
    existing_event = crud.get_event_by_name(db, name=event_data.name)
    if existing_event:
        raise HTTPException(status_code=400, detail="Ya existe un evento con este nombre.")

    db_event = crud.create_event(db=db, event=event_data)
    return db_event

#devuelve 
@app.get("/events/search/", response_model=list[schemas.Event]) 
async def search_event_api(
    name: str,
    event_date: str, 
    manager_id: int,
    db: Session = Depends(get_db)
):

    events = crud.get_events_by_criteria(db, name=name, event_date=event_date, manager_id=manager_id)

    if not isinstance(events, list):
        return [events]
    return events


# Buscar usuario por id
@app.get("/users/{user_id}", response_model=schemas.UserProfile) 
async def read_user(user_id: int, db: Session = Depends(get_db)):
    print(f"DEBUG: Intentando buscar usuario con ID: {user_id}") 
    db_user = crud.get_user(db, user_id=user_id) 
    if db_user is None:
        print(f"DEBUG: Usuario con ID {user_id} NO ENCONTRADO en la DB.") 
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    print(f"DEBUG: Usuario con ID {user_id} ENCONTRADO.") 
    return db_user

# actualizar perfil
@app.put("/users/{user_id}", response_model=schemas.UserProfile) 
async def update_user_profile(
    user_id: int,
    user_data: schemas.UserProfileUpdate, 
    db: Session = Depends(get_db)
):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    updated_user = crud.update_user(db, db_user=db_user, user_data=user_data)
    return updated_user

#productos crear nuevo
@app.post("/products/", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
async def create_product_api(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db)
):
    db_product_by_name_for_user = crud.get_product_by_name(db, name=product.name) 

    if db_product_by_name_for_user and db_product_by_name_for_user.user_id == product.user_id:
        raise HTTPException(status_code=400, detail="Ya existe un producto con este nombre para este usuario.")
    elif db_product_by_name_for_user:
        pass 

    try:
        return crud.create_product(db=db, product=product, user_id=product.user_id) 
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

#recuperar lista productos
@app.get("/products/", response_model=list[schemas.Product])
async def read_products_api(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = crud.get_products(db, skip=skip, limit=limit)
    return products

#info por el id 
@app.get("/products/{product_id}", response_model=schemas.Product)
async def read_product_api(product_id: int, db: Session = Depends(get_db)):

    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db_product

#eliminar producto por id
@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_api(product_id: int, db: Session = Depends(get_db)):

    db_product = crud.delete_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return 

#recuperar producto por id
@app.get("/users/{user_id}/products/", response_model=list[schemas.Product])
async def read_products_for_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los productos asociados a un usuario específico.
    """
    products = crud.get_products_by_user(db, user_id=user_id)
    return products

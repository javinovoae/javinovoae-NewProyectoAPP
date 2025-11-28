export interface CantidadTicketCreate {
  product_id: number;
  cantidad_prod_ticket: number;
}

export interface TicketCreate {
  buyer_id: number; 
  event_id: number; 
  ticket_items: CantidadTicketCreate[]; 
}

export interface TicketResponse {
  id: number;
  buyer_id: number;
  event_id: number;
  sale_date: string; 
  price_ticket: number; 
  ticket_items: CantidadTicketResponse[]; 
}

export interface CantidadTicketResponse {
  id: number;
  ticket_id: number;
  product_id: number;
  cantidad_prod_ticket: number;

  // ¡Aquí es donde añadimos el objeto Product anidado!
  product_obj_ticket: { // Esto debe coincidir con tu esquema Product de FastAPI
    id: number;
    name: string;
    price: number; // o string si el precio es una cadena
    is_available: boolean;
    // ... otras propiedades de Product si las necesitas
  };
}

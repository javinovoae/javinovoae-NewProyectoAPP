export interface Product {
  id: number; 
  name: string; 
  price: number; 
  is_available?: boolean; 
}

export interface ProductCreate {
  name: string;
  price: number;
  user_id: number; 
  is_available?: boolean; 
}


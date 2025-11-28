

export interface UserCreate {
  username: string;
  password: string;
  name?: string | null;
  lastname?: string | null;
  education?: string | null;
  birthdate?: string| null; 
  is_active?: boolean;
}


export interface UserLogin {
  username: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  user_id: number;
  username: string;
  name?: string;
  lastname?: string;

}

export interface UserProfileUpdate {
  name?: string | null;
  lastname?: string | null;
  education?: string | null;
  birthdate?: string | null; 
  is_active?: boolean;
  latitude?: number | null; 
  longitude?: number | null; 
}

export interface UserProfile {
  id: number;
  username: string;
  is_active: boolean;
  name?: string | null;
  lastname?: string | null;
  education?: string | null;
  birthdate?: string | null; 
  latitude?: number | null;  
  longitude?: number | null; 
}

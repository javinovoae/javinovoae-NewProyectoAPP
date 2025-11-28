// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router'; 

    @Injectable({
    providedIn: 'root' 
    })
    export class AuthService {

    constructor(private router: Router) { } 

    login(username: string, userId: number): void { 
        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId.toString()); 
    }
        

    logout(): void {
        // Eliminar info
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('fullUserProfile'); 

        // redireccion al login 
        this.router.navigateByUrl('/login', { replaceUrl: true });
    }

    /**

  
     * @returns 
     */
    isAuthenticated(): boolean {
        const username = localStorage.getItem('username');
        const userId = localStorage.getItem('userId');
        
        return !!username && !!userId;
    }

    /**
     
     * @returns 
     */
    getUserId(): number | null {
        const userIdString = localStorage.getItem('userId');
        return userIdString ? parseInt(userIdString, 10) : null;
    }

    /**
     * @returns 
     */
    getUsername(): string | null {
        return localStorage.getItem('username');
    }

    
    }
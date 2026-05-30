import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { AUTH_USERS, CURRENT_USER_STORAGE_KEY } from '../constants/auth.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(email: string, password: string): boolean {
    const user = AUTH_USERS.find(
      (candidate) => candidate.email === email && candidate.password === password,
    );

    if (!user) {
      return false;
    }

    const sessionUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    sessionStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(sessionUser));
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }

  getCurrentUser(): User | null {
    const stored = sessionStorage.getItem(CURRENT_USER_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as User;
    } catch {
      sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

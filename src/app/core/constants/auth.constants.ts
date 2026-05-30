import { AuthUser } from '../models/user.model';

export const CURRENT_USER_STORAGE_KEY = 'music-app-current-user';

/** Cambia aquí las credenciales de prueba cuando lo necesites. */
export const AUTH_USERS: AuthUser[] = [
  {
    id: '1',
    email: 'usuario@musicapp.com',
    password: '123456',
    name: 'Usuario Demo',
  },
];

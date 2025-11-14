import { Injectable } from '@angular/core';
import { User } from '../../../types/models/user';

const USERS_KEY = 'users';
const PASSWORD_SECRET = 'MyAppSecret@2025';

@Injectable({ providedIn: 'root' })
export class UserStorageService {
  //#region Get Users
  /**
   * @summary Retrieves all stored users from localStorage.
   * @returns User[] - List of all registered users
   */
  getAllUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  /**
   * @summary Saves the complete list of users to localStorage.
   * @param users - Array of users to save
   * @returns void
   */
  saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  /**
   * @summary Returns all users (wrapper for getAllUsers).
   * @returns User[]
   */
  getUsers(): User[] {
    return this.getAllUsers();
  }
  //#endregion

  //#region Password Encoding / Decoding
  /**
   * @summary Encodes raw password with a secret key.
   * @param rawPassword - Plain text password
   * @returns string - Encoded password
   */
  encodePassword(rawPassword: string): string {
    return btoa(`${PASSWORD_SECRET}:${rawPassword}`);
  }

  /**
   * @summary Decodes the encoded password.
   * @param obfuscatedPassword - Encoded password string
   * @returns string - Decoded plain password
   */
  decodePassword(obfuscatedPassword: string): string {
    try {
      const decoded = atob(obfuscatedPassword);
      return decoded.split(':')[1];
    } catch {
      return '';
    }
  }
  //#endregion
}

import { Injectable } from '@angular/core';
import { User } from '../../../types/models/user';

const USERS_KEY = 'users';
const PASSWORD_SECRET = 'MyAppSecret@2025';

@Injectable({ providedIn: 'root' })
export class UserStorageService {
  //#region Get Users
  /**
   * @summary Retrieves all registered users from local storage.
   * @returns User[] List of all stored users.
   */
  public getAllUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }
  //#endregion

  //#region Save Users
  /**
   * @summary Saves the list of users to local storage.
   * @param users - Array of User objects to be stored.
   * @returns void
   */
  public saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  //#endregion

  //#region Email Check
  /**
   * @summary Checks if an email already exists in local storage.
   * @param email - Email string to search for.
   * @returns boolean True if email exists, false otherwise.
   */
  public isEmailExists(email: string): boolean {
    const check = email.trim().toLowerCase();
    return this.getAllUsers().some(
      user => (user.email || '').trim().toLowerCase() === check
    );
  }
  //#endregion

  //#region Encode Password

  /**
   * @summary Encodes raw password into base64 format along with a secret key.
   * @param rawPassword - Plain password to encode.
   * @returns string Encoded password string.
   */
  public encodePassword(rawPassword: string): string {
    return btoa(`${PASSWORD_SECRET}:${rawPassword}`);
  }
  //#endregion

  //#region Decode Password
  /**
   * @summary Decodes an encoded password back into plain text.
   * @param obfuscatedPassword - Base64 encoded password string.
   * @returns string Decoded raw password. Returns empty string if decoding fails.
   */
  public decodePassword(obfuscatedPassword: string): string {
    try {
      const decoded = atob(obfuscatedPassword);
      return decoded.split(':')[1];
    } catch {
      return '';
    }
  }
  //#endregion

  //#region Update Password
  /**
   * @summary Updates a user's password based on their email address.
   * @param email - User email 
   * @param newRawPassword - New password in raw text form.
   * @returns boolean True if update succeeded, false if user not found.
   */
  public updatePasswordForEmail(email: string, newRawPassword: string): boolean {
    const normalized = email.trim().toLowerCase();
    const users = this.getAllUsers();
    const idx = users.findIndex(
      u => (u.email || '').trim().toLowerCase() === normalized
    );
    if (idx === -1) return false;
    users[idx].password = this.encodePassword(newRawPassword);
    this.saveAllUsers(users);
    return true;
  }
  //#endregion
}

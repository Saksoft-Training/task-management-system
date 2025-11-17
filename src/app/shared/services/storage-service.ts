import { Injectable } from '@angular/core';
import { User } from '../../../types/models/user';

const USERS_KEY = 'users';
const PASSWORD_SECRET = 'MyAppSecret@2025';

@Injectable({ providedIn: 'root' })
export class UserStorageService {
  //#region Get Users
  /**
   * @summary Retrieves all registered users from local storage.
   * @returns User[] Array of all stored users.
   */
  public getAllUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }
  //#endregion 

  //#region Save Users
  /**
   * @summary Saves the provided list of users to local storage.
   * @param users Array of User objects to store.
   * @returns void
   */
  public saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  //#endregion 

  //#region Email Check
  /**
   * @summary Checks whether an email already exists in storage.
   * @param email Email string to be checked.
   * @returns boolean True if email exists.
   */
  public isEmailExists(email: string): boolean {
    const check = email.trim().toLowerCase();
    return this.getAllUsers().some(
      user => user.email.trim().toLowerCase() === check
    );
  }
  //#endregion 

  //#region Encode Password
  /**
   * @summary Encodes (obfuscates) user password using base64.
   * @param rawPassword Plain text password to encode.
   * @returns string Encoded password string.
   */
  public encodePassword(rawPassword: string): string {
    return btoa(`${PASSWORD_SECRET}:${rawPassword}`);
  }
  //#endregion 

  //#region Decode Password
  /**
   * @summary Decodes the encoded password back to plain text.
   * @param obfuscatedPassword Encoded password string.
   * @returns string Decoded raw password.
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
}

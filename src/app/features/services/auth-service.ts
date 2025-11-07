import { Injectable } from '@angular/core';
import { User } from '../../contracts/user.interface';

const USERS_KEY = 'users';
const PASSWORD_SECRET = 'MyAppSecret@2025'; 

@Injectable({ providedIn: 'root' })
export class AuthService {
  //#region Private Methods
  /**
   * @summary Reads all users from localStorage.
   * @returns Array of registered users.
   */
  private getAllUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }
  /**
   * @summary Saves the array of users to localStorage.
   * @param users - Array of users to save.
   * @returns void
   */
  private saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  //#endregion
  //#region Public Methods
  /**
   * @summary Returns all registered users.
   * @returns Array of registered users.
   */
  public getUsers(): User[] {
    return this.getAllUsers();
  }
  /**
   * @summary Checks if an email is already registered.
   * @param email - Email address to check.
   * @returns True if email exists, otherwise false.
   */
  public isEmailRegistered(email: string): boolean {
    if (!email) return false;
    return this.getAllUsers().some(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  /**
   * @summary Registers a new user and stores it in localStorage.
   * @param user - User object to register.
   * @returns void
   */
  public registerUser(user: User): void {
    const users = this.getAllUsers();
    users.push(user);
    this.saveAllUsers(users);
  }
  /**
   * @summary Obfuscates a password using simple base64 encoding.
   * @param rawPassword - Raw password string.
   * @returns Encoded password string.
   */
  public encodePassword(rawPassword: string): string {
    return btoa(`${PASSWORD_SECRET}:${rawPassword}`);
  }
  /**
   * @summary Decodes an obfuscated password.
   * @param obfuscatedPassword - Encoded password string.
   * @returns Decoded raw password.
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

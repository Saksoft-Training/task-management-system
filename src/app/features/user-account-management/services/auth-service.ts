import { Injectable } from '@angular/core';
import { User } from '../../../../types/models/user';

const USERS_KEY = 'users';
const PASSWORD_SECRET = 'MyAppSecret@2025';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor() { }
  //#region Private Methods
  /**
   * @summary Retrieves all users stored in localStorage.
   * @returns User[] - List of stored users
   */
  private getAllUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }
  /**
   * @summary Saves the updated list of users to localStorage.
   * @param users - Array of users to store
   * @returns void
   */
  private saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  //#endregion
  //#region Registration Methods 
  /**
   * @summary Returns all users stored in localStorage.
   * @returns User[]
   */
  public getUsers(): User[] {
    return this.getAllUsers();
  }
  /**
   * @summary Checks whether the provided email already exists.
   * @param email - Email to check
   * @returns boolean - True if email exists, false otherwise
   */
  public isEmailRegistered(email: string): boolean {
    if (!email) return false;
    return this.getAllUsers().some(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  /**
   * @summary Registers a new user and saves to localStorage.
   * @param user - User object to register
   * @returns void
   */
  public registerUser(user: User): void {
    const users = this.getAllUsers();
    users.push(user);
    this.saveAllUsers(users);
  }
  /**
   * @summary Encodes a password using a simple obfuscation technique.
   * @param rawPassword - Plain password entered by user
   * @returns string - Encoded password
   */
  public encodePassword(rawPassword: string): string {
    return btoa(`${PASSWORD_SECRET}:${rawPassword}`);
  }
  /**
   * @summary Decodes an obfuscated password.
   * @param obfuscatedPassword - Encoded password string
   * @returns string - Decoded plain text password
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

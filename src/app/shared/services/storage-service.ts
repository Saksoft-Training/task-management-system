import { Injectable } from '@angular/core';
import { User } from '../../../types/models/user';

const USERS_KEY = 'users';
const PASSWORD_SECRET = 'MyAppSecret@2025';
@Injectable({ providedIn: 'root' })
export class UserStorageService {
  //#region User Retrieval
  /**
   * @summary Retrieves all stored users from localStorage.
   * @returns User[] Array of stored user objects.
   */
  public getAllUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }
  /**
   * @summary Saves the updated array of users back to localStorage.
   * @param users Array of users to be saved.
   * @returns void
   */
  public saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  //#endregion

  //#region Email Helpers
  /**
   * @summary Checks if a given email already exists in stored users.
   * @param email Email address to check.
   * @returns boolean True if email exists.
   */
  public isEmailExists(email: string): boolean {
    const check = email.trim().toLowerCase();
    return this.getAllUsers().some(
      user => user.email.trim().toLowerCase() === check
    );
  }
  //#endregion

  //#region Password Encoding
  /**
   * @summary Encrypts raw password using base64 + secret prefix.
   * @param raw Raw password string.
   * @returns string Encoded password.
   */
  public encodePassword(raw: string): string {
    return btoa(`${PASSWORD_SECRET}:${raw}`);
  }
  /**
   * @summary Decodes an encoded password back to plain text.
   * @param encoded Encoded password string.
   * @returns string Decoded raw password.
   */
  public decodePassword(encoded: string): string {
    try {
      const decoded = atob(encoded);
      return decoded.split(':')[1];
    } catch {
      return '';
    }
  }
  //#endregion

  //#region Password Update
  /**
   * @summary Updates password for a specific user by email.
   * @param email User's email to update password for.
   * @param newPass New raw password.
   * @returns boolean True if update succeeded.
   */
  public updatePasswordForEmail(email: string, newPass: string): boolean {
    const normalized = email.trim().toLowerCase();
    const users = this.getAllUsers();
    const idx = users.findIndex(
      u => (u.email || '').trim().toLowerCase() === normalized
    );
    if (idx === -1) return false;
    users[idx].password = this.encodePassword(newPass);
    this.saveAllUsers(users);
    return true;
  }
  //#endregion

  //#region User Update
  /**
   * @summary Updates stored user data. Required when profile email changes.
   * @param updatedUser Updated user object.
   * @param oldEmail Optional old email reference before updating.
   * @returns boolean True if update succeeded.
   */
  public updateUser(updatedUser: User, oldEmail?: string): boolean {
    const users = this.getAllUsers();
    const matchEmail = (oldEmail || updatedUser.email)
      .trim()
      .toLowerCase();
    const index = users.findIndex(
      u => (u.email || '').trim().toLowerCase() === matchEmail
    );
    if (index === -1) return false;
    users[index] = { ...users[index], ...updatedUser };
    this.saveAllUsers(users);
    return true;
  }
  //#endregion
}

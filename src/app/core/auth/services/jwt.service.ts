import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class JwtService {
  private readonly tokenKey = "jwtToken";

  getToken(): string | null {
    try {
      return window.localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  }

  saveToken(token: string): void {
    try {
      window.localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error("Error saving token to localStorage:", error);
    }
  }

  destroyToken(): void {
    try {
      window.localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error("Error removing token from localStorage:", error);
    }
  }

  // Helper method to check if token exists
  hasToken(): boolean {
    return !!this.getToken();
  }

  // Helper method to decode JWT payload (without verification)
  decodeToken(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  // Helper method to check if token is expired
  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }
}
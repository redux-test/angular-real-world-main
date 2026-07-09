import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class JwtService {
  getToken(): string {
    return window.localStorage.getItem("jwtToken");
  }

  saveToken(token: string): void {
    window.localStorage.setItem("jwtToken", token);
  }

  destroyToken(): void {
    window.localStorage.removeItem("jwtToken");
  }
}

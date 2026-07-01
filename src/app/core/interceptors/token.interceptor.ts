import { inject } from "@angular/core";
import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { JwtService } from "../auth/services/jwt.service";
import { UserService } from "../auth/services/user.service";
import { catchError, throwError } from "rxjs";

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const userService = inject(UserService);
  const token = jwtService.getToken();

  // Clone the request and add authorization header if token exists
  const request = req.clone({
    setHeaders: {
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  });

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle authentication errors
      if (error.status === 401 || error.status === 403) {
        // Token is invalid or expired, clear authentication state
        userService.purgeAuth();
      }
      return throwError(() => error);
    })
  );
};
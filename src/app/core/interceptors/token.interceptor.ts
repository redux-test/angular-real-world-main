import { inject } from "@angular/core";
import { HttpInterceptorFn } from "@angular/common/http";
import { JwtService } from "../auth/services/jwt.service";

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const token = jwtService.getToken();

  // Only add authorization header if token exists
  const request = token 
    ? req.clone({
        setHeaders: {
          Authorization: `Token ${token}`,
        },
      })
    : req;
    
  return next(request);
};
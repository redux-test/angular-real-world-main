import { inject } from "@angular/core";
import { HttpInterceptorFn } from "@angular/common/http";
import { JwtService } from "../auth/services/jwt.service";

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  // Always get the latest token from the service to ensure updated tokens are used
  const token = jwtService.getToken();

  const request = req.clone({
    setHeaders: {
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  });
  return next(request);
};
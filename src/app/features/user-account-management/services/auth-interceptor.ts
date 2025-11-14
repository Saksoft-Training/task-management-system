import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  //#region Constructor
  /**
   * @summary Injects authentication service to access stored token.
   * @param auth - AuthService used to retrieve JWT token.
   */
  constructor(private authService: AuthService) {}
  //#endregion
  //#region Interceptor
  /**
   * @summary Intercepts outgoing HTTP requests and attaches Authorization header if token exists.
   * @param req - Outgoing HTTP request.
   * @param next - Next interceptor or final HTTP handler.
   * @returns Observable<HttpEvent<any>>
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAuthToken();
    if (token) {
      const clonedRequest = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next.handle(clonedRequest);
    }
    return next.handle(req);
  }
  //#endregion
}

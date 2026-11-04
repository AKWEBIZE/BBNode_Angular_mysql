import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    let requestToForward = req;

    if (token) {
      requestToForward = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(requestToForward).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && error.error) {
          const isTokenExpired = error.error.error === 'Token expired' || 
                                 (error.error.message && error.error.message.includes('Token expired'));
          if (isTokenExpired) {
            this.authService.notifyTokenExpired();
          }
        }
        return throwError(() => error);
      })
    );
  }
}

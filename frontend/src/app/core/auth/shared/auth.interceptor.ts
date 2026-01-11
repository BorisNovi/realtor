import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState, Logout, RefreshToken } from '../state';
import { catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { environment } from '@environments/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const store = inject(Store);
  const isRefreshing = signal(false);

  const accessToken$ = store.select(AuthState.accessToken);
  const refreshToken$ = store.select(AuthState.refreshToken);

  const addTokenToRequest = (req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> => {
    return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  };

  /*
   * Handles 401 Unauthorized responses by attempting to refresh the access token
   */
  const handleUnauthorized = (req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
    if (!isRefreshing()) {
      isRefreshing.set(true);

      return store.dispatch(new RefreshToken()).pipe(
        switchMap(() => accessToken$.pipe(take(1))),
        switchMap(newToken => {
          isRefreshing.set(false);
          return next(addTokenToRequest(req, newToken));
        }),
        catchError(err => {
          isRefreshing.set(false);
          store.dispatch(new Logout());
          return throwError(() => err);
        }),
      );
    } else {
      return accessToken$.pipe(
        filter(token => !!token),
        take(1),
        switchMap(token => next(addTokenToRequest(req, token))),
      );
    }
  };

  /*
   * Interceptor logic for API requests
   */
  if (request.url.startsWith(environment.apiUrl)) {
    if (request.url.endsWith('auth/refresh')) {
      return refreshToken$.pipe(
        take(1),
        switchMap(token => next(addTokenToRequest(request, token))),
        catchError(() => {
          store.dispatch(new Logout());
          return throwError(() => new Error('Session refresh failed'));
        }),
      );
    }

    if (!request.url.endsWith('auth/refresh')) {
      /*
       * Handles protected requests that require an access token
       */
      return accessToken$.pipe(
        take(1),
        switchMap(token => next(addTokenToRequest(request, token))),
        catchError(err => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            return handleUnauthorized(request);
          }
          return throwError(() => err);
        }),
      );
    }
  }

  /*
   * Handles public requests that do not require a token
   */
  return next(request);
};

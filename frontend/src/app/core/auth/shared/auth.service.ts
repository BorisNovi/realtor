import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ISessionUser, IUser } from '@shared/interfaces';
import { Observable, switchMap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  public login(email: string, password: string): Observable<ISessionUser> {
    return of({
      user: {
        id: 0,
        name: 'mock',
        email: 'mock@mail.com',
        role: 'mock role',
      },
      token: 'mock token',
      refreshToken: 'mock refreshToken',
    });
    // const utcOffset = getUtcOffset();

    // return this.fingerprint$.pipe(
    //   switchMap(({ fingerprint, fingerprintComponents }) =>
    //     this.http.post<ISessionUser>(`${process.env.API_URL}/user/sessions`, {
    //       email,
    //       password,
    //       fingerprint,
    //       fingerprintComponents,
    //       utcOffset
    //     })
    //   ),
    //   catchError(error => throwError((error.error && error.error.errors) || error))
    // );
  }

  public signup(
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Observable<void> {
    return of();
    //   const utcOffset = getUtcOffset();

    //   return this.fingerprint$.pipe(
    //     switchMap(({ fingerprint, fingerprintComponents }) =>
    //       this.http.post<void>(`${process.env.API_URL}/partner/sign_up`, {
    //         email,
    //         password,
    //         passwordConfirmation,
    //         fingerprint,
    //         fingerprintComponents,
    //         utcOffset,
    //       }),
    //     ),
    //     catchError((error) =>
    //       error((error.error && error.error.errors) || error),
    //     ),
    //   );
  }

  public recoverPassword(email: string): Observable<void> {
    return of();
    // return this.http
    //   .post<IUser>(`${process.env.API_URL}/user/recovery`, { email })
    //   .pipe(catchError(error => throwError((error.error && error.error.errors) || error)));
  }

  public activate(token: string, password: string): Observable<void> {
    return of();
    // return this.http
    //   .post<IUser>(`${process.env.API_URL}/user/activation`, { token, password })
    //   .pipe(catchError(error => throwError((error.error && error.error.errors) || error)));
  }

  public refreshToken(id: number): Observable<ISessionUser> {
    return of({
      user: {
        id: 0,
        name: 'mock',
        email: 'mock@mail.com',
        role: 'mock role',
      },
      token: 'mock token',
      refreshToken: 'mock refreshToken',
    });
    // return this.fingerprint$.pipe(
    //   switchMap(({ fingerprint, fingerprintComponents }) =>
    //     this.http.put<ISessionUser>(`${process.env.API_URL}/user/sessions`, { id, fingerprint, fingerprintComponents })
    //   ),
    //   catchError(error => throwError((error.error && error.error.errors) || error))
    // );
  }
}

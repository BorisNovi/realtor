import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ISessionUser, IUser } from '@shared/interfaces';
import { Observable, switchMap, catchError, of, delay, map, shareReplay } from 'rxjs';
import { environment } from '@environments/environment';
import { FingerprintService } from '../../services';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private fingerprintService = inject(FingerprintService);

  private fingerprint$ = this.fingerprintService.getFingerprint().pipe(shareReplay(1));

  public login(email: string, password: string): Observable<ISessionUser> {
    return this.fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { email, password, fingerprint };
        return this.http.post<ISessionUser>(`${environment.apiUrl}/auth/signin/`, body);
      }),
    );
  }

  public signUp(email: string, password: string, passwordConfirmation: string): Observable<void> {
    return this.fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { email, username: email, password, password2: passwordConfirmation, fingerprint };
        return this.http.post<void>(`${environment.apiUrl}/auth/signup/`, body);
      }),
    );
  }

  public activateAfterSignup(token: string): Observable<ISessionUser> {
    console.log('activate after signup method', token);
    return of({
      user: {
        id: 0,
        name: 'mock',
        email: 'mock@mail.com',
        role: 'mock role',
      },
      token: 'mock token',
      refreshToken: 'mock refreshToken',
    }).pipe(delay(2000));
  }

  public recoverPassword(email: string): Observable<void> {
    return of(void 0).pipe(delay(2000));
    // return this.http
    //   .post<IUser>(`${process.env.API_URL}/user/recovery`, { email })
    //   .pipe(catchError(error => throwError((error.error && error.error.errors) || error)));
  }

  public activateAfterRecover(token: string, password: string): Observable<void> {
    console.log('activate', token, password);
    return of(void 0).pipe(delay(2000));
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
    }).pipe(delay(2000));
    // return this.fingerprint$.pipe(
    //   switchMap(({ fingerprint, fingerprintComponents }) =>
    //     this.http.put<ISessionUser>(`${process.env.API_URL}/user/sessions`, { id, fingerprint, fingerprintComponents })
    //   ),
    //   catchError(error => throwError((error.error && error.error.errors) || error))
    // );
  }
}

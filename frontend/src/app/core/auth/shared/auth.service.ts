import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ISessionUser, IUser } from '@shared/interfaces';
import { Observable, switchMap, shareReplay } from 'rxjs';
import { environment } from '@environments/environment';
import { FingerprintService } from '../../services';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private fingerprintService = inject(FingerprintService);

  private fingerprint$ = this.fingerprintService.getFingerprint().pipe(shareReplay(1));

  public checkSession(): Observable<IUser> {
    return this.fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { fingerprint };
        return this.http.post<IUser>(`${environment.apiUrl}/auth/sessions/check`, body);
      }),
    );
  }

  public login(email: string, password: string): Observable<ISessionUser> {
    return this.fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { email, password, fingerprint };
        return this.http.post<ISessionUser>(`${environment.apiUrl}/auth/sign-in`, body);
      }),
    );
  }

  public signUp(email: string, password: string, passwordConfirmation: string): Observable<void> {
    return this.fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { email, password, passwordConfirmation, fingerprint };
        return this.http.post<void>(`${environment.apiUrl}/auth/sign-up`, body);
      }),
    );
  }

  public activateAfterSignup(token: string): Observable<ISessionUser> {
    return this.fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { token, fingerprint };
        return this.http.post<ISessionUser>(`${environment.apiUrl}/auth/sign-up-activate`, body);
      }),
    );
  }

  public recoverPassword(email: string): Observable<void> {
    return this.fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { email, fingerprint };
        return this.http.post<void>(`${environment.apiUrl}/auth/recover`, body);
      }),
    );
  }

  public activateAfterRecover(token: string, password: string): Observable<void> {
    return this.fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { token, password, fingerprint };
        return this.http.post<void>(`${environment.apiUrl}/auth/recover-activate`, body);
      }),
    );
  }

  public refreshToken(id: number): Observable<ISessionUser> {
    return this.fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { id, fingerprint };
        return this.http.post<ISessionUser>(`${environment.apiUrl}/auth/refresh`, body);
      }),
    );
  }
}

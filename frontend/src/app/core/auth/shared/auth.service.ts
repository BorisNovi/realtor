import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ISessionUser, IUser } from '@shared/interfaces';
import { Observable, switchMap, shareReplay, defer } from 'rxjs';
import { environment } from '@environments/environment';
import { FingerprintService } from '../../services';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #http = inject(HttpClient);
  readonly #fingerprintService = inject(FingerprintService);

  readonly #fingerprint$ = defer(() => this.#fingerprintService.getFingerprint()).pipe(shareReplay(1));

  checkSession(): Observable<IUser> {
    return this.#fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { fingerprint };
        return this.#http.post<IUser>(`${environment.apiUrl}/auth/sessions/check`, body);
      }),
    );
  }

  terminateSessions(): Observable<void> {
    return this.#fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { fingerprint };
        return this.#http.post<void>(`${environment.apiUrl}/auth/logout-all`, body);
      }),
    );
  }

  login(email: string, password: string): Observable<ISessionUser> {
    return this.#fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { email, password, fingerprint };
        return this.#http.post<ISessionUser>(`${environment.apiUrl}/auth/sign-in`, body);
      }),
    );
  }

  signUp(email: string, password: string, password_confirmation: string): Observable<void> {
    return this.#fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { email, password, password_confirmation, fingerprint };
        return this.#http.post<void>(`${environment.apiUrl}/auth/sign-up`, body);
      }),
    );
  }

  activateAfterSignup(token: string): Observable<ISessionUser> {
    return this.#fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { token, fingerprint };
        return this.#http.post<ISessionUser>(`${environment.apiUrl}/auth/sign-up-activate`, body);
      }),
    );
  }

  recoverPassword(email: string): Observable<void> {
    return this.#fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { email, fingerprint };
        return this.#http.post<void>(`${environment.apiUrl}/auth/recover`, body);
      }),
    );
  }

  activateAfterRecover(token: string, password: string): Observable<void> {
    return this.#fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { token, password, fingerprint };
        return this.#http.post<void>(`${environment.apiUrl}/auth/recover-activate`, body);
      }),
    );
  }

  refreshToken(id: number): Observable<ISessionUser> {
    return this.#fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { id, fingerprint };
        return this.#http.post<ISessionUser>(`${environment.apiUrl}/auth/refresh`, body);
      }),
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ISessionUser } from '@shared/interfaces';
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

  terminateSessions(): Observable<void> {
    return this.#fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { fingerprint };
        return this.#http.post<void>(`${environment.apiUrl}/auth/logout-all`, body, { withCredentials: true });
      }),
    );
  }

  login(email: string, password: string): Observable<ISessionUser> {
    return this.#fingerprint$.pipe(
      switchMap(fingerprint => {
        const body = { email, password, fingerprint };
        return this.#http.post<ISessionUser>(`${environment.apiUrl}/auth/sign-in`, body, { withCredentials: true });
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
        return this.#http.post<ISessionUser>(`${environment.apiUrl}/auth/sign-up-activate`, body, { withCredentials: true });
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

  signOut(): Observable<void> {
    return this.#http.post<void>(`${environment.apiUrl}/auth/sign-out`, {}, { withCredentials: true });
  }

  refreshToken(): Observable<ISessionUser> {
    return this.#fingerprint$.pipe(
      switchMap(fingerprint => {
        return this.#http.post<ISessionUser>(`${environment.apiUrl}/auth/refresh`, { fingerprint }, { withCredentials: true });
      }),
    );
  }
}

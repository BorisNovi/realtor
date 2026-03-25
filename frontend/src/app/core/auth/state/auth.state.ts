// core/auth/auth.state.ts
import { inject, Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  ActivateAfterRecover,
  ActivateAfterSignup,
  ActivationAfterRecoverSuccess,
  ActivationAfterSignupFailed,
  ActivationAfterSignupSuccess,
  CheckSession,
  Login,
  LoginFailed,
  LoginRedirect,
  LoginSuccess,
  Logout,
  RecoverFailed,
  RecoverPassword,
  RecoverSuccess,
  RefreshToken,
  RemoveUser,
  Signup,
  SignupFailed,
  SignupSuccess,
  Terminate,
  TerminationFailed,
  TerminationSuccess,
} from './auth.actions';
import { ISessionUser, IUser } from '@shared/interfaces';
import { AuthService } from '..';
import { Navigate } from '@ngxs/router-plugin';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

// Интерфейс состояния
interface AuthStateModel {
  user: IUser | null;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  error: HttpErrorResponse | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    loading: false,
    accessToken: null,
    refreshToken: null,
    error: null,
  },
})
@Injectable()
export class AuthState {
  readonly #authService = inject(AuthService);
  readonly messageService = inject(MessageService);
  readonly translateService = inject(TranslateService);

  // Selectors
  @Selector()
  static user(state: AuthStateModel): IUser | null {
    return state.user;
  }

  @Selector()
  static loading(state: AuthStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static accessToken(state: AuthStateModel): string | null {
    return state.accessToken;
  }

  @Selector()
  static refreshToken(state: AuthStateModel): string | null {
    return state.refreshToken;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return !!state.accessToken;
  }

  // Dispatch CheckSession on start
  ngxsOnInit(ctx: StateContext<AuthStateModel>) {
    ctx.dispatch(new CheckSession());
  }

  @Action(CheckSession)
  checkSession(ctx: StateContext<AuthStateModel>) {
    const { accessToken } = ctx.getState();
    if (!accessToken) {
      ctx.dispatch(new LoginRedirect());
      return;
    }

    return this.#authService.checkSession().pipe(
      tap(res => {
        // const { user } = ctx.getState();
        // if (!this.socketService.socket && user) {
        //   this.socketService.connect(user, token);
        // }
      }),
      catchError(error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Session expired',
          detail: 'Log In again',
          life: 3000,
        });

        ctx.dispatch(new Logout());
        return of(error);
      }),
    );
  }

  // Log in
  @Action(Login)
  onLogin(ctx: StateContext<AuthStateModel>, { email, password }: Login) {
    ctx.patchState({ loading: true });

    return this.#authService.login(email, password).pipe(
      tap((session: ISessionUser) => {
        ctx.dispatch(new LoginSuccess(session));
        // this.socketService.connect(session.user, session.token);
      }),
      catchError((error: HttpErrorResponse) => ctx.dispatch(new LoginFailed(error))),
    );
  }

  @Action(LoginSuccess)
  onLoginSuccess(ctx: StateContext<AuthStateModel>, { session }: LoginSuccess) {
    ctx.patchState({
      user: session.user,
      loading: false,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      error: null,
    });

    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('AUTH.NOTIFICATION.LOGIN_SUCCESS.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.LOGIN_SUCCESS.DETAIL'),
      life: 3000,
    });
    ctx.dispatch(new Navigate(['/app']));
  }

  @Action(LoginFailed)
  onLoginFailed(ctx: StateContext<AuthStateModel>, { error }: LoginFailed) {
    // TODO: написать кейсы ошибок для объективности
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('AUTH.NOTIFICATION.LOGIN_FAILED.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.LOGIN_FAILED.DETAIL'),
      life: 3000,
    });

    ctx.patchState({ loading: false });
    ctx.dispatch(new RemoveUser());
    return of(error);
  }

  @Action(Signup)
  onSignup(ctx: StateContext<AuthStateModel>, { email, password, passwordConfirmation }: Signup) {
    ctx.patchState({ loading: true });

    return this.#authService.signUp(email, password, passwordConfirmation).pipe(
      tap(() => {
        ctx.dispatch(new SignupSuccess());
        // this.socketService.connect(session.user, session.token);
      }),
      catchError((error: HttpErrorResponse) => ctx.dispatch(new SignupFailed(error))),
    );
  }

  @Action(SignupSuccess)
  onSignupSuccess(ctx: StateContext<AuthStateModel>) {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('AUTH.NOTIFICATION.SIGNUP_SUCCESS.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.SIGNUP_SUCCESS.DETAIL'),
      life: 3000,
    });

    ctx.patchState({ loading: false, error: null });
  }

  @Action(SignupFailed)
  onSignupFailed(ctx: StateContext<AuthStateModel>, { error }: SignupFailed) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('AUTH.NOTIFICATION.SIGNUP_FAILED.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.SIGNUP_FAILED.DETAIL'),
      life: 3000,
    });

    ctx.patchState({ loading: false, error });
    return of(error);
  }

  // Activate after signup
  @Action(ActivateAfterSignup)
  onActivateAfterSignup(ctx: StateContext<AuthStateModel>, { token }: ActivateAfterSignup) {
    ctx.patchState({ loading: true });

    return this.#authService.activateAfterSignup(token).pipe(
      tap((session: ISessionUser) => ctx.dispatch(new ActivationAfterSignupSuccess(session))),
      catchError((error: HttpErrorResponse) => ctx.dispatch(new ActivationAfterSignupFailed(error))),
    );
  }

  @Action(ActivationAfterSignupSuccess)
  onActivationAfterSignupSuccess(ctx: StateContext<AuthStateModel>, { session }: ActivationAfterSignupSuccess) {
    ctx.patchState({
      user: session.user,
      loading: false,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      error: null,
    });

    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('AUTH.NOTIFICATION.ACTIVATION_SIGNUP_SUCCESS.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.ACTIVATION_SIGNUP_SUCCESS.DETAIL'),
      life: 3000,
    });

    ctx.dispatch(new Navigate(['/app']));
  }

  @Action(ActivationAfterSignupFailed)
  onActivationAfterSignupFailed(ctx: StateContext<AuthStateModel>, { error }: ActivationAfterSignupFailed) {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('AUTH.NOTIFICATION.ACTIVATION_SIGNUP_FAILED.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.ACTIVATION_SIGNUP_FAILED.DETAIL'),
      life: 3000,
    });

    ctx.patchState({ loading: false });
    return of(error);
  }

  // Recover
  @Action(RecoverPassword)
  onRecoverPassword(ctx: StateContext<AuthStateModel>, { email }: RecoverPassword) {
    ctx.patchState({ loading: true });

    return this.#authService.recoverPassword(email).pipe(
      tap(() => ctx.dispatch(new RecoverSuccess())),
      catchError((error: HttpErrorResponse) => ctx.dispatch(new RecoverFailed(error))),
    );
  }

  @Action(RecoverSuccess)
  onRecoverSuccess(ctx: StateContext<AuthStateModel>) {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('AUTH.NOTIFICATION.RECOVER_SUCCESS.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.RECOVER_SUCCESS.DETAIL'),
      life: 3000,
    });

    ctx.patchState({ loading: false });
  }

  @Action(RecoverFailed)
  onRecoverFailed(ctx: StateContext<AuthStateModel>, { error }: RecoverFailed) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('AUTH.NOTIFICATION.RECOVER_FAILED.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.RECOVER_FAILED.DETAIL'),
      life: 3000,
    });

    ctx.patchState({ loading: false });
    return of(error);
  }

  // Activate after recover
  @Action(ActivateAfterRecover)
  onActivateAfterRecover(ctx: StateContext<AuthStateModel>, { token, password }: ActivateAfterRecover) {
    ctx.patchState({ loading: true });

    return this.#authService.activateAfterRecover(token, password).pipe(
      tap(() => ctx.dispatch(new ActivationAfterRecoverSuccess())),
      catchError((error: HttpErrorResponse) => ctx.dispatch(new ActivationAfterSignupFailed(error))),
    );
  }

  @Action(ActivationAfterRecoverSuccess)
  onActivationAfterRecoverSuccess(ctx: StateContext<AuthStateModel>) {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('AUTH.NOTIFICATION.ACTIVATION_RECOVER_SUCCESS.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.ACTIVATION_RECOVER_SUCCESS.DETAIL'),
      life: 3000,
    });

    ctx.patchState({ loading: false });
    ctx.dispatch(new LoginRedirect());
  }

  @Action(ActivationAfterSignupFailed)
  onActivationAfterRecoverFailed(ctx: StateContext<AuthStateModel>, { error }: ActivationAfterSignupFailed) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('AUTH.NOTIFICATION.ACTIVATION_RECOVER_FAILED.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.ACTIVATION_RECOVER_FAILED.DETAIL'),
      life: 3000,
    });

    ctx.patchState({ loading: false });
    return of(error);
  }

  // Refresh
  @Action(RefreshToken)
  onRefreshToken(ctx: StateContext<AuthStateModel>) {
    const { user } = ctx.getState();

    return this.#authService.refreshToken(user?.id || 0).pipe(
      tap((result: ISessionUser) => {
        ctx.patchState({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          error: null,
        });
      }),
      catchError(error => {
        ctx.patchState({
          accessToken: null,
          refreshToken: null,
          user: null,
          error,
        });

        ctx.dispatch(new Logout());

        // this.errorSnackBarService.showError('Auth Error');

        return error(error);
      }),
    );
  }

  // Logout
  @Action(Logout)
  onLogout(ctx: StateContext<AuthStateModel>) {
    ctx.dispatch([new RemoveUser(), new LoginRedirect()]);
  }

  @Action(RemoveUser)
  onRemoveUser(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      user: null,
      loading: false,
      accessToken: null,
      refreshToken: null,
      error: null,
    });
    // this.socketService.leaveChannel();
  }

  @Action(LoginRedirect)
  onLoginRedirect(ctx: StateContext<AuthStateModel>) {
    ctx.dispatch(new Navigate(['/auth/sign-in']));
  }

  // Terminate
  @Action(Terminate)
  onTerminate(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ loading: true });

    return this.#authService.terminateSessions().pipe(
      tap(() => {
        ctx.dispatch(new TerminationSuccess());
      }),
      catchError((error: HttpErrorResponse) => ctx.dispatch(new TerminationFailed(error))),
    );
  }

  @Action(TerminationSuccess)
  onTerminationSuccess(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      loading: false,
      error: null,
    });

    this.messageService.add({
      severity: 'warn',
      summary: this.translateService.instant('AUTH.NOTIFICATION.TERMINATION_SUCCESS.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.TERMINATION_SUCCESS.DETAIL'),
      life: 3000,
    });

    ctx.dispatch(new Logout());
  }

  @Action(TerminationFailed)
  onTerminationFailed(ctx: StateContext<AuthStateModel>, { error }: TerminationFailed) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('AUTH.NOTIFICATION.TERMINATION_FAILED.SUMMARY'),
      detail: this.translateService.instant('AUTH.NOTIFICATION.TERMINATION_FAILED.DETAIL'),
      life: 3000,
    });

    ctx.patchState({ loading: false });
    return of(error);
  }
}

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

// Интерфейс состояния
interface AuthStateModel {
  user: IUser | null;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  error: Error | null;
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
  private authService = inject(AuthService);

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
  public ngxsOnInit(ctx: StateContext<AuthStateModel>) {
    ctx.dispatch(new CheckSession());
  }

  @Action(CheckSession)
  public checkSession(ctx: StateContext<AuthStateModel>) {
    const { accessToken } = ctx.getState();
    if (!accessToken) {
      ctx.dispatch(new LoginRedirect());
      return;
    }

    return this.authService.checkSession().pipe(
      tap(res => {
        // const { user } = ctx.getState();
        // if (!this.socketService.socket && user) {
        //   this.socketService.connect(user, token);
        // }
      }),
      catchError(error => {
        ctx.dispatch(new Logout());
        return of(error);
      }),
    );
  }

  // Log in
  @Action(Login)
  public onLogin(ctx: StateContext<AuthStateModel>, { email, password }: Login) {
    ctx.patchState({ loading: true });

    return this.authService.login(email, password).pipe(
      tap((session: ISessionUser) => {
        ctx.dispatch(new LoginSuccess(session));
        // this.socketService.connect(session.user, session.token);
      }),
      catchError((error: Error) => ctx.dispatch(new LoginFailed(error))),
    );
  }

  @Action(LoginSuccess)
  public onLoginSuccess(ctx: StateContext<AuthStateModel>, { session }: LoginSuccess) {
    ctx.patchState({
      user: session.user,
      loading: false,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      error: null,
    });

    console.log('login success');
    // this.snackBar.open('Login Success');
    ctx.dispatch(new Navigate(['/']));
  }

  @Action(LoginFailed)
  public onLoginFailed(ctx: StateContext<AuthStateModel>, { error }: LoginFailed) {
    // if (isuserBannedError) {
    //   this.errorSnackBarService.showError('Ваша учетная запись заблокирована', 10000);
    // } else {
    //   this.errorSnackBarService.showError('Не удалось войти в систему');
    // }
    ctx.patchState({ loading: false });
    ctx.dispatch(new RemoveUser());
    return of(error);
  }

  @Action(Signup)
  public onSignup(ctx: StateContext<AuthStateModel>, { email, password, passwordConfirmation }: Signup) {
    ctx.patchState({ loading: true });

    return this.authService.signUp(email, password, passwordConfirmation).pipe(
      tap(() => {
        ctx.dispatch(new SignupSuccess());
        // this.socketService.connect(session.user, session.token);
      }),
      catchError((error: Error) => ctx.dispatch(new SignupFailed(error))),
    );
  }

  @Action(SignupSuccess)
  public onSignupSuccess(ctx: StateContext<AuthStateModel>) {
    console.log('signup success');
    ctx.patchState({ loading: false, error: null });
  }

  @Action(SignupFailed)
  public onSignupFailed(ctx: StateContext<AuthStateModel>, { error }: SignupFailed) {
    // this.errorSnackBarService.showError('Signup error');
    ctx.patchState({ loading: false, error });
    return of(error);
  }

  // Activate after signup
  @Action(ActivateAfterSignup)
  public onActivateAfterSignup(ctx: StateContext<AuthStateModel>, { token }: ActivateAfterSignup) {
    ctx.patchState({ loading: true });
    console.log('activation after signup');

    return this.authService.activateAfterSignup(token).pipe(
      tap((session: ISessionUser) => ctx.dispatch(new ActivationAfterSignupSuccess(session))),
      catchError((error: Error) => ctx.dispatch(new ActivationAfterSignupFailed(error))),
    );
  }

  @Action(ActivationAfterSignupSuccess)
  public onActivationAfterSignupSuccess(ctx: StateContext<AuthStateModel>, { session }: ActivationAfterSignupSuccess) {
    console.log('onActivationAfterSignupSuccess');
    ctx.patchState({
      user: session.user,
      loading: false,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      error: null,
    });

    ctx.dispatch(new Navigate(['/']));
  }

  @Action(ActivationAfterSignupFailed)
  public onActivationAfterSignupFailed(ctx: StateContext<AuthStateModel>, { error }: ActivationAfterSignupFailed) {
    // this.errorSnackBarService.showError('Activation error');

    ctx.patchState({ loading: false });
    return of(error);
  }

  // Recover
  @Action(RecoverPassword)
  public onRecoverPassword(ctx: StateContext<AuthStateModel>, { email }: RecoverPassword) {
    ctx.patchState({ loading: true });

    return this.authService.recoverPassword(email).pipe(
      tap(() => ctx.dispatch(new RecoverSuccess())),
      catchError((error: Error) => ctx.dispatch(new RecoverFailed(error))),
    );
  }

  @Action(RecoverSuccess)
  public onRecoverSuccess(ctx: StateContext<AuthStateModel>) {
    // this.snackBar.open('Recovery link sent');
    console.log('recover success');
    ctx.patchState({ loading: false });
  }

  @Action(RecoverFailed)
  public onRecoverFailed(ctx: StateContext<AuthStateModel>, { error }: RecoverFailed) {
    // this.errorSnackBarService.showError('Cannot send recovery link');
    ctx.patchState({ loading: false });
    return of(error);
  }

  // Activate after recover
  @Action(ActivateAfterRecover)
  public onActivateAfterRecover(ctx: StateContext<AuthStateModel>, { token, password }: ActivateAfterRecover) {
    ctx.patchState({ loading: true });

    return this.authService.activateAfterRecover(token, password).pipe(
      tap(() => ctx.dispatch(new ActivationAfterRecoverSuccess())),
      catchError((error: Error) => ctx.dispatch(new ActivationAfterSignupFailed(error))),
    );
  }

  @Action(ActivationAfterRecoverSuccess)
  public onActivationAfterRecoverSuccess(ctx: StateContext<AuthStateModel>) {
    // this.snackBar.open('Password created');
    ctx.patchState({ loading: false });
    ctx.dispatch(new LoginRedirect());
  }

  @Action(ActivationAfterSignupFailed)
  public onActivationAfterRecoverFailed(ctx: StateContext<AuthStateModel>, { error }: ActivationAfterSignupFailed) {
    // this.errorSnackBarService.showError('Cannot create password');
    ctx.patchState({ loading: false });
    return of(error);
  }

  // Refresh
  @Action(RefreshToken)
  public onRefreshToken(ctx: StateContext<AuthStateModel>) {
    const { user } = ctx.getState();

    return this.authService.refreshToken(user?.id || 0).pipe(
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
  public onLogout(ctx: StateContext<AuthStateModel>) {
    ctx.dispatch([new RemoveUser(), new LoginRedirect()]);
  }

  @Action(RemoveUser)
  public onRemoveUser(ctx: StateContext<AuthStateModel>) {
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
  public onLoginRedirect(ctx: StateContext<AuthStateModel>) {
    ctx.dispatch(new Navigate(['/auth/sign-in']));
  }

  // Terminate
  @Action(Terminate)
  public onTerminate(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ loading: true });

    return this.authService.terminateSessions().pipe(
      tap(() => {
        ctx.dispatch(new TerminationSuccess());
      }),
      catchError((error: Error) => ctx.dispatch(new TerminationFailed(error))),
    );
  }

  @Action(TerminationSuccess)
  public onTerminationSuccess(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      loading: false,
      error: null,
    });

    // this.snackBar.open('Termination Success');
  }

  @Action(TerminationFailed)
  public onTerminationFailed(ctx: StateContext<AuthStateModel>, { error }: TerminationFailed) {
    // this.errorSnackBarService.showError('Termination failed');
    ctx.patchState({ loading: false });
    return of(error);
  }
}

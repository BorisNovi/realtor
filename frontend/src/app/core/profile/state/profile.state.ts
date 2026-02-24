import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { IUser } from '@shared/interfaces';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Logout } from '../../auth/state/auth.actions';
import { ProfileService } from '../shared';
import {
  ChangePassword,
  DeleteAccount,
  EditProfile,
  FetchProfile,
  ProfileOperationFailed,
  ProfileOperationSuccess,
} from './profile.actions';

interface ProfileStateModel {
  user: IUser | null;
  loading: boolean;
  error: HttpErrorResponse | null;
}

@State<ProfileStateModel>({
  name: 'profile',
  defaults: {
    user: null,
    loading: false,
    error: null,
  },
})
@Injectable()
export class ProfileState {
  readonly #profileService = inject(ProfileService);
  readonly #messageService = inject(MessageService);
  readonly #translateService = inject(TranslateService);

  // Selectors
  @Selector()
  static user(state: ProfileStateModel): IUser | null {
    return state.user;
  }

  @Selector()
  static loading(state: ProfileStateModel): boolean {
    return state.loading;
  }

  // Actions
  @Action(FetchProfile)
  fetchListing(ctx: StateContext<ProfileStateModel>) {
    ctx.patchState({ loading: true });
    return this.#profileService.fetchProfile().pipe(
      tap((user: IUser) => ctx.patchState({ user, loading: false })),
      catchError((error: Error) => ctx.dispatch(new ProfileOperationFailed(error))),
    );
  }

  @Action(ChangePassword)
  changePassword(ctx: StateContext<ProfileStateModel>, { oldPassword, newPassword, newPasswordConfirmation }: ChangePassword) {
    ctx.patchState({ loading: true });
    return this.#profileService.changePassword({ oldPassword, newPassword, newPasswordConfirmation }).pipe(
      tap(() => ctx.patchState({ loading: false })),
      catchError((error: Error) => ctx.dispatch(new ProfileOperationFailed(error))),
    );
  }

  @Action(EditProfile)
  editProfile(ctx: StateContext<ProfileStateModel>, { options }: EditProfile) {
    ctx.patchState({ loading: true });
    return this.#profileService.changeProfileDetails(options).pipe(
      tap((user: IUser) => ctx.patchState({ user, loading: false })),
      tap(() => ctx.dispatch(new ProfileOperationSuccess('UPDATED'))),
      catchError((error: Error) =>
        ctx.dispatch(new ProfileOperationFailed(error, 'UPDATE_FAILED')).pipe(switchMap(() => throwError(() => error))),
      ),
    );
  }

  @Action(DeleteAccount)
  deleteAccount(ctx: StateContext<ProfileStateModel>, { password }: DeleteAccount) {
    ctx.patchState({ loading: true });
    return this.#profileService.deleteAccount(password).pipe(
      tap(() => ctx.patchState({ loading: false, user: null })),
      tap(() => ctx.dispatch(new ProfileOperationSuccess('ACCOUNT_DELETED'))),
      tap(() => ctx.dispatch(new Logout())),
      catchError((error: Error) => ctx.dispatch(new ProfileOperationFailed(error, 'ACCOUNT_DELETE_FAILED'))),
    );
  }

  @Action(ProfileOperationSuccess)
  onProfileOperationSuccess(ctx: StateContext<ProfileStateModel>, { message }: ProfileOperationSuccess) {
    if (message) {
      this.#messageService.add({
        severity: 'success',
        summary: this.#translateService.instant('NOTIFICATIONS.SUCCESS'),
        detail: this.#translateService.instant('PROFILE.NOTIFICATION.' + message),
        life: 3000,
      });
    }

    return ctx.patchState({ loading: false });
  }

  @Action(ProfileOperationFailed)
  onProfileOperationFailed(ctx: StateContext<ProfileStateModel>, { error, message }: ProfileOperationFailed) {
    if (error || message) {
      this.#messageService.add({
        severity: 'error',
        summary: this.#translateService.instant('NOTIFICATIONS.ERROR'),
        detail: message ? this.#translateService.instant('PROFILE.NOTIFICATION.' + message) : error.message,
        life: 3000,
      });
    }
    ctx.patchState({ loading: false });
    return of(throwError(() => error));
  }
}

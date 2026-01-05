import { inject, Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { FetchProfile, ChangePassword, EditProfile, ProfileOperationSuccess, ProfileOperationFailed } from './profile.actions';
import { ISessionUser, IUser } from '@shared/interfaces';
import { Navigate } from '@ngxs/router-plugin';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ProfileService } from '../shared';

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
  changePassword(ctx: StateContext<ProfileStateModel>, { password, passwordConfirmation }: ChangePassword) {
    ctx.patchState({ loading: true });
    return this.#profileService.changePassword({ password, password_confirmation: passwordConfirmation }).pipe(
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
    if (message) {
      this.#messageService.add({
        severity: 'error',
        summary: this.#translateService.instant('NOTIFICATIONS.ERROR'),
        detail: this.#translateService.instant('PROFILE.NOTIFICATION.' + message),
        life: 3000,
      });
    }
    ctx.patchState({ loading: false });
    return of(throwError(() => error));
  }
}

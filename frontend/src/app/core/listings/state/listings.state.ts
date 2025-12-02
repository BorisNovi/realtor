import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { IListing, IPagination, ISort, ITableData } from '@shared/interfaces';
import { MessageService } from 'primeng/api';
import { catchError, of, switchMap, tap, throwError } from 'rxjs';
import { ListingsService } from '../shared';
import {
  ChangeListingAvaliability,
  CreateListing,
  DeleteListing,
  FetchListing,
  FetchListings,
  ListingsOperationFailed,
  ListingsOperationSuccess,
  SetListingsPagination,
  SetListingsSort,
  UpdateListing,
} from './listings.actions';

interface ListingsStateModel {
  listings: ITableData<IListing>;
  sort: ISort | null;
  listing: IListing | null;
  loading: boolean;
  pagination: IPagination;
}

@State<ListingsStateModel>({
  name: 'listings',
  defaults: {
    listings: { items: [], total: 0 },
    sort: null,
    listing: null,
    pagination: {
      first: 0,
      rows: 20,
    },
    loading: false,
  },
})
@Injectable()
export class ListingsState {
  readonly #listingsService = inject(ListingsService);
  readonly #messageService = inject(MessageService);
  readonly #translateService = inject(TranslateService);

  // Selectors
  @Selector()
  static loading({ loading }: ListingsStateModel) {
    return loading;
  }

  @Selector()
  static listings({ listings }: ListingsStateModel) {
    return listings;
  }

  @Selector()
  static listing({ listing }: ListingsStateModel) {
    return listing;
  }

  @Selector()
  static pagination({ pagination }: ListingsStateModel) {
    return pagination;
  }

  // Actions
  @Action(FetchListings)
  FetchListings(ctx: StateContext<ListingsStateModel>) {
    const { pagination, sort } = ctx.getState();

    if (pagination.first === undefined || pagination.rows === undefined) return;

    ctx.patchState({ loading: true });

    return this.#listingsService.fetchListings({ pagination, sort }).pipe(
      tap((listings: ITableData<IListing>) => ctx.patchState({ listings, loading: false })),
      catchError((error: Error) => ctx.dispatch(new ListingsOperationFailed(error))),
    );
  }

  @Action(SetListingsPagination)
  setListingsPagination(ctx: StateContext<ListingsStateModel>, { pagination }: SetListingsPagination) {
    ctx.patchState({
      pagination: {
        first: pagination.first,
        rows: pagination.rows,
      },
    });
  }

  @Action(SetListingsSort)
  setListingsSort(ctx: StateContext<ListingsStateModel>, { sort }: SetListingsSort) {
    ctx.patchState({
      sort,
    });
  }

  @Action(FetchListing)
  fetchListing(ctx: StateContext<ListingsStateModel>, { id }: FetchListing) {
    ctx.patchState({ loading: true });
    return this.#listingsService.fetchListing(id).pipe(
      tap((listing: IListing) => ctx.patchState({ listing, loading: false })),
      catchError((error: Error) => ctx.dispatch(new ListingsOperationFailed(error))),
    );
  }

  @Action(CreateListing)
  createListing(ctx: StateContext<ListingsStateModel>, { listing, opts }: CreateListing) {
    ctx.patchState({ loading: true });
    return this.#listingsService.createListing(listing).pipe(
      tap((listing: IListing) => ctx.patchState({ listing, loading: false })),
      tap(() => ctx.dispatch(new ListingsOperationSuccess('CREATED', opts?.getList))),
      catchError((error: Error) =>
        ctx.dispatch(new ListingsOperationFailed(error, 'CREATE_FAILED')).pipe(switchMap(() => throwError(() => error))),
      ),
    );
  }

  @Action(UpdateListing)
  updateListing(ctx: StateContext<ListingsStateModel>, { listing, opts }: UpdateListing) {
    ctx.patchState({ loading: true });
    return this.#listingsService.updateListing(listing).pipe(
      tap((listing: IListing) => ctx.patchState({ listing, loading: false })),
      tap(() => ctx.dispatch(new ListingsOperationSuccess('UPDATED', opts?.getList))),
      catchError((error: Error) =>
        ctx.dispatch(new ListingsOperationFailed(error, 'UPDATE_FAILED')).pipe(switchMap(() => throwError(() => error))),
      ),
    );
  }

  @Action(ChangeListingAvaliability)
  changeListingAvaliability(ctx: StateContext<ListingsStateModel>, { id, publicLink, opts }: ChangeListingAvaliability) {
    ctx.patchState({ loading: true });
    return this.#listingsService.changeListingAvailability(id, publicLink).pipe(
      tap((listing: IListing) => ctx.patchState({ listing, loading: false })),
      tap(() => ctx.dispatch(new ListingsOperationSuccess('LINK_AVAILABILITY_CHANGED', opts?.getList))),
      catchError((error: Error) =>
        ctx
          .dispatch(new ListingsOperationFailed(error, 'LINK_AVAILABILITY_FAILED'))
          .pipe(switchMap(() => throwError(() => error))),
      ),
    );
  }

  @Action(DeleteListing)
  deleteListing(ctx: StateContext<ListingsStateModel>, { idList, opts }: DeleteListing) {
    ctx.patchState({ loading: true });
    return this.#listingsService.deleteListing(idList).pipe(
      tap(() => {
        ctx.dispatch(new ListingsOperationSuccess('DELETED', opts?.getList));
      }),
      catchError((error: Error) => ctx.dispatch(new ListingsOperationFailed(error, 'DELETE_FAILED'))),
    );
  }

  @Action(ListingsOperationSuccess)
  onListingsOperationSuccess(ctx: StateContext<ListingsStateModel>, { message, getList }: ListingsOperationSuccess) {
    if (message) {
      this.#messageService.add({
        severity: 'success',
        summary: this.#translateService.instant('NOTIFICATIONS.SUCCESS'),
        detail: this.#translateService.instant('LISTINGS.NOTIFICATION.' + message),
        life: 3000,
      });
    }

    if (getList) ctx.dispatch(new FetchListings());
    return ctx.patchState({ loading: false });
  }

  @Action(ListingsOperationFailed)
  onListingsOperationFailed(ctx: StateContext<ListingsStateModel>, { error, message }: ListingsOperationFailed) {
    if (message) {
      this.#messageService.add({
        severity: 'error',
        summary: this.#translateService.instant('NOTIFICATIONS.ERROR'),
        detail: this.#translateService.instant('LISTINGS.NOTIFICATION.' + message),
        life: 3000,
      });
    }
    ctx.patchState({ loading: false });
    return of(error);
  }
}

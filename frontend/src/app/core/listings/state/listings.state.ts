import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { IPagination, ISort, ITableData } from '@shared/interfaces';
import { IListing, IListingDetailed } from '@shared/interfaces/listing.interface';
import { MessageService } from 'primeng/api';
import { catchError, of, switchMap, tap, throwError } from 'rxjs';
import { ListingsService } from '../shared';
import {
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
  listing: IListingDetailed | null;
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
      tap((listing: IListingDetailed) => ctx.patchState({ listing, loading: false })),
      catchError((error: Error) => ctx.dispatch(new ListingsOperationFailed(error))),
    );
  }

  @Action(CreateListing)
  createListing(ctx: StateContext<ListingsStateModel>, { listing }: CreateListing) {
    ctx.patchState({ loading: true });
    return this.#listingsService.createListing(listing).pipe(
      tap((listing: IListingDetailed) => ctx.patchState({ listing, loading: false })),
      tap(() => ctx.dispatch(new ListingsOperationSuccess('CREATED'))),
      catchError((error: Error) =>
        ctx.dispatch(new ListingsOperationFailed(error, 'CREATE_FAILED')).pipe(switchMap(() => throwError(() => error))),
      ),
    );
  }

  @Action(UpdateListing)
  updateListing(ctx: StateContext<ListingsStateModel>, { listing }: UpdateListing) {
    ctx.patchState({ loading: true });
    return this.#listingsService.updateListing(listing).pipe(
      tap((listing: IListingDetailed) => ctx.patchState({ listing, loading: false })),
      tap(() => ctx.dispatch(new ListingsOperationSuccess('UPDATED'))),
      catchError((error: Error) =>
        ctx.dispatch(new ListingsOperationFailed(error, 'UPDATE_FAILED')).pipe(switchMap(() => throwError(() => error))),
      ),
    );
  }

  @Action(DeleteListing)
  deleteListing(ctx: StateContext<ListingsStateModel>, { idList }: DeleteListing) {
    ctx.patchState({ loading: true });
    return this.#listingsService.deleteListing(idList).pipe(
      tap(() => {
        ctx.dispatch(new ListingsOperationSuccess('DELETED'));
      }),
      catchError((error: Error) => ctx.dispatch(new ListingsOperationFailed(error, 'DELETE_FAILED'))),
    );
  }

  @Action(ListingsOperationSuccess)
  onListingsOperationSuccess(ctx: StateContext<ListingsStateModel>, { message }: ListingsOperationSuccess) {
    if (message) {
      this.#messageService.add({
        severity: 'success',
        summary: this.#translateService.instant('NOTIFICATIONS.SUCCESS'),
        detail: this.#translateService.instant('LISTINGS.NOTIFICATION.' + message),
        life: 3000,
      });
    }

    ctx.dispatch(new FetchListings());
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

import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ICatalogFilters, ICatalogItem, IMapBox, IPagination, IPropertyObject, ISort, ITableData } from '@shared/interfaces';
import { ICatalogMapItem } from '@shared/interfaces/catalog-item.interface';
import { MapHelper } from '@shared/utils';
import { MessageService } from 'primeng/api';
import { catchError, of, switchMap, tap, throwError } from 'rxjs';
import { CatalogService } from '../shared';
import {
  CatalogOperationFailed,
  CatalogOperationSuccess,
  CreatePropertyObject,
  DeletePropertyObjects,
  FetchCatalog,
  FetchCatalogMap,
  FetchPropertyObject,
  SetCatalogFilters,
  SetCatalogPagination,
  SetCatalogSort,
  UpdatePropertyObject,
  UpdateStatus,
} from './catalog.actions';

interface CatalogStateModel {
  catalog: ITableData<ICatalogItem>;
  mapCatalog: ITableData<ICatalogMapItem>;
  loadedBox: IMapBox | null;
  loadedBoxFilters: ICatalogFilters | null;
  filters: ICatalogFilters;
  sort: ISort | null;
  propertyObject: IPropertyObject | null;
  loading: boolean;
  pagination: IPagination;
}

@State<CatalogStateModel>({
  name: 'catalog',
  defaults: {
    catalog: { items: [], total: 0 },
    mapCatalog: { items: [], total: 0 },
    loadedBox: null,
    loadedBoxFilters: {},
    filters: {},
    sort: null,
    propertyObject: null,
    pagination: {
      first: 0,
      rows: 20,
    },
    loading: false,
  },
})
@Injectable()
export class CatalogState {
  readonly #catalogService = inject(CatalogService);
  readonly #messageService = inject(MessageService);
  readonly #translateService = inject(TranslateService);

  // Selectors
  @Selector()
  static loading({ loading }: CatalogStateModel) {
    return loading;
  }

  @Selector()
  static catalog({ catalog }: CatalogStateModel) {
    return catalog;
  }

  @Selector()
  static mapCatalog({ mapCatalog }: CatalogStateModel) {
    return mapCatalog;
  }

  @Selector()
  static loadedBox({ loadedBox }: CatalogStateModel) {
    return loadedBox;
  }

  @Selector()
  static propertyObject({ propertyObject }: CatalogStateModel) {
    return propertyObject;
  }

  @Selector()
  static pagination({ pagination }: CatalogStateModel) {
    return pagination;
  }

  @Selector()
  static filters({ filters }: CatalogStateModel) {
    return filters;
  }

  // Actions
  @Action(FetchCatalog)
  fetchCatalog(ctx: StateContext<CatalogStateModel>) {
    const { filters, pagination, sort } = ctx.getState();

    if (pagination.first === undefined || pagination.rows === undefined) return;

    ctx.patchState({ loading: true });

    return this.#catalogService.fetchCatalog({ filters, pagination, sort }).pipe(
      tap((catalog: ITableData<ICatalogItem>) => ctx.patchState({ catalog, loading: false })),
      catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error))),
    );
  }

  @Action(FetchCatalogMap)
  fetchCatalogMap(ctx: StateContext<CatalogStateModel>, { box }: FetchCatalogMap) {
    const state = ctx.getState();
    const filtersChanged = !state.loadedBoxFilters || !Object.is(state.loadedBoxFilters, state.filters);

    if (!filtersChanged && state.loadedBox && MapHelper.isInsideBox(box, state.loadedBox))
      return;

    const expandedBox = MapHelper.expandBox(box, 0.25);

    ctx.patchState({ loading: true });

    return this.#catalogService.fetchCatalogMap({ filters: state.filters }, expandedBox)
      .pipe(
        tap(mapCatalog => {
          ctx.patchState({
            mapCatalog,
            loadedBox: expandedBox,
            loadedBoxFilters: state.filters,
            loading: false,
          });
        }),
        catchError(error => ctx.dispatch(new CatalogOperationFailed(error)))
      );
  }

  @Action(SetCatalogPagination)
  setCatalogPagination(ctx: StateContext<CatalogStateModel>, { pagination }: SetCatalogPagination) {
    ctx.patchState({
      pagination: {
        first: pagination.first,
        rows: pagination.rows,
      },
    });
  }

  @Action(SetCatalogFilters)
  setCatalogFilters(ctx: StateContext<CatalogStateModel>, { filters }: SetCatalogFilters) {
    ctx.patchState({
      filters,
    });
  }

  @Action(SetCatalogSort)
  setCatalogSort(ctx: StateContext<CatalogStateModel>, { sort }: SetCatalogSort) {
    console.log('sort', sort);
    ctx.patchState({
      sort,
    });
  }

  @Action(FetchPropertyObject)
  fetchPropertyObject(ctx: StateContext<CatalogStateModel>, { id }: FetchPropertyObject) {
    ctx.patchState({ loading: true });
    return this.#catalogService.fetchPropertyObject(id).pipe(
      tap((propertyObject: IPropertyObject) => ctx.patchState({ propertyObject, loading: false })),
      catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error))),
    );
  }

  @Action(CreatePropertyObject)
  createPropertyObject(ctx: StateContext<CatalogStateModel>, { propertyObject }: CreatePropertyObject) {
    ctx.patchState({ loading: true });
    return this.#catalogService.createPropertyObject(propertyObject).pipe(
      tap((propertyObject: IPropertyObject) => ctx.patchState({ propertyObject, loading: false })),
      tap(() => ctx.dispatch(new CatalogOperationSuccess('CREATED'))),
      catchError((error: Error) =>
        ctx.dispatch(new CatalogOperationFailed(error, 'CREATE_FAILED')).pipe(switchMap(() => throwError(() => error))),
      ),
    );
  }

  @Action(UpdatePropertyObject)
  updatePropertyObject(ctx: StateContext<CatalogStateModel>, { propertyObject }: UpdatePropertyObject) {
    ctx.patchState({ loading: true });
    return this.#catalogService.updatePropertyObject(propertyObject).pipe(
      tap((propertyObject: IPropertyObject) => ctx.patchState({ propertyObject, loading: false })),
      tap(() => ctx.dispatch(new CatalogOperationSuccess('UPDATED'))),
      catchError((error: Error) =>
        ctx.dispatch(new CatalogOperationFailed(error, 'UPDATE_FAILED')).pipe(switchMap(() => throwError(() => error))),
      ),
    );
  }

  @Action(UpdateStatus)
  updateStatus(ctx: StateContext<CatalogStateModel>, { id, status }: UpdateStatus) {
    ctx.patchState({ loading: true });
    return this.#catalogService.updateStatus(id, status).pipe(
      tap(() => ctx.dispatch(new CatalogOperationSuccess('STATUS_UPDATED'))),
      catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error, 'STATUS_UPDATE_FAILED'))),
    );
  }

  @Action(DeletePropertyObjects)
  deletePropertyObjects(ctx: StateContext<CatalogStateModel>, { idList }: DeletePropertyObjects) {
    ctx.patchState({ loading: true });
    return this.#catalogService.deletePropertyObject(idList).pipe(
      tap(() => {
        ctx.dispatch(new CatalogOperationSuccess('DELETED'));
      }),
      catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error, 'DELETE_FAILED'))),
    );
  }

  @Action(CatalogOperationSuccess)
  onCatalogOperationSuccess(ctx: StateContext<CatalogStateModel>, { message }: CatalogOperationSuccess) {
    if (message) {
      this.#messageService.add({
        severity: 'success',
        summary: this.#translateService.instant('NOTIFICATIONS.SUCCESS'),
        detail: this.#translateService.instant('CATALOG.NOTIFICATION.' + message),
        life: 3000,
      });
    }

    ctx.dispatch(new FetchCatalog());
    return ctx.patchState({ loading: false });
  }

  @Action(CatalogOperationFailed)
  onCatalogOperationFailed(ctx: StateContext<CatalogStateModel>, { error, message }: CatalogOperationFailed) {
    if (message) {
      this.#messageService.add({
        severity: 'error',
        summary: this.#translateService.instant('NOTIFICATIONS.ERROR'),
        detail: this.#translateService.instant('CATALOG.NOTIFICATION.' + message),
        life: 3000,
      });
    }
    ctx.patchState({ loading: false });
    return of(error);
  }
}

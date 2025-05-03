import { inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ICatalogFilters, ICatalogItem, IPagination, IPropertyObject, ITableData } from '@shared/interfaces';
import { CatalogService } from '../shared';
import { tap, catchError, of } from 'rxjs';
import {
  CatalogOperationFailed,
  CatalogOperationSuccess,
  CreatePropertyObject,
  DeletePropertyObjects,
  FetchCatalog,
  FetchPropertyObject,
  SetCatalogFilters,
  SetCatalogPagination,
  UpdatePropertyObject,
  UpdateStatus,
} from './catalog.actions';
import { QueryParamsService } from '../../services';
import { CATALOG_FILTERS_KEY, CATALOG_PAGINATION_KEY } from '@shared/constants';

interface CatalogStateModel {
  catalog: ITableData<ICatalogItem>;
  filters: ICatalogFilters;
  propertyObject: IPropertyObject | null;
  loading: boolean;
  pagination: IPagination;
}

@State<CatalogStateModel>({
  name: 'catalog',
  defaults: {
    catalog: { items: [], total: 0 },
    filters: {},
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
  readonly #queryParamsService = inject(QueryParamsService);

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

  @Action(FetchCatalog)
  FetchCatalog(ctx: StateContext<CatalogStateModel>) {
    let { filters, pagination } = ctx.getState();

    // TODO: возможно, стоит вынести эту логику в резолвер.
    // Также, если мы сменили маршрут, данные останутся в стейте, но их не будет в квери строке
    // Надо добавлять их в квери строку, если они есть в стейте, но квери строка пуста
    const filtersFromQuery = this.#queryParamsService.getQueryParamsByKeySync(CATALOG_FILTERS_KEY) as ICatalogFilters;
    if (!Object.keys(filters).length) {
      filters = filtersFromQuery;
      ctx.patchState({ filters });
    }

    const paginationFromQuery = this.#queryParamsService.getQueryParamsByKeySync(CATALOG_PAGINATION_KEY) as IPagination;
    if (
      (pagination.first !== paginationFromQuery.first && paginationFromQuery.first) ||
      (pagination.rows !== paginationFromQuery.rows && paginationFromQuery.rows)
    ) {
      pagination = paginationFromQuery;
      ctx.patchState({ pagination });
    }

    ctx.patchState({ loading: true });

    return this.#catalogService.fetchCatalog(filters, pagination).pipe(
      tap((catalog: ITableData<ICatalogItem>) => ctx.patchState({ catalog, loading: false, pagination })),
      catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error))),
    );
  }

  @Action(SetCatalogPagination)
  setCatalogPagination(ctx: StateContext<CatalogStateModel>, { pagination }: SetCatalogPagination) {
    this.#queryParamsService.updateQueryParams(pagination, CATALOG_PAGINATION_KEY);
    ctx.patchState({
      pagination: {
        first: pagination.first,
        rows: pagination.rows,
      },
    });
  }

  @Action(SetCatalogFilters)
  setCatalogFilters(ctx: StateContext<CatalogStateModel>, { filters }: SetCatalogFilters) {
    this.#queryParamsService.updateQueryParams(filters, CATALOG_FILTERS_KEY);
    ctx.patchState({
      filters,
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
      tap(() => ctx.dispatch(new CatalogOperationSuccess('успешно создан'))),
      catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error, 'Не удалось создать'))),
    );
  }

  @Action(UpdatePropertyObject)
  updatePropertyObject(ctx: StateContext<CatalogStateModel>, { propertyObject }: UpdatePropertyObject) {
    ctx.patchState({ loading: true });
    return this.#catalogService.updatePropertyObject(propertyObject).pipe(
      tap(() => ctx.dispatch(new CatalogOperationSuccess('успешно обновлен'))),
      catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error, 'Не удалось обновить'))),
    );
  }

  @Action(UpdateStatus)
  updateStatus(ctx: StateContext<CatalogStateModel>, { id, status }: UpdateStatus) {
    ctx.patchState({ loading: true });
    return this.#catalogService.updateStatus(id, status).pipe(
      tap(() => ctx.dispatch([new CatalogOperationSuccess('status успешно обновлен'), new FetchCatalog()])),
      catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error, 'Не удалось обновить status'))),
    );
  }

  @Action(DeletePropertyObjects)
  deletePropertyObjects(ctx: StateContext<CatalogStateModel>, { idList }: DeletePropertyObjects) {
    ctx.patchState({ loading: true });
    return this.#catalogService.deletePropertyObject(idList).pipe(
      tap(() => {
        ctx.dispatch(new FetchCatalog());
        ctx.dispatch(new CatalogOperationSuccess('успешно удален'));
      }),
      catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error, 'Не удалось удалить'))),
    );
  }

  @Action(CatalogOperationSuccess)
  onCatalogOperationSuccess(ctx: StateContext<CatalogStateModel>, { message }: CatalogOperationSuccess) {
    if (message) {
      // this.snackBar.open(message);
      console.debug(message);
    }

    return ctx.patchState({ loading: false });
  }

  @Action(CatalogOperationFailed)
  onCatalogOperationFailed(ctx: StateContext<CatalogStateModel>, { error, message }: CatalogOperationFailed) {
    if (message) {
      // this.errorSnackBarService.showError(message);
    }

    ctx.patchState({ loading: false });
    return of(error);
  }
}

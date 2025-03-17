import { inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ICatalogItem, IPagination, IPropertyObject, ITableData } from '@shared/interfaces';
import { CatalogService } from '../shared';
import { Navigate } from '@ngxs/router-plugin';
import { tap, catchError, of } from 'rxjs';
import { CatalogOperationFailed, CatalogOperationSuccess, CreatePropertyObject, DeletePropertyObjects, FetchCatalog, FetchPropertyObject, UpdatePropertyObject } from './catalog.actions';

interface CatalogStateModel {
  catalog: ITableData<ICatalogItem>;
  propertyObject: IPropertyObject | null;
  loading: boolean;
  pagination: IPagination;
}

@State<CatalogStateModel>({
  name: 'catalog',
  defaults: {
    catalog: { items: [], total: 0 },
    propertyObject: null,
    pagination: {
      pageIndex: 0,
      pageSize: 20,
    },
    loading: false,
  },
})
@Injectable()
export class CatalogState {
  private readonly catalogService = inject(CatalogService);

  // Selectors
  @Selector()
  public static loading({ loading }: CatalogStateModel) {
    return loading;
  }

  @Selector()
  public static catalog({ catalog }: CatalogStateModel) {
    return catalog;
  }

  @Selector()
  public static pagination({ pagination }: CatalogStateModel) {
    return pagination;
  }

  @Action(FetchCatalog)
  public FetchCatalog(ctx: StateContext<CatalogStateModel>) {
    ctx.patchState({ loading: true });
    return this.catalogService.fetchCatalog().pipe(
      tap((catalog: ITableData<ICatalogItem>) => ctx.patchState({ catalog, loading: false })),
      catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error))),
    );
  }

  @Action(FetchPropertyObject)
  public fetchPropertyObject(ctx: StateContext<CatalogStateModel>, { id }: FetchPropertyObject) {
    ctx.patchState({ loading: true });
    // return this.catalogService.getPropertyObject(id).pipe(
    //   tap((propertyObject: IPropertyObject) => ctx.patchState({ propertyObject, loading: false })),
    //   catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error))),
    // );
  }

  @Action(CreatePropertyObject)
  public createPropertyObject(ctx: StateContext<CatalogStateModel>, { propertyObject }: CreatePropertyObject) {
    ctx.patchState({ loading: true });
    // return this.catalogService.create(propertyObject).pipe(
    //   tap(() => ctx.dispatch(new CatalogOperationSuccess('успешно создан'))),
    //   catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error, 'Не удалось создать'))),
    // );
  }

  @Action(UpdatePropertyObject)
  public updatePropertyObject(ctx: StateContext<CatalogStateModel>, { propertyObject }: UpdatePropertyObject) {
    // const { id } = ctx.getState().propertyObject;
    // ctx.patchState({ loading: true });
    // return this.catalogService.update(id, propertyObject).pipe(
    //   tap(() => ctx.dispatch(new CatalogOperationSuccess('успешно обновлен'))),
    //   catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error, 'Не удалось обновить'))),
    // );
  }

  @Action(DeletePropertyObjects)
  public deletePropertyObjects(ctx: StateContext<CatalogStateModel>, { idList }: DeletePropertyObjects) {
    ctx.patchState({ loading: true });
    // return this.catalogService.delete(idList).pipe(
    //   tap(() => {
    //     ctx.dispatch(new FetchCatalog());
    //     ctx.dispatch(new CatalogOperationSuccess('успешно удален'));
    //   }),
    //   catchError((error: Error) => ctx.dispatch(new CatalogOperationFailed(error, 'Не удалось удалить'))),
    // );
  }

  @Action(CatalogOperationSuccess)
  public onCatalogOperationSuccess(ctx: StateContext<CatalogStateModel>, { message }: CatalogOperationSuccess) {
    if (message) {
      // this.snackBar.open(message);
    }

    return ctx.patchState({ loading: false });
  }

  @Action(CatalogOperationFailed)
  public onCatalogOperationFailed(ctx: StateContext<CatalogStateModel>, { error, message }: CatalogOperationFailed) {
    if (message) {
      // this.errorSnackBarService.showError(message);
    }

    ctx.patchState({ loading: false });
    return of(error);
  }
}

import { inject, Injectable } from '@angular/core';
import { Selector, State } from '@ngxs/store';
import { ICatalogItem, IPagination, ITableData } from '@shared/interfaces';
import { CatalogService } from '../shared';

interface CatalogStateModel {
  catalog: ITableData<ICatalogItem>;
  loading: boolean;
  pagination: IPagination;
}

@State<CatalogStateModel>({
  name: 'catalog',
  defaults: {
    catalog: { items: [], total: 0 },
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
  public static offices({ catalog }: CatalogStateModel) {
    return catalog;
  }

  @Selector()
  public static pagination({ pagination }: CatalogStateModel) {
    return pagination;
  }
}

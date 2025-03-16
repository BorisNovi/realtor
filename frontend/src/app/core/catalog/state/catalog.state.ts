import { State } from '@ngxs/store';
import { ICatalogItem, IPagination, ITableData } from '@shared/interfaces';

interface CatalogStateModel {
  catalog: ITableData<ICatalogItem>;
  loading: boolean;
  pagination: IPagination;
}

// @State<CatalogStateModel>({
//   name: 'catalog',
//   defaults: {
//     catalog: { items: [], total: 0 },
//     pagination: {
//       pageIndex: 0,
//       pageSize: 20
//     },
//     loading: false,
//   },
// })

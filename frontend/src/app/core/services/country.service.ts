import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ICountry, IFetchOptions, ITableData } from '@shared/interfaces';
import { CrudBaseService } from '../base';

@Injectable({
  providedIn: 'root',
})
export class CountryService extends CrudBaseService {
  constructor() {
    super(`${environment.apiUrl}`);
  }

  fetchCountries(options: IFetchOptions) {
    return this.fetchList<ITableData<ICountry>>(`country/list`, options);
  }
}

import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ICountry, IFetchOptions, IPasswordChange, ITableData, IUser, IUserEditable } from '@shared/interfaces';
import { CrudBaseService } from '../../base';

@Injectable({
  providedIn: 'root',
})
export class ProfileService extends CrudBaseService {
  constructor() {
    super(`${environment.apiUrl}`);
  }

  fetchProfile() {
    return this.http.get<IUser>(`${this.baseUrl}/profile`);
  }

  fetchCountries(options: IFetchOptions) {
    return this.fetchList<ITableData<ICountry>>(`country/list`, options);
  }

  changePassword(body: IPasswordChange) {
    return this.create<IPasswordChange, null>(body, 'profile/change-password');
  }

  changeProfileDetails(body: Partial<IUserEditable>) {
    return this.patch<IUserEditable, IUser>(body, 'profile');
  }

  deleteAccount(password: string) {
    return this.create<{ password: string }, null>({ password }, 'profile/delete');
  }
}

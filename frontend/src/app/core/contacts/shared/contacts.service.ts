import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { IContact, IFetchOptions, ITableData } from '@shared/interfaces';
import { CrudBaseService } from '../../base';

@Injectable({
  providedIn: 'root',
})
export class ContactsService extends CrudBaseService {
  constructor() {
    super(`${environment.apiUrl}`);
  }

  fetchContacts(options: IFetchOptions) {
    return this.fetchList<ITableData<IContact>>('contact/list', options);
  }

  fetchContact(id: number) {
    return this.fetchOne<IContact>(id, 'contact');
  }

  createContact(body: IContact) {
    return this.create<IContact>(body, 'contact');
  }

  updateContact(body: IContact) {
    return this.update<IContact>(body, 'contact');
  }

  deleteContact(ids: number[]) {
    return this.delete(ids, 'contact');
  }
}

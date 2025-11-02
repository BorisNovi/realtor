import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { IContact, IFetchOptions, ITableData } from '@shared/interfaces';
import { Observable } from 'rxjs';
import { CrudBaseService } from '../../base';

// TODO: Бэкендера надо пиздить палкой
@Injectable({
  providedIn: 'root',
})
export class ContactsService extends CrudBaseService {
  readonly #http = inject(HttpClient);

  constructor() {
    super(`${environment.apiUrl}`);
  }

  fetchContacts(options: IFetchOptions): Observable<ITableData<IContact>> {
    return this.fetchList<ITableData<IContact>>('contact/list', options);
  }

  fetchContact(id: number): Observable<IContact> {
    return this.fetchOne<IContact>(id, 'contact');
  }

  createContact(body: IContact): Observable<IContact> {
    return this.create<IContact>(body, 'contact');
  }

  updateContact(body: IContact): Observable<IContact> {
    return this.update<IContact>(body, 'contact');
  }

  // deleteContact(id: number): Observable<void> {
  //   return this.delete(id, 'contact/');
  // }

  // TODO: заменить на закомментированный, когда бэк будет сделан
  deleteContact(id: number): Observable<void> {
    return this.#http.delete<void>(`${environment.apiUrl}/contact/${id}`);
  }
}

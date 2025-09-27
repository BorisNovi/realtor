import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { IContact, IPagination, ISort, ITableData } from '@shared/interfaces';
import { MessageService } from 'primeng/api';
import { catchError, of, switchMap, tap, throwError } from 'rxjs';
import { ContactsService } from '../shared';
import {
  ContactsOperationFailed,
  ContactsOperationSuccess,
  CreateContact,
  DeleteContact,
  FetchContact,
  FetchContacts,
  SetContactsPagination,
  SetContactsSearch,
  SetContactsSort,
  UpdateContact,
} from './contacts.actions';

interface ContactsStateModel {
  contacts: ITableData<IContact>;
  // filters: IContactsFilters;
  search: string;
  sort: ISort | null;
  contact: IContact | null;
  loading: boolean;
  pagination: IPagination;
}

@State<ContactsStateModel>({
  name: 'contacts',
  defaults: {
    contacts: { items: [], total: 0 },
    // filters: {},
    search: '',
    sort: null,
    contact: null,
    pagination: {
      first: 0,
      rows: 20,
    },
    loading: false,
  },
})
@Injectable()
export class ContactsState {
  readonly #contactsService = inject(ContactsService);
  readonly #messageService = inject(MessageService);
  readonly #translateService = inject(TranslateService);

  // Selectors
  @Selector()
  static loading({ loading }: ContactsStateModel) {
    return loading;
  }

  @Selector()
  static contacts({ contacts }: ContactsStateModel) {
    return contacts;
  }

  @Selector()
  static contact({ contact }: ContactsStateModel) {
    return contact;
  }

  @Selector()
  static pagination({ pagination }: ContactsStateModel) {
    return pagination;
  }

  @Selector()
  static sort({ sort }: ContactsStateModel) {
    return sort;
  }

  // Actions
  @Action(FetchContacts)
  fetchContacts(ctx: StateContext<ContactsStateModel>) {
    const { pagination, search, sort } = ctx.getState();
    // console.log(search)

    if (pagination.first === undefined || pagination.rows === undefined) return;

    ctx.patchState({ loading: true });

    return this.#contactsService.fetchContacts(search, {}, pagination, sort).pipe(
      tap((contacts: ITableData<IContact>) => ctx.patchState({ contacts, loading: false })),
      catchError((error: Error) => ctx.dispatch(new ContactsOperationFailed(error))),
    );
  }

  @Action(FetchContact)
  fetchContact(ctx: StateContext<ContactsStateModel>, { id }: FetchContact) {
    ctx.patchState({ loading: true });

    return this.#contactsService.fetchContact(id).pipe(
      tap((contact: IContact) => ctx.patchState({ contact, loading: false })),
      catchError((error: Error) => ctx.dispatch(new ContactsOperationFailed(error))),
    );
  }

  @Action(CreateContact)
  createContact(ctx: StateContext<ContactsStateModel>, { contact }: CreateContact) {
    ctx.patchState({ loading: true });

    return this.#contactsService.createContact(contact).pipe(
      tap((contact: IContact) => ctx.patchState({ contact, loading: false })),
      tap(() => ctx.dispatch(new ContactsOperationSuccess('CONTACT_CREATED'))),
      catchError((error: Error) =>
        ctx
          .dispatch(new ContactsOperationFailed(error, 'CONTACT_CREATION_FAILED'))
          .pipe(switchMap(() => throwError(() => error))),
      ),
    );
  }

  @Action(UpdateContact)
  updateContact(ctx: StateContext<ContactsStateModel>, { contact }: UpdateContact) {
    ctx.patchState({ loading: true });

    return this.#contactsService.updateContact(contact).pipe(
      tap((contact: IContact) => ctx.patchState({ contact, loading: false })),
      tap(() => ctx.dispatch(new ContactsOperationSuccess('CONTACT_UPDATED'))),
      catchError((error: Error) =>
        ctx
          .dispatch(new ContactsOperationFailed(error, 'CONTACT_UPDATE_FAILED'))
          .pipe(switchMap(() => throwError(() => error))),
      ),
    );
  }

  @Action(DeleteContact)
  deleteContacts(ctx: StateContext<ContactsStateModel>, { id }: DeleteContact) {
    ctx.patchState({ loading: true });

    return this.#contactsService.deleteContact(id).pipe(
      tap(() => ctx.dispatch(new ContactsOperationSuccess('CONTACT_DELETED'))),
      catchError((error: Error) => ctx.dispatch(new ContactsOperationFailed(error, 'CONTACT_DELETE_FAILED'))),
    );
  }

  @Action(SetContactsPagination)
  setContactsPagination(ctx: StateContext<ContactsStateModel>, { pagination }: SetContactsPagination) {
    ctx.patchState({ pagination });
  }

  @Action(SetContactsSort)
  setContactsSort(ctx: StateContext<ContactsStateModel>, { sort }: SetContactsSort) {
    ctx.patchState({ sort });
  }

  @Action(SetContactsSearch)
  setContactsSearch(ctx: StateContext<ContactsStateModel>, { search }: SetContactsSearch) {
    ctx.patchState({ search });
  }

  @Action(ContactsOperationSuccess)
  onContactsOperationSuccess(ctx: StateContext<ContactsStateModel>, { message }: ContactsOperationSuccess) {
    if (message) {
      this.#messageService.add({
        severity: 'success',
        summary: this.#translateService.instant('NOTIFICATIONS.SUCCESS'),
        detail: this.#translateService.instant('CONTACTS.NOTIFICATION.' + message),
        life: 3000,
      });
    }
    ctx.dispatch(new FetchContacts());
    return ctx.patchState({ loading: false });
  }

  @Action(ContactsOperationFailed)
  onContactsOperationFailed(ctx: StateContext<ContactsStateModel>, { error, message }: ContactsOperationFailed) {
    if (message) {
      this.#messageService.add({
        severity: 'error',
        summary: this.#translateService.instant('NOTIFICATIONS.ERROR'),
        detail: this.#translateService.instant(message),
        life: 3000,
      });
    }
    ctx.patchState({ loading: false });
    return of(error);
  }
}

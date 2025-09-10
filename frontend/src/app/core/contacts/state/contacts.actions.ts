import { IContact, IPagination } from '@shared/interfaces';

export class FetchContacts {
  static readonly type = '[Contacts] Fetch Contacts';
}

export class SetContactsPagination {
  public static readonly type = '[Contacts] Set Contacts Pagination';
  constructor(public readonly pagination: IPagination) {}
}

// export class SetContactsFilters {
//   public static readonly type = '[Contacts] Set Contacts Filters';
//   constructor(public readonly filters: IContactsFilters) {}
// }

// export class SetContactsSort {
//   public static readonly type = '[Contacts] Set Contacts Sort';
//   constructor(public readonly sort: ISort) {}
// }

export class FetchContact {
  static readonly type = '[Contacts] Fetch Contact';
  constructor(public readonly id: number) {}
}

export class CreateContact {
  static readonly type = '[Contacts] Create Contact';
  constructor(public readonly contact: IContact) {}
}

export class UpdateContact {
  static readonly type = '[Contacts] Update Contact';
  constructor(public readonly contact: IContact) {}
}

export class DeleteContact {
  static readonly type = '[Contacts] Delete Contact';
  constructor(public readonly id: number) {}
}

export class ContactsOperationSuccess {
  public static readonly type = '[Contacts] ContactsOperationSuccess';
  constructor(public readonly message?: string) {}
}

export class ContactsOperationFailed {
  public static readonly type = '[Contacts] ContactsOperationFailed';
  constructor(
    public readonly error: Error,
    public readonly message?: string,
  ) {}
}

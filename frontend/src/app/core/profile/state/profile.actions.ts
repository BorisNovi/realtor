import { IUserEditable } from '@shared/interfaces';

export class FetchProfile {
  static readonly type = '[Profile] FetchProfile';
}

export class ChangePassword {
  static readonly type = '[Profile] Change Password';
  constructor(
    public oldPassword: string,
    public newPassword: string,
    public newPasswordConfirmation: string,
  ) {}
}

export class EditProfile {
  static readonly type = '[Profile] Edit';
  constructor(public options: Partial<IUserEditable>) {}
}

export class DeleteAccount {
  static readonly type = '[Profile] Delete Account';
  constructor(public password: string) {}
}

export class ProfileOperationSuccess {
  public static readonly type = '[Profile] ProfileOperationSuccess';
  constructor(
    public readonly message?: string,
    public readonly getList?: boolean,
  ) {}
}

export class ProfileOperationFailed {
  public static readonly type = '[Profile] ProfileOperationFailed';
  constructor(
    public readonly error: Error,
    public readonly message?: string,
  ) {}
}

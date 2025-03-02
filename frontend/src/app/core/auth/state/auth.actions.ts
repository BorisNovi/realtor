import { ISessionUser } from '@shared/interfaces';

// Log in
export class CheckSession {
  static readonly type = '[Auth] Check Session';
}

// Log in
export class Login {
  static readonly type = '[Auth] Login';
  constructor(
    public email: string,
    public password: string,
  ) {}
}

export class LoginSuccess {
  static readonly type = '[Auth] Login Success';
  constructor(public readonly session: ISessionUser) {}
}

export class LoginFailed {
  static readonly type = '[Auth] Login Failed';
  constructor(public readonly error: Error) {}
}

// Sign up
export class Signup {
  static readonly type = '[Auth] Signup';
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly passwordConfirmation: string,
  ) {}
}

export class SignupSuccess {
  static readonly type = '[Auth] Signup Success';
}

export class SignupFailed {
  static readonly type = '[Auth] Signup Failed';
  constructor(public readonly error: Error) {}
}

// Activate after signup
export class ActivateAfterSignup {
  public static readonly type = '[Auth] Activate After Signup';
  constructor(public readonly token: string) {}
}

export class ActivationAfterSignupSuccess {
  public static readonly type = '[Auth] Activation After Signup Success';
  constructor(public readonly session: ISessionUser) {}
}

export class ActivationAfterSignupFailed {
  public static readonly type = '[Auth] Activation After Signup Failed';
  constructor(public readonly error: Error) {}
}

// Recover
export class RecoverPassword {
  static readonly type = '[Auth] RecoverPassword';
  constructor(public readonly email: string) {}
}

export class RecoverSuccess {
  static readonly type = '[Auth] Recover Success';
}

export class RecoverFailed {
  static readonly type = '[Auth] Recover Failed';
  constructor(public readonly error: Error) {}
}

// Activate
export class ActivateAfterRecover {
  static readonly type = '[Auth] Activate After Recover';
  constructor(
    public readonly token: string,
    public readonly password: string,
  ) {}
}

export class ActivationAfterRecoverSuccess {
  static readonly type = '[Auth] Activation After Recover Success';
}

export class ActivationAfterRecoverFailed {
  static readonly type = '[Auth] Activation After Recover Failed';
  constructor(public readonly error: Error) {}
}

// Other
export class RefreshToken {
  static readonly type = '[Auth] Refresh Token';
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class RemoveUser {
  static readonly type = '[Auth] Remove User';
}

export class LoginRedirect {
  static readonly type = '[Auth] Login Redirect';
}

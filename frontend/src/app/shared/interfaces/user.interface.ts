export interface ISessionUser {
  user: IUser;
  refreshToken: string;
  token: string;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

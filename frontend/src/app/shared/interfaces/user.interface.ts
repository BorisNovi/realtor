export interface ISessionUser {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface IUser {
  id: number;
  insertedAt: string;
  bannedAt: string | null;
  name: string;
  email: string;
  role: string;
}

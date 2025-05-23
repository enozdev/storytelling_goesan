// src/lib/session.ts
import { SessionOptions } from "iron-session";

export type UserSession = {
  id: number;
  username: string;
  isAdmin: boolean;
};

export const sessionOptions: SessionOptions = {
  cookieName: "admin_session",
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

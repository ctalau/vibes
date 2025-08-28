import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  email: string;
  name?: string;
  image?: string;
  role?: "owner" | "member";
  favorites?: Favorite[];
  createdAt: Date;
}

export interface AllowedUser {
  _id?: ObjectId;
  email: string;
  role?: "owner" | "member";
}

export interface Favorite {
  appSlug: string;
  createdAt: Date;
}

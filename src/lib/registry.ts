import { ObjectId } from "mongodb";
import { getDb } from "./db";
import { allApps } from "./apps";
import type { User, Favorite } from "./schema";

export async function getOrCreateUserByEmail(email: string) {
  const db = await getDb();
  const users = db.collection<User>("users");
  const existing = await users.findOne({ email });
  if (existing) return existing;
  const newUser: User = {
    _id: new ObjectId(),
    email,
    role: "member",
    favorites: [],
    createdAt: new Date(),
  };
  await users.insertOne(newUser);
  return newUser;
}

export async function getApps(search: string, email?: string) {
  const q = search.toLowerCase();
  const list = allApps
    .filter((a) =>
      q
        ? a.name.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          a.tags?.some((t) => t.toLowerCase().includes(q))
        : true
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!email) return list.map((a) => ({ ...a, favorite: false }));

  const user = await getOrCreateUserByEmail(email);
  const favSet = new Set((user.favorites ?? []).map((f) => f.appSlug));
  const withFav = list.map((a) => ({ ...a, favorite: favSet.has(a.slug) }));
  withFav.sort((a, b) => Number(b.favorite) - Number(a.favorite));
  return withFav;
}

export async function toggleFavorite(appSlug: string, email: string) {
  const db = await getDb();
  const users = db.collection<User>("users");
  const user = await getOrCreateUserByEmail(email);
  const exists = user.favorites?.some((f) => f.appSlug === appSlug);

  if (exists) {
    await users.updateOne(
      { _id: user._id },
      { $pull: { favorites: { appSlug } } },
    );
  } else {
    const fav: Favorite = { appSlug, createdAt: new Date() };
    await users.updateOne(
      { _id: user._id },
      { $push: { favorites: fav } },
    );
  }
}

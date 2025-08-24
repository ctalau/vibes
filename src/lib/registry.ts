import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { favorites, users } from "./schema";
import { allApps } from "./apps";

export async function getOrCreateUserByEmail(email: string) {
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) return existing;
  const [inserted] = await db
    .insert(users)
    .values({ email })
    .returning();
  return inserted;
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
  const favRows = await db
    .select({ appSlug: favorites.appSlug })
    .from(favorites)
    .where(eq(favorites.userId, user.id));
  const favSet = new Set(favRows.map((f) => f.appSlug));
  const withFav = list.map((a) => ({ ...a, favorite: favSet.has(a.slug) }));
  withFav.sort((a, b) => Number(b.favorite) - Number(a.favorite));
  return withFav;
}

export async function toggleFavorite(appSlug: string, email: string) {
  const user = await getOrCreateUserByEmail(email);
  const [existing] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.appSlug, appSlug)));

  if (existing) {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.appSlug, appSlug)));
  } else {
    await db.insert(favorites).values({ userId: user.id, appSlug });
  }
}

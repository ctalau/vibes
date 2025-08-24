"use server";

import { auth } from "../lib/auth";
import { toggleFavorite } from "../lib/registry";

export async function toggleFavoriteAction(formData: FormData) {
  const slug = formData.get("slug") as string;
  const session = await auth();
  const email = session?.user?.email;
  if (!slug || !email) return;
  await toggleFavorite(slug, email);
}

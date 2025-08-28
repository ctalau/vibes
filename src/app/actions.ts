"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../lib/auth";
import { toggleFavorite } from "../lib/registry";

export async function toggleFavoriteAction(formData: FormData) {
  const slug = formData.get("slug") as string;
  const search = formData.get("q") as string | null;
  const session = await auth();
  const email = session?.user?.email;
  if (!slug || !email) return;
  await toggleFavorite(slug, email);
  revalidatePath("/");
  redirect(search ? `/?q=${search}` : "/");
}

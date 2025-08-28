import { auth } from "../lib/auth";
import { getApps } from "../lib/registry";
import {
  AppShell,
  Input,
  Card,
  CardHeader,
  CardContent,
} from "../ui";
import { toggleFavoriteAction } from "./actions";

interface HomeProps {
  searchParams: { q?: string };
}

export default async function Home({ searchParams }: HomeProps) {
  const session = await auth();
  const email = session?.user?.email;
  const q = searchParams.q ?? "";
  const apps = await getApps(q, email || undefined);

  return (
    <AppShell>
      <form method="GET" className="mb-4">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search apps..."
          aria-label="Search apps"
        />
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <Card key={app.slug}>
            <CardHeader className="flex items-center justify-between">
              <span className="font-medium">{app.name}</span>
              {email && (
                <form action={toggleFavoriteAction}>
                  <input type="hidden" name="slug" value={app.slug} />
                  <input type="hidden" name="q" value={q} />
                  <button
                    type="submit"
                    aria-label={
                      app.favorite ? "Remove from favorites" : "Add to favorites"
                    }
                    className="text-xl"
                  >
                    {app.favorite ? "★" : "☆"}
                  </button>
                </form>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{app.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

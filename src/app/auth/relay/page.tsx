import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";

export default async function Relay({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const session = await auth();
  const token = (session as any)?.jwt;
  const from = searchParams.from;
  if (from && token) {
    const url = new URL(from);
    url.searchParams.set("token", token);
    redirect(url.href);
  }
  return (
    <html>
      <body>
        <main>
          <h1>Auth Relay</h1>
          <p>
            <strong>from:</strong> {from ?? "(missing)"}
          </p>
          <p>
            <strong>token:</strong> {token ?? "(missing)"}
          </p>
        </main>
      </body>
    </html>
  );
}


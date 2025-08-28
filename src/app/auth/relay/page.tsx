import { auth } from "../../../lib/auth";

export default async function Relay({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const session = await auth();
  const token = (session as any)?.jwt;
  const from = searchParams.from;
  const script = `const from = ${JSON.stringify(
    from || ""
  )}; const token = ${JSON.stringify(
    token || ""
  )}; if (from && token) { window.location.replace(from + '#token=' + token); }`;
  return (
    <html>
      <body>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </body>
    </html>
  );
}


import { auth } from "../../../lib/auth";

export default async function Relay({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const session = await auth();
  const token = (session as any)?.jwt;
  const from = searchParams.from;
  const redirectUrl = from && token ? `${from}#token=${token}` : undefined;
  const script = `const from = ${JSON.stringify(
    from || "",
  )}; const token = ${JSON.stringify(
    token || "",
  )}; const redirectUrl = from && token ? from + '#token=' + token : null; document.getElementById('redirect-btn')?.addEventListener('click', function () { if (redirectUrl) { window.location.replace(redirectUrl); } });`;
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
          <p>
            <strong>redirect:</strong> {redirectUrl ?? "(none)"}
          </p>
          <button id="redirect-btn" disabled={!redirectUrl}>
            Continue
          </button>
        </main>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </body>
    </html>
  );
}


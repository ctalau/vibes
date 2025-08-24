import * as React from "react";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-2">
        <h1 className="text-xl font-semibold">Vibes</h1>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}

export default AppShell;

'use client';

import { AuthProvider } from '@descope/nextjs-sdk';
import type { ReactNode } from 'react';

/** Loaded only in auth-related areas so public marketing pages stay lightweight. */
export function DescopeProvider({
  projectId,
  baseUrl,
  children,
}: {
  projectId: string | undefined;
  baseUrl?: string;
  children: ReactNode;
}) {
  if (!projectId) return <>{children}</>;
  return (
    <AuthProvider
      projectId={projectId}
      baseUrl={baseUrl}
      sessionTokenViaCookie={{ sameSite: 'Lax', secure: true }}
    >
      {children}
    </AuthProvider>
  );
}

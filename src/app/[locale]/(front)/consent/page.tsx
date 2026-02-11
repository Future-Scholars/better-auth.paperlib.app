import { Locale } from "@/lib/i18n";
import { ConsentForm } from "./consent-form";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";
import { auth, getScopeDescription } from "@/lib/auth";
import Logo from "@/components/logo";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

interface ConsentPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    consent_code?: string;
    client_id?: string;
    scope?: string;
  }>;
}


export default async function ConsentPage({ params, searchParams }: ConsentPageProps) {
  const { locale } = await params;
  const { client_id, scope } = await searchParams;
  const dict = await getDictionary(locale);
  if (!client_id || !scope) {
    return notFound();
  }

  const client = await auth.api.getOAuthClientPublic({
    query: {
      client_id: client_id,
    },
    headers: await headers()
  });

  // Parse scopes from the scope parameter
  const scopes = scope ? scope.split(' ') : [];

  const scopeDescriptions = await Promise.all(scopes.map(async (scope) => {
    const scopeDescription = await getScopeDescription(scope, locale);
    if (scopeDescription) {
      return {
        name: scopeDescription.name,
        displayName: scopeDescription.displayName,
        description: scopeDescription.description,
      };
    } else {
      return {
        name: scope,
        displayName: scope,
        description: dict.pages.consent.scopeDescriptions[scope as keyof typeof dict.pages.consent.scopeDescriptions] || scope,
      };
    }
  }));

  const scopeDescriptionsObject: Record<string, { displayName: string; description: string }> = {};
  for (const scope of scopes) {
    const scopeDescription = scopeDescriptions.find((scopeDescription) => scopeDescription.name === scope);
    if (scopeDescription) {
      scopeDescriptionsObject[scope] = scopeDescription;
    } else {
      scopeDescriptionsObject[scope] = {
        displayName: scope,
        description: dict.pages.consent.scopeDescriptions[scope as keyof typeof dict.pages.consent.scopeDescriptions] || scope,
      };
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 relative">

      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center justify-center">
          <Link href={`/${locale}`} className="flex items-center gap-2 font-medium">
            <Logo className="flex items-center gap-2 font-medium" />
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <ConsentForm
            clientName={client.client_name ?? "The Application"}
            scopes={scopes}
            scopeDescriptions={scopeDescriptionsObject}
            dict={dict.pages.consent}
          />
        </div>
      </div>
    </div>
  );
}

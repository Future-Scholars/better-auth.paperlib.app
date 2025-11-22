import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Logo from "@/components/logo";

interface ForgotPasswordProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ForgotPassword({ params }: ForgotPasswordProps) {
  const { locale } = await params;
  const appUrl = process.env.BETTER_AUTH_URL;
  const dict = await getDictionary(locale);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    redirect(`/${locale}/account`);
  }
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex items-center justify-center">
        <Link href={`/${locale}`} >
          <Logo className="flex items-center flex-col gap-2 font-medium" />
        </Link>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{dict.pages.forgotPassword.title}</CardTitle>
            <CardDescription>
              {dict.pages.forgotPassword.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm locale={locale} redirectTo={`${appUrl}/${locale}/password-reset`} />
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          {dict.common.needHelp} <a href="#">{dict.common.gettingStartedGuide}</a> {dict.common.and} {dict.common.supportTeam}.
        </FieldDescription>
      </div>
    </div>
  );
}


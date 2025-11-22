import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Card, CardContent } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { Locale } from "@/lib/i18n";
import { ResetPasswordForm } from "./reset-password-form";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";
import Logo from "@/components/logo";

interface PasswordResetProps {
    params: Promise<{ locale: Locale }>;
    searchParams: Promise<{ token?: string }>;
}

export default async function PasswordReset({ params, searchParams }: PasswordResetProps) {
    const { locale } = await params;
    const { token } = await searchParams;
    const dict = await getDictionary(locale);
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
                <CardTitle className="text-xl">{dict.pages.resetPassword.title}</CardTitle>
                <CardDescription>
                  {dict.pages.resetPassword.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResetPasswordForm locale={locale} token={token} />
              </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
              {dict.common.needHelp} <a href="#">{dict.common.gettingStartedGuide}</a> {dict.common.and} {dict.common.supportTeam}.
            </FieldDescription>
          </div>
        </div>
      );
}
'use client';
import { Locale } from "@/lib/i18n";
import { FieldGroup, FieldDescription } from "@/components/ui/field";
import { Field } from "@/components/ui/field";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, CheckCircle, ArrowLeft } from "lucide-react";


export function ForgotPasswordForm({ locale, redirectTo }: { locale: Locale, redirectTo: string }) {
    const { t } = useTranslation(locale);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <form onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            const formData = new FormData(e.target as HTMLFormElement);
            const email = formData.get('email') as string;
            const { data, error } = await authClient.requestPasswordReset({
                email,
                redirectTo,
            });
            
            setLoading(false);
            
            if (error) {
                switch (error.code) {
                    default:
                        setError(
                            <Alert variant="destructive">
                                <CircleAlert />
                                <AlertTitle>{t('common.errorTitle')}</AlertTitle>
                                <AlertDescription>{error.message || t('common.anErrorOccurred')}</AlertDescription>
                            </Alert>
                        );
                }
            } else {
                setSuccess(true);
            }
        }}>
            <FieldGroup>
                {error && (
                    <Field>
                        {error}
                    </Field>
                )}
                {success ? (
                    <>
                        <Field>
                            <Alert variant="default">
                                <CheckCircle />
                                <AlertTitle>{t('pages.forgotPassword.successTitle')}</AlertTitle>
                                <AlertDescription>
                                    {t('pages.forgotPassword.successMessage')}
                                </AlertDescription>
                            </Alert>
                        </Field>
                        <Field>
                            <FieldDescription className="text-center">
                                <Link href={`/${locale}/login`} className="flex items-center justify-center gap-2 text-sm underline-offset-4 hover:underline">
                                    <ArrowLeft className="size-4" />
                                    {t('pages.forgotPassword.backToLogin')}
                                </Link>
                            </FieldDescription>
                        </Field>
                    </>
                ) : (
                    <>
                        <Field>
                            <FieldLabel htmlFor="email">{t('pages.forgotPassword.emailLabel')}</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder={t('pages.forgotPassword.emailPlaceholder')}
                                required
                                disabled={loading}
                            />
                        </Field>
                        <Field>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? t('pages.forgotPassword.sending') : t('pages.forgotPassword.submitButton')}
                            </Button>
                            <FieldDescription className="text-center">
                                <Link href={`/${locale}/login`} className="flex items-center justify-center gap-2 text-sm underline-offset-4 hover:underline">
                                    <ArrowLeft className="size-4" />
                                    {t('pages.forgotPassword.backToLogin')}
                                </Link>
                            </FieldDescription>
                        </Field>
                    </>
                )}
            </FieldGroup>
        </form>
    )
}


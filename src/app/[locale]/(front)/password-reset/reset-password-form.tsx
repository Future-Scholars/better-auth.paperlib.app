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
import { useRouter } from "next/navigation";


export function ResetPasswordForm({ locale, token }: { locale: Locale, token?: string }) {
    const { t } = useTranslation(locale);
    const router = useRouter();
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!token) {
        return (
            <FieldGroup>
                <Field>
                    <Alert variant="destructive">
                        <CircleAlert />
                        <AlertTitle>{t('common.errorTitle')}</AlertTitle>
                        <AlertDescription>
                            {t('pages.resetPassword.invalidToken')}
                        </AlertDescription>
                    </Alert>
                </Field>
                <Field>
                    <FieldDescription className="text-center">
                        <Link href={`/${locale}/login`} className="flex items-center justify-center gap-2 text-sm underline-offset-4 hover:underline">
                            <ArrowLeft className="size-4" />
                            {t('pages.resetPassword.backToLogin')}
                        </Link>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        );
    }

    return (
        <form onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            const formData = new FormData(e.target as HTMLFormElement);
            const newPassword = formData.get('newPassword') as string;
            const confirmPassword = formData.get('confirmPassword') as string;
            
            if (newPassword !== confirmPassword) {
                setError(
                    <Alert variant="destructive">
                        <CircleAlert />
                        <AlertTitle>{t('common.errorTitle')}</AlertTitle>
                        <AlertDescription>{t('pages.resetPassword.passwordsDoNotMatch')}</AlertDescription>
                    </Alert>
                );
                setLoading(false);
                return;
            }

            const { error } = await authClient.resetPassword({
                newPassword,
                token,
            });
            
            setLoading(false);
            
            if (error) {
                switch (error.code) {
                    case "INVALID_TOKEN":
                    case "TOKEN_EXPIRED":
                        setError(
                            <Alert variant="destructive">
                                <CircleAlert />
                                <AlertTitle>{t('common.errorTitle')}</AlertTitle>
                                <AlertDescription>{t('pages.resetPassword.invalidToken')}</AlertDescription>
                            </Alert>
                        );
                        break;
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
                                <AlertTitle>{t('pages.resetPassword.successTitle')}</AlertTitle>
                                <AlertDescription>
                                    {t('pages.resetPassword.successMessage')}
                                </AlertDescription>
                            </Alert>
                        </Field>
                        <Field>
                            <Button 
                                type="button" 
                                className="w-full"
                                onClick={() => {
                                    router.push(`/${locale}/login`);
                                }}
                            >
                                {t('pages.resetPassword.loginNow')}
                            </Button>
                            <FieldDescription className="text-center">
                                <Link href={`/${locale}/login`} className="flex items-center justify-center gap-2 text-sm underline-offset-4 hover:underline">
                                    <ArrowLeft className="size-4" />
                                    {t('pages.resetPassword.backToLogin')}
                                </Link>
                            </FieldDescription>
                        </Field>
                    </>
                ) : (
                    <>
                        <Field>
                            <FieldLabel htmlFor="newPassword">{t('pages.resetPassword.newPasswordLabel')}</FieldLabel>
                            <Input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                placeholder={t('pages.resetPassword.newPasswordPlaceholder')}
                                required
                                disabled={loading}
                                minLength={8}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="confirmPassword">{t('pages.resetPassword.confirmPasswordLabel')}</FieldLabel>
                            <Input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder={t('pages.resetPassword.confirmPasswordPlaceholder')}
                                required
                                disabled={loading}
                                minLength={8}
                            />
                        </Field>
                        <Field>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? t('pages.resetPassword.resetting') : t('pages.resetPassword.submitButton')}
                            </Button>
                            <FieldDescription className="text-center">
                                <Link href={`/${locale}/login`} className="flex items-center justify-center gap-2 text-sm underline-offset-4 hover:underline">
                                    <ArrowLeft className="size-4" />
                                    {t('pages.resetPassword.backToLogin')}
                                </Link>
                            </FieldDescription>
                        </Field>
                    </>
                )}
            </FieldGroup>
        </form>
    )
}


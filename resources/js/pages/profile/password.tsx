import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, KeyRoundIcon, LockIcon, SaveIcon } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { TwibbonFooter } from '@/components/twibbon-footer';
import { TwibbonNavbar } from '@/components/twibbon-navbar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type SharedProps = {
    flash?: {
        success?: string | null;
    };
};

type PasswordForm = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

export default function MyProfilePassword() {
    const { flash } = usePage<SharedProps>().props;
    const { data, setData, put, processing, errors, reset } =
        useForm<PasswordForm>({
            current_password: '',
            password: '',
            password_confirmation: '',
        });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put('/my-profile/password', {
            preserveScroll: true,
            onSuccess: () => {
                reset('current_password', 'password', 'password_confirmation');
            },
        });
    };

    return (
        <>
            <Head title="Ganti Password" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_8%_18%,#ffdbaa_0%,transparent_32%),radial-gradient(circle_at_92%_10%,#c9f4ff_0%,transparent_36%),linear-gradient(180deg,#fffaf0_0%,#edf6ff_100%)] px-4 py-6 md:px-8 md:py-10">
                <div className="mx-auto max-w-375 space-y-8">
                    <TwibbonNavbar />

                    <Button asChild variant="outline" size="sm" className="w-fit">
                        <Link href="/my-profile">
                            <ArrowLeftIcon className="size-4" />
                            Kembali ke Profil Saya
                        </Link>
                    </Button>

                    <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-sm">
                        <CardHeader className="space-y-2">
                            <CardTitle className="inline-flex items-center gap-2 text-2xl text-slate-900 md:text-3xl">
                                <KeyRoundIcon className="size-5" />
                                Ganti Password
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-600 md:text-base">
                                Gunakan password yang panjang dan unik agar akun
                                kreator tetap aman.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        Password Saat Ini
                                    </Label>
                                    <PasswordInput
                                        id="current_password"
                                        value={data.current_password}
                                        onChange={(event) =>
                                            setData(
                                                'current_password',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="current-password"
                                        placeholder="Masukkan password saat ini"
                                    />
                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        Password Baru
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        value={data.password}
                                        onChange={(event) =>
                                            setData('password', event.target.value)
                                        }
                                        autoComplete="new-password"
                                        placeholder="Masukkan password baru"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi Password Baru
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(event) =>
                                            setData(
                                                'password_confirmation',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                        placeholder="Ulangi password baru"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                    <p className="inline-flex items-center gap-2 font-medium text-slate-800">
                                        <LockIcon className="size-4" />
                                        Tips password aman
                                    </p>
                                    <p className="mt-1">
                                        Kombinasikan huruf besar, huruf kecil,
                                        angka, dan simbol. Hindari memakai nama
                                        acara atau tanggal lahir.
                                    </p>
                                </div>

                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <Spinner className="size-4" />
                                    ) : (
                                        <SaveIcon className="size-4" />
                                    )}
                                    Simpan Password Baru
                                </Button>
                            </form>

                            {flash?.success && (
                                <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                    {flash.success}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <TwibbonFooter />
            </div>
        </>
    );
}

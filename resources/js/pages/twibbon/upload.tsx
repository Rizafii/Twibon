import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, UploadIcon } from 'lucide-react';
import { useRef } from 'react';
import type { FormEvent } from 'react';
import { TwibbonFooter } from '@/components/twibbon-footer';
import { TwibbonNavbar } from '@/components/twibbon-navbar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type SharedProps = {
    flash?: {
        success?: string | null;
    };
};

type UploadForm = {
    name: string;
    description: string;
    frame: File | null;
};

export default function TwibbonUpload() {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const { flash } = usePage<SharedProps>().props;
    const { data, setData, post, processing, errors, reset } =
        useForm<UploadForm>({
            name: '',
            description: '',
            frame: null,
        });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/upload', {
            forceFormData: true,
            onSuccess: () => {
                reset();

                if (fileRef.current) {
                    fileRef.current.value = '';
                }
            },
        });
    };

    return (
        <>
            <Head title="Upload Twibbon" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_20%_15%,#dcfce7_0%,transparent_40%),radial-gradient(circle_at_85%_20%,#ffe4cc_0%,transparent_35%),linear-gradient(180deg,#fffdfa_0%,#f5f8ff_100%)] px-4 py-8 md:px-8 md:py-12">
                <div className="mx-auto max-w-357 space-y-6">
                    <TwibbonNavbar />

                    <div className="max-w-3xl space-y-6">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/catalog">
                                <ArrowLeftIcon className="size-4" />
                                Kembali ke katalog
                            </Link>
                        </Button>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    Upload Twibbon Baru
                                </CardTitle>
                                <CardDescription>
                                    Kirim desain twibbon dalam format PNG. Setelah
                                    submit, status akan menunggu approval admin.
                                    Rasio wajib 3:4.
                                </CardDescription>
                            </CardHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData('name', event.target.value)
                                            }
                                            placeholder="Contoh: Hari Kemerdekaan 2026"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Input
                                            id="description"
                                            value={data.description}
                                            onChange={(event) =>
                                                setData(
                                                    'description',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Tuliskan tujuan kampanye atau event"
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="frame">
                                            Upload PNG Frame (Rasio 3:4)
                                        </Label>
                                        <Input
                                            id="frame"
                                            ref={fileRef}
                                            type="file"
                                            accept="image/png"
                                            onChange={(event) =>
                                                setData(
                                                    'frame',
                                                    event.target.files?.[0] ?? null,
                                                )
                                            }
                                        />
                                        <p className="text-xs text-slate-500">
                                            Contoh ukuran valid: 1080x1440, 900x1200,
                                            1500x2000.
                                        </p>
                                        {errors.frame && (
                                            <p className="text-sm text-red-600">
                                                {errors.frame}
                                            </p>
                                        )}
                                    </div>

                                    {flash?.success && (
                                        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                            {flash.success}
                                        </p>
                                    )}
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner className="size-4" />
                                        ) : (
                                            <UploadIcon className="size-4" />
                                        )}
                                        Submit Twibbon
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                </div>

                <TwibbonFooter/>
            </div>
        </>
    );
}

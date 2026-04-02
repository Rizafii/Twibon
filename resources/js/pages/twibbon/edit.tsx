import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, PencilLineIcon } from 'lucide-react';
import type { FormEvent } from 'react';
import { TwibbonFooter } from '@/components/twibbon-footer';
import { TwibbonNavbar } from '@/components/twibbon-navbar';
import { Badge } from '@/components/ui/badge';
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

type Props = {
    twibbon: {
        id: number;
        name: string;
        description: string;
        slug: string;
        preview_url: string;
        is_approved: boolean;
    };
};

type EditForm = {
    name: string;
    description: string;
};

export default function TwibbonEdit({ twibbon }: Props) {
    const { data, setData, patch, processing, errors } = useForm<EditForm>({
        name: twibbon.name,
        description: twibbon.description,
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        patch(`/my-twibbon/${twibbon.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Edit - ${twibbon.name}`} />

            <div className="min-h-screen bg-[radial-gradient(circle_at_15%_12%,#fef3c7_0%,transparent_34%),radial-gradient(circle_at_85%_8%,#dbeafe_0%,transparent_38%),linear-gradient(180deg,#fffef8_0%,#eef5ff_100%)] px-4 py-6 md:px-8 md:py-10">
                <div className="mx-auto max-w-375 space-y-6">
                    <TwibbonNavbar />

                    <Button asChild variant="outline" size="sm" className="w-fit">
                        <Link href="/my-twibbon">
                            <ArrowLeftIcon className="size-4" />
                            Kembali ke Twibbon Saya
                        </Link>
                    </Button>

                    <Card className="overflow-hidden border-slate-200/80 bg-white/90 py-0 shadow-sm">
                        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                            <div className="border-b bg-slate-50 p-4 lg:border-r lg:border-b-0 lg:p-6">
                                <div className="aspect-3/4 overflow-hidden rounded-xl border bg-white">
                                    <img
                                        src={twibbon.preview_url}
                                        alt={twibbon.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    {twibbon.is_approved ? (
                                        <Badge>Approved</Badge>
                                    ) : (
                                        <Badge variant="secondary">Pending</Badge>
                                    )}
                                    <span className="text-xs text-slate-500">
                                        /twibbon/{twibbon.slug}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 md:p-7">
                                <CardHeader className="px-0 pb-4">
                                    <CardTitle className="inline-flex items-center gap-2 text-2xl">
                                        <PencilLineIcon className="size-5" />
                                        Edit Twibbon
                                    </CardTitle>
                                    <CardDescription>
                                        Ubah nama dan deskripsi twibbon milikmu.
                                    </CardDescription>
                                </CardHeader>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <CardContent className="space-y-4 px-0">
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
                                                    setData('description', event.target.value)
                                                }
                                                placeholder="Tuliskan tujuan kampanye atau event"
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-red-600">
                                                    {errors.description}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="px-0 pt-1 pb-0">
                                        <div className="flex w-full flex-wrap justify-end gap-2">
                                            <Button asChild variant="outline">
                                                <Link href="/my-twibbon">Batal</Link>
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {processing ? (
                                                    <Spinner className="size-4" />
                                                ) : (
                                                    <PencilLineIcon className="size-4" />
                                                )}
                                                Simpan Perubahan
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </form>
                            </div>
                        </div>
                    </Card>
                </div>

                <TwibbonFooter />
            </div>
        </>
    );
}

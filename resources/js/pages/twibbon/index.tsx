import { Head, Link, useForm } from '@inertiajs/react';
import { SearchIcon, SparklesIcon, User } from 'lucide-react';
import type { FormEvent } from 'react';
import { TwibbonFooter } from '@/components/twibbon-footer';
import { TwibbonNavbar } from '@/components/twibbon-navbar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

type TwibbonItem = {
    id: number;
    name: string;
    description: string;
    created_at?: string | null;
    slug: string;
    preview_url: string;
    creator_name: string;
    uses_count: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    total: number;
};

type Props = {
    canRegister: boolean;
    filters: {
        search: string;
    };
    twibbons: Paginated<TwibbonItem>;
};

const sanitizePaginationLabel = (label: string): string =>
    label
        .replaceAll('&laquo;', '«')
        .replaceAll('&raquo;', '»')
        .replace(/<[^>]+>/g, '')
        .trim();

const getInitials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

const formatCreatedAt = (value?: string | null): string => {
    if (!value) {
        return 'Tanggal tidak tersedia';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Tanggal tidak tersedia';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export default function TwibbonIndex({
    canRegister,
    filters,
    twibbons,
}: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search,
    });

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        get('/catalog', {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Full Katalog Twibbon" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#fff4cc_0%,transparent_35%),radial-gradient(circle_at_90%_10%,#d9fbff_0%,transparent_42%),linear-gradient(180deg,#fffefa_0%,#f6f9ff_100%)] px-4 py-6 md:px-8 md:py-10">
                <div className="mx-auto max-w-375">
                    <TwibbonNavbar canRegister={canRegister} />

                    <section className="mb-8 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm md:p-10">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div className="space-y-2">
                                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <SparklesIcon className="size-4" />
                                    Buat foto profil kampanye dalam hitungan detik
                                </p>
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                                    Full Katalog Twibbon
                                </h1>
                                <p className="max-w-2xl text-sm text-slate-600 md:text-base">
                                    Jelajahi koleksi twibbon yang sudah di-approve,
                                    pilih desain favorit, lalu gabungkan dengan
                                    fotomu di editor.
                                </p>
                            </div>

                            <Badge variant="secondary" className="w-fit">
                                {twibbons.total} template tersedia
                            </Badge>
                        </div>

                        <form
                            onSubmit={handleSearch}
                            className="mt-6 flex flex-col gap-3 md:flex-row"
                        >
                            <Input
                                value={data.search}
                                onChange={(event) =>
                                    setData('search', event.target.value)
                                }
                                placeholder="Cari nama atau deskripsi twibbon..."
                                className="h-11 md:flex-1"
                            />
                            <Button type="submit" className="h-11 px-5">
                                {processing ? <Spinner className="size-4" /> : <SearchIcon className="size-4" />}
                                Search
                            </Button>
                        </form>
                    </section>

                    {twibbons.data.length === 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Belum ada twibbon ditemukan</CardTitle>
                                <CardDescription>
                                    Coba kata kunci lain atau upload twibbon baru.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm md:p-10">
                            {twibbons.data.map((twibbon) => (
                                <Link
                                    key={twibbon.id}
                                    href={`/twibbon/${twibbon.slug}`}
                                    className="block"
                                >
                                    <Card className="overflow-hidden bg-white/95 py-0 shadow-none transition-shadow hover:shadow-md">
                                        <div className="relative h-56 bg-slate-100">
                                            <img
                                                src={twibbon.preview_url}
                                                alt={twibbon.name}
                                                loading="lazy"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <CardHeader className="space-y-2 px-4">
                                            <CardTitle className="min-h-10 text-base leading-5 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                                                {twibbon.name}
                                            </CardTitle>
                                            <CardDescription className="min-h-8 text-xs leading-4 text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                                                {twibbon.description && twibbon.description.trim() !== ''
                                                    ? twibbon.description
                                                    : 'Twibbon ini belum memiliki deskripsi.'}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className=" px-4 pb-4 pt-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                                    <Avatar className="h-7 w-7 overflow-hidden rounded-full">
                                                        <AvatarFallback className="bg-neutral-200 text-xs text-black">
                                                            {getInitials(twibbon.creator_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 leading-tight">
                                                        <p className="truncate text-[11px] font-medium text-slate-800">
                                                            {twibbon.creator_name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500">
                                                            Dibuat pada {formatCreatedAt(twibbon.created_at)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-xs flex items-center gap-1">
                                                    <User size={12} />
                                                    {twibbon.uses_count}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 flex flex-wrap items-center gap-2">
                        {twibbons.links.map((link) => (
                            <Button
                                key={`${link.label}-${link.url ?? 'null'}`}
                                asChild={link.url !== null}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={link.url === null}
                            >
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        preserveState
                                        preserveScroll
                                    >
                                        {sanitizePaginationLabel(link.label)}
                                    </Link>
                                ) : (
                                    <span>{sanitizePaginationLabel(link.label)}</span>
                                )}
                            </Button>
                        ))}
                    </div>
                </div>

                <TwibbonFooter />
            </div>
        </>
    );
}

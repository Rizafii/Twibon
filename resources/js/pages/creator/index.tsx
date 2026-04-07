import { Head, Link, useForm } from '@inertiajs/react';
import { SearchIcon, SparklesIcon, UserIcon } from 'lucide-react';
import type { FormEvent } from 'react';
import { TwibbonFooter } from '@/components/twibbon-footer';
import { TwibbonNavbar } from '@/components/twibbon-navbar';
import { VerifiedUserName } from '@/components/verified-user-name';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

type CreatorItem = {
    id: number;
    username: string;
    name: string;
    bio?: string | null;
    verified: boolean;
    profile_photo_url?: string | null;
    twibbon_count: number;
    featured_twibbon_slug?: string | null;
    featured_twibbon_preview_url?: string | null;
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
    creators: Paginated<CreatorItem>;
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

export default function CreatorIndex({ canRegister, filters, creators }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search,
    });

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        get('/creators', {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Cari Kreator Twibbon" />

            <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
                <div className="mx-auto max-w-375">
                    <TwibbonNavbar canRegister={canRegister} />

                    <section className="mb-8 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm md:p-10">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div className="space-y-2">
                                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <SparklesIcon className="size-4" />
                                    Temukan kreator aktif dengan koleksi twibbon terbaik
                                </p>
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                                    Cari Kreator
                                </h1>
                                <p className="max-w-2xl text-sm text-slate-600 md:text-base">
                                    Jelajahi kreator yang sudah punya twibbon tayang,
                                    cek profilnya, lalu pilih desain dari koleksi mereka.
                                </p>
                            </div>

                            <Badge variant="secondary" className="w-fit">
                                {creators.total} kreator aktif
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
                                placeholder="Cari nama, username, atau bio kreator..."
                                className="h-11 md:flex-1"
                            />
                            <Button type="submit" className="h-11 px-5">
                                {processing ? <Spinner className="size-4" /> : <SearchIcon className="size-4" />}
                                Search
                            </Button>
                        </form>
                    </section>

                    {creators.data.length === 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Kreator tidak ditemukan</CardTitle>
                                <CardDescription>
                                    Coba kata kunci lain untuk mencari kreator yang memiliki twibbon.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <div className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4 md:p-10">
                            {creators.data.map((creator) => (
                                <Link
                                    key={creator.id}
                                    href={`/creator/${creator.username}`}
                                    className="block"
                                >
                                    <Card className="overflow-hidden bg-white/95 py-0 shadow-none transition-shadow hover:shadow-md">
                                        <div className="relative h-44 bg-slate-100">
                                            {creator.featured_twibbon_preview_url ? (
                                                <img
                                                    src={creator.featured_twibbon_preview_url}
                                                    alt={`Preview twibbon ${creator.name}`}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-[linear-gradient(135deg,#dbeafe_0%,#fef3c7_55%,#dcfce7_100%)]" />
                                            )}

                                            <div className="absolute right-2 top-2">
                                                <Badge variant="secondary">
                                                    {creator.twibbon_count} twibbon
                                                </Badge>
                                            </div>
                                        </div>

                                        <CardHeader className="space-y-2 px-4">
                                            <CardTitle className="min-h-10 text-base leading-5 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                                                <VerifiedUserName
                                                    name={creator.name}
                                                    verified={creator.verified}
                                                    iconClassName="size-3.5"
                                                />
                                            </CardTitle>
                                            <CardDescription className="text-xs text-slate-500">
                                                @{creator.username}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="px-4 pb-4 pt-0">
                                            <div className="flex items-start gap-2">
                                                <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                                                    <AvatarImage
                                                        src={creator.profile_photo_url ?? undefined}
                                                        alt={creator.name}
                                                    />
                                                    <AvatarFallback className="bg-neutral-200 text-xs text-black">
                                                        {getInitials(creator.name)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="min-w-0 flex-1 leading-tight">
                                                    <p className="text-xs text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                                                        {creator.bio && creator.bio.trim() !== ''
                                                            ? creator.bio
                                                            : 'Kreator ini belum menambahkan bio.'}
                                                    </p>

                                                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                                                        <UserIcon className="size-3.5" />
                                                        {creator.twibbon_count} twibbon publik
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 flex flex-wrap items-center gap-2">
                        {creators.links.map((link) => (
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
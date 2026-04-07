import { Head, Link } from '@inertiajs/react';
import {
    CalendarDaysIcon,
    FlameIcon,
    SlidersHorizontal,
    UserIcon,
} from 'lucide-react';
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

type Creator = {
    id: number;
    username: string;
    name: string;
    bio?: string | null;
    verified: boolean;
    profile_photo_url?: string | null;
    banner_photo_url?: string | null;
    joined_at: string | null;
    stats: {
        total_twibbons: number;
        total_uses: number;
    };
};

type CreatorTwibbon = {
    id: number;
    name: string;
    description: string;
    slug: string;
    custom_url?: string | null;
    public_path: string;
    public_display_url: string;
    preview_url: string;
    created_at: string | null;
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
        sort: 'latest' | 'popular';
    };
    creator: Creator;
    twibbons: Paginated<CreatorTwibbon>;
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

const formatDate = (value: string | null): string => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export default function CreatorShow({
    canRegister,
    filters,
    creator,
    twibbons,
}: Props) {
    return (
        <>
            <Head title={`Kreator - ${creator.name}`} />

            <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
                <div className="mx-auto max-w-375 space-y-8">
                    <TwibbonNavbar canRegister={canRegister} />

                    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm">
                        {creator.banner_photo_url ? (
                            <img
                                src={creator.banner_photo_url}
                                alt={`Banner ${creator.name}`}
                                className="h-32 w-full object-cover md:h-44"
                            />
                        ) : (
                            <div className="h-32 w-full bg-[linear-gradient(135deg,#dbeafe_0%,#fef3c7_55%,#dcfce7_100%)] md:h-44" />
                        )}

                        <div className="space-y-5 p-5 md:p-7">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16 overflow-hidden rounded-full border border-white shadow-sm md:h-20 md:w-20">
                                        <AvatarImage
                                            src={
                                                creator.profile_photo_url ??
                                                undefined
                                            }
                                            alt={creator.name}
                                        />
                                        <AvatarFallback className="bg-neutral-200 text-black">
                                            {getInitials(creator.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="space-y-1">
                                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                                            <VerifiedUserName
                                                name={creator.name}
                                                verified={creator.verified}
                                            />
                                        </h1>
                                        <p className="text-sm text-slate-600">
                                            Kreator Twibbon
                                        </p>
                                    </div>
                                </div>

                                <Badge variant="outline" className="w-fit">
                                    Bergabung {formatDate(creator.joined_at)}
                                </Badge>
                            </div>

                            <p className="text-sm text-slate-600 md:text-base">
                                {creator.bio && creator.bio.trim() !== ''
                                    ? creator.bio
                                    : 'Kreator ini belum menambahkan bio.'}
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500">
                                        Total Twibbon
                                    </p>
                                    <p className="text-xl font-semibold text-slate-900">
                                        {creator.stats.total_twibbons}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500">
                                        Total Penggunaan
                                    </p>
                                    <p className="text-xl font-semibold text-slate-900">
                                        {creator.stats.total_uses}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm md:p-7">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-900">
                                    Koleksi Twibbon
                                </h2>
                                <p className="text-sm text-slate-600">
                                    {twibbons.total} twibbon publik dari kreator
                                    ini.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <SlidersHorizontal className="size-4 text-slate-500" />
                                <Button
                                    asChild
                                    size="sm"
                                    variant={
                                        filters.sort === 'latest'
                                            ? 'default'
                                            : 'outline'
                                    }
                                >
                                    <Link
                                        href={`/creator/${creator.username}?sort=latest`}
                                    >
                                        <CalendarDaysIcon className="size-4" />
                                        Terbaru
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    variant={
                                        filters.sort === 'popular'
                                            ? 'default'
                                            : 'outline'
                                    }
                                >
                                    <Link
                                        href={`/creator/${creator.username}?sort=popular`}
                                    >
                                        <FlameIcon className="size-4" />
                                        Terpopuler
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {twibbons.data.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Belum ada twibbon tayang
                                    </CardTitle>
                                    <CardDescription>
                                        Koleksi twibbon publik kreator ini akan
                                        tampil di sini.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                                {twibbons.data.map((twibbon) => (
                                    <Link
                                        key={twibbon.id}
                                        href={twibbon.public_path}
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
                                                <CardTitle className="[display:-webkit-box] min-h-10 overflow-hidden text-base leading-5 [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                                                    {twibbon.name}
                                                </CardTitle>
                                                <CardDescription className="[display:-webkit-box] min-h-8 overflow-hidden text-xs leading-4 text-slate-500 [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                                                    {twibbon.description &&
                                                    twibbon.description.trim() !==
                                                        ''
                                                        ? twibbon.description
                                                        : 'Twibbon ini belum memiliki deskripsi.'}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="px-4 pt-0 pb-4">
                                                <div className="flex items-center justify-between text-xs text-slate-600">
                                                    <span className="inline-flex items-center gap-1">
                                                        <CalendarDaysIcon className="size-3.5" />
                                                        {formatDate(
                                                            twibbon.created_at,
                                                        )}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <UserIcon className="size-3.5" />
                                                        {twibbon.uses_count}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                            {twibbons.links.map((link) => (
                                <Button
                                    key={`${link.label}-${link.url ?? 'null'}`}
                                    asChild={link.url !== null}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={link.url === null}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            preserveState
                                            preserveScroll
                                        >
                                            {sanitizePaginationLabel(
                                                link.label,
                                            )}
                                        </Link>
                                    ) : (
                                        <span>
                                            {sanitizePaginationLabel(
                                                link.label,
                                            )}
                                        </span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </section>
                </div>

                <TwibbonFooter />
            </div>
        </>
    );
}

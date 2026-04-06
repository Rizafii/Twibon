import { Head, Link } from '@inertiajs/react';
import {
    ArrowRightIcon,
    Link2Icon,
    TrendingUpIcon,
    User,
    UsersIcon,
} from 'lucide-react';
import { TwibbonFooter } from '@/components/twibbon-footer';
import { TwibbonNavbar } from '@/components/twibbon-navbar';
import { UploadTwibbonDialog } from '@/components/upload-twibbon-dialog';
import { VerifiedUserName } from '@/components/verified-user-name';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

type TrendingTwibbon = {
    id: number;
    name: string;
    slug: string;
    preview_url: string;
    creator_id: number | null;
    creator_username?: string | null;
    creator_name: string;
    creator_verified: boolean;
    uses_count: number;
};

type RisingCreator = {
    id: number | null;
    username?: string | null;
    name: string;
    bio?: string | null;
    profile_photo_url?: string | null;
    verified: boolean;
    twibbon_count: number;
    total_uses: number;
    featured_twibbon_slug?: string | null;
};

type Props = {
    canRegister: boolean;
    stats: {
        approved_twibbons: number;
    };
    trending_twibbons: TrendingTwibbon[];
    rising_creators: RisingCreator[];
};

const getInitials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

export default function TwibbonHome({
    canRegister,
    stats,
    trending_twibbons,
    rising_creators,
}: Props) {
    return (
        <>
            <Head title="SMKN 6 Surakarta - Twibbon & Shortlink" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_12%_18%,#ffe7bc_0%,transparent_36%),radial-gradient(circle_at_84%_12%,#c9f4ff_0%,transparent_38%),linear-gradient(180deg,#fffdf8_0%,#edf6ff_100%)] px-4 py-6 md:px-8 md:py-10">
                <div className="mx-auto max-w-375 space-y-8">
                    <TwibbonNavbar canRegister={canRegister} />

                    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm md:p-10">
                        <div className="flex flex-col-reverse items-start justify-between gap-12 lg:flex-row lg:items-center">
                            <div className="space-y-4">
                                <Badge variant="secondary" className="w-fit">
                                    Portal Resmi SMK Negeri 6 Surakarta
                                </Badge>

                                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                                    Web Twibbon & Shortlink
                                </h1>

                                <p className="max-w-2xl text-sm text-slate-600 md:text-base">
                                    Platform kampanye digital untuk acara
                                    sekolah, organisasi, hingga kegiatan siswa.
                                    Gunakan twibbon, bagikan shortlink, dan
                                    pantau kreator paling aktif.
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <Button asChild size="lg">
                                        <Link href="/catalog">
                                            Lihat Full Katalog
                                            <ArrowRightIcon className="size-4" />
                                        </Link>
                                    </Button>
                                    <UploadTwibbonDialog>
                                        {(openUploadDialog) => (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="lg"
                                                onClick={openUploadDialog}
                                            >
                                                Upload Twibbon
                                            </Button>
                                        )}
                                    </UploadTwibbonDialog>
                                </div>
                            </div>
                            <img
                                src="/assets/hero.png"
                                alt="Hero"
                                className="h-42 w-auto lg:h-72"
                            />
                        </div>
                    </section>

                    <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur md:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-2xl font-semibold text-slate-900">
                                Twibbon Sedang Trending
                            </h2>
                            <Link
                                href="/catalog"
                                className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                            >
                                Jelajahi semua twibbon
                                <ArrowRightIcon className="size-4" />
                            </Link>
                        </div>

                        <p className="text-sm text-slate-600">
                            Rekomendasi twibbon paling sering dipakai oleh warga
                            sekolah saat ini.
                        </p>

                        {trending_twibbons.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Belum ada data trending
                                    </CardTitle>
                                    <CardDescription>
                                        Upload twibbon pertama untuk memulai
                                        trending.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
                                {trending_twibbons.map((twibbon) => (
                                    <Card
                                        key={twibbon.id}
                                        className="min-w-60 shrink-0 snap-start overflow-hidden bg-white/95 py-0 shadow-none transition-shadow hover:shadow-md sm:min-w-0"
                                    >
                                        <Link
                                            href={`/twibbon/${twibbon.slug}`}
                                            className="block"
                                        >
                                            <div className="relative h-56 bg-slate-100">
                                                <img
                                                    src={twibbon.preview_url}
                                                    alt={twibbon.name}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>

                                            <CardHeader className="px-4 pt-4">
                                                <CardTitle className="truncate text-base">
                                                    {twibbon.name}
                                                </CardTitle>
                                            </CardHeader>
                                        </Link>

                                        <CardContent className="px-4 pt-0 pb-4">
                                            <div className="flex items-center justify-between gap-2">
                                                {twibbon.creator_username ? (
                                                    <Link
                                                        href={`/creator/${twibbon.creator_username}`}
                                                        className="-mx-1 flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-slate-100/70"
                                                    >
                                                        <Avatar className="h-7 w-7 overflow-hidden rounded-full">
                                                            <AvatarFallback className="bg-neutral-200 text-xs text-black">
                                                                {getInitials(
                                                                    twibbon.creator_name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="leading-tight">
                                                            <p className="text-[11px] font-medium text-slate-800">
                                                                <VerifiedUserName
                                                                    name={
                                                                        twibbon.creator_name
                                                                    }
                                                                    verified={
                                                                        twibbon.creator_verified
                                                                    }
                                                                    iconClassName="size-3"
                                                                />
                                                            </p>
                                                            <p className="text-[10px] text-slate-500">
                                                                Kreator
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-7 w-7 overflow-hidden rounded-full">
                                                            <AvatarFallback className="bg-neutral-200 text-xs text-black">
                                                                {getInitials(
                                                                    twibbon.creator_name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="leading-tight">
                                                            <p className="text-[11px] font-medium text-slate-800">
                                                                <VerifiedUserName
                                                                    name={
                                                                        twibbon.creator_name
                                                                    }
                                                                    verified={
                                                                        twibbon.creator_verified
                                                                    }
                                                                    iconClassName="size-3"
                                                                />
                                                            </p>
                                                            <p className="text-[10px] text-slate-500">
                                                                Kreator
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1 text-xs">
                                                    <User size={12} />
                                                    {twibbon.uses_count}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur md:p-6">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="size-5 text-slate-700" />
                            <h2 className="text-2xl font-semibold text-slate-900">
                                Kreator Naik Daun
                            </h2>
                        </div>

                        <p className="text-sm text-slate-600">
                            Kreator dengan performa penggunaan tertinggi dari
                            twibbon-twibbon yang sudah tayang.
                        </p>

                        {rising_creators.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Belum ada kreator aktif
                                    </CardTitle>
                                    <CardDescription>
                                        Daftar kreator naik daun akan muncul
                                        setelah twibbon mulai dipakai.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {rising_creators.map((creator, index) => (
                                    <Link
                                        key={`${creator.name}-${index}`}
                                        href={
                                            creator.username
                                                ? `/creator/${creator.username}`
                                                : '#'
                                        }
                                        className={
                                            creator.username
                                                ? 'block'
                                                : 'pointer-events-none block'
                                        }
                                    >
                                        <Card className="overflow-hidden border-white/70 bg-white/95 py-0 shadow-sm transition-shadow hover:shadow-md">
                                            <div className="h-1.5 bg-linear-to-r from-sky-300 via-emerald-300 to-orange-200" />

                                            <CardHeader className="pb-2">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-12 w-12 overflow-hidden rounded-full border">
                                                            <AvatarImage
                                                                src={
                                                                    creator.profile_photo_url ??
                                                                    undefined
                                                                }
                                                                alt={
                                                                    creator.name
                                                                }
                                                            />
                                                            <AvatarFallback className="bg-neutral-200 text-black">
                                                                {getInitials(
                                                                    creator.name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle className="text-lg">
                                                                <VerifiedUserName
                                                                    name={
                                                                        creator.name
                                                                    }
                                                                    verified={
                                                                        creator.verified
                                                                    }
                                                                />
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Kreator naik
                                                                daun
                                                            </CardDescription>
                                                        </div>
                                                    </div>

                                                    <Badge variant="outline">
                                                        {creator.total_uses}{' '}
                                                        penggunaan
                                                    </Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="pt-0 pb-5">
                                                <p className="text-sm text-slate-600">
                                                    {creator.bio &&
                                                    creator.bio.trim() !== ''
                                                        ? creator.bio
                                                        : 'Kreator ini belum menambahkan bio.'}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Link2Icon className="size-5 text-slate-700" />
                                    <CardTitle>Shortlink Sekolah</CardTitle>
                                </div>
                                <CardDescription>
                                    Fitur shortlink resmi untuk publikasi acara
                                    SMKN 6 Surakarta akan terintegrasi dalam
                                    platform ini.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button asChild variant="outline">
                                    <Link href="/catalog">
                                        Jelajahi Twibbon Dulu
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </section>
                </div>

                <TwibbonFooter />
            </div>
        </>
    );
}

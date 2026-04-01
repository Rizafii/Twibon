import { Head, Link } from '@inertiajs/react';
import { ArrowRightIcon, Link2Icon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { TwibbonFooter } from '@/components/twibbon-footer';
import { TwibbonNavbar } from '@/components/twibbon-navbar';
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
    creator_name: string;
    uses_count: number;
};

type RisingCreator = {
    name: string;
    bio?: string | null;
    profile_photo_url?: string | null;
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
                <div className="mx-auto max-w-6xl space-y-8">
                    <TwibbonNavbar canRegister={canRegister} />

                    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm md:p-10">
                        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
                            <div className="space-y-4">
                                <Badge variant="secondary" className="w-fit">
                                    Portal Resmi SMK Negeri 6 Surakarta
                                </Badge>

                                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                                    Web Twibbon & Shortlink
                                </h1>

                                <p className="max-w-2xl text-sm text-slate-600 md:text-base">
                                    Platform kampanye digital untuk acara sekolah,
                                    organisasi, hingga kegiatan siswa. Gunakan twibbon,
                                    bagikan shortlink, dan pantau kreator paling aktif.
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <Button asChild size="lg">
                                        <Link href="/catalog">
                                            Lihat Full Katalog
                                            <ArrowRightIcon className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg">
                                        <Link href="/upload">Upload Twibbon</Link>
                                    </Button>
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Statistik Cepat
                                    </CardTitle>
                                    <CardDescription>
                                        Snapshot aktivitas platform saat ini.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="rounded-lg border bg-slate-50 p-3">
                                        <p className="text-xs text-slate-500">
                                            Total Twibbon Approved
                                        </p>
                                        <p className="text-2xl font-semibold text-slate-900">
                                            {stats.approved_twibbons}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border bg-slate-50 p-3">
                                        <p className="text-xs text-slate-500">
                                            Fokus Platform
                                        </p>
                                        <p className="font-medium text-slate-900">
                                            Twibbon Sekolah + Shortlink Acara
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <TrendingUpIcon className="size-5 text-slate-700" />
                            <h2 className="text-2xl font-semibold text-slate-900">
                                Twibbon Sedang Trending
                            </h2>
                        </div>

                        {trending_twibbons.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Belum ada data trending</CardTitle>
                                    <CardDescription>
                                        Upload twibbon pertama untuk memulai trending.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {trending_twibbons.map((twibbon) => (
                                    <Card key={twibbon.id} className="overflow-hidden py-0">
                                        <div className="aspect-3/4 bg-slate-100">
                                            <img
                                                src={twibbon.preview_url}
                                                alt={twibbon.name}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="truncate text-lg">
                                                {twibbon.name}
                                            </CardTitle>
                                            <CardDescription>
                                                Oleh {twibbon.creator_name}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <Badge variant="outline">
                                                {twibbon.uses_count} penggunaan
                                            </Badge>
                                        </CardContent>
                                        <CardFooter className="gap-2 pb-5">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/twibbon/${twibbon.slug}`}>
                                                    Detail
                                                </Link>
                                            </Button>
                                            <Button asChild size="sm" className="ml-auto">
                                                <Link href={`/editor/${twibbon.slug}`}>
                                                    Pakai
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="size-5 text-slate-700" />
                            <h2 className="text-2xl font-semibold text-slate-900">
                                Kreator Naik Daun
                            </h2>
                        </div>

                        {rising_creators.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Belum ada kreator aktif</CardTitle>
                                    <CardDescription>
                                        Daftar kreator naik daun akan muncul setelah
                                        twibbon mulai dipakai.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {rising_creators.map((creator, index) => (
                                    <Card key={`${creator.name}-${index}`}>
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12 overflow-hidden rounded-full border">
                                                    <AvatarImage
                                                        src={creator.profile_photo_url ?? undefined}
                                                        alt={creator.name}
                                                    />
                                                    <AvatarFallback className="bg-neutral-200 text-black">
                                                        {getInitials(creator.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-lg">
                                                        {creator.name}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {creator.twibbon_count} twibbon
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-slate-600">
                                                {creator.bio && creator.bio.trim() !== ''
                                                    ? creator.bio
                                                    : 'Kreator ini belum menambahkan bio.'}
                                            </p>
                                            <Badge variant="secondary">
                                                {creator.total_uses} total penggunaan
                                            </Badge>
                                        </CardContent>
                                        {creator.featured_twibbon_slug && (
                                            <CardFooter>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/twibbon/${creator.featured_twibbon_slug}`}>
                                                        Lihat Karya Terpopuler
                                                    </Link>
                                                </Button>
                                            </CardFooter>
                                        )}
                                    </Card>
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
                                    Fitur shortlink resmi untuk publikasi acara SMKN 6
                                    Surakarta akan terintegrasi dalam platform ini.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button asChild variant="outline">
                                    <Link href="/catalog">Jelajahi Twibbon Dulu</Link>
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

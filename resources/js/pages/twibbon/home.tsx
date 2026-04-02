import { Head, Link } from '@inertiajs/react';
import { ArrowRightIcon, Link2Icon, TrendingUpIcon, User, UsersIcon } from 'lucide-react';
import { TwibbonFooter } from '@/components/twibbon-footer';
import { TwibbonNavbar } from '@/components/twibbon-navbar';
import { UploadTwibbonDialog } from '@/components/upload-twibbon-dialog';
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
                <div className="mx-auto max-w-375 space-y-8">
                    <TwibbonNavbar canRegister={canRegister} />

                    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm md:p-10">
                        <div className="flex justify-between lg:flex-row flex-col-reverse gap-12 items-start lg:items-center">
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
                            <img src="/assets/hero.png" alt="Hero" className='w-auto h-42 lg:h-72' />
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
                                    <CardTitle>Belum ada data trending</CardTitle>
                                    <CardDescription>
                                        Upload twibbon pertama untuk memulai trending.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5">
                                {trending_twibbons.map((twibbon) => (
                                    <Link
                                        key={twibbon.id}
                                        href={`/twibbon/${twibbon.slug}`}
                                        className="block min-w-60 shrink-0 snap-start sm:min-w-0"
                                    >
                                        <Card className="overflow-hidden bg-white/95 py-0 shadow-none transition-shadow hover:shadow-md">
                                            <div className="relative h-56 bg-slate-100">
                                                <img
                                                    src={twibbon.preview_url}
                                                    alt={twibbon.name}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>

                                            <CardHeader className="px-4">
                                                <CardTitle className="truncate text-base">
                                                    {twibbon.name}
                                                </CardTitle>
                                                
                                            </CardHeader>

                                            <CardContent className=" px-4 pb-4 pt-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-7 w-7 overflow-hidden rounded-full">
                                                            <AvatarFallback className="bg-neutral-200 text-xs text-black">
                                                                {getInitials(twibbon.creator_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="leading-tight">
                                                            <p className="text-[11px] font-medium text-slate-800">
                                                                {twibbon.creator_name}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500">
                                                                Kreator
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-xs flex items-center gap-1">
                                                        <User size={12}/>{twibbon.uses_count}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
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
                                    <Card
                                        key={`${creator.name}-${index}`}
                                        className="overflow-hidden border-white/70 bg-white/95 py-0 shadow-sm"
                                    >
                                        <div className="h-1.5 bg-linear-to-r from-sky-300 via-emerald-300 to-orange-200" />

                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between gap-3">
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
                                                            Kreator naik daun
                                                        </CardDescription>
                                                    </div>
                                                </div>

                                                <Badge variant="outline">
                                                    {creator.twibbon_count} twibbon
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-3 pt-0">
                                            <p className="text-sm text-slate-600">
                                                {creator.bio && creator.bio.trim() !== ''
                                                    ? creator.bio
                                                    : 'Kreator ini belum menambahkan bio.'}
                                            </p>

                                            <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-2.5">
                                                <p className="text-xs text-slate-500">
                                                    Total penggunaan
                                                </p>
                                                <p className="font-semibold text-slate-900">
                                                    {creator.total_uses}
                                                </p>
                                            </div>
                                        </CardContent>

                                        {creator.featured_twibbon_slug && (
                                            <CardFooter className="pb-5">
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

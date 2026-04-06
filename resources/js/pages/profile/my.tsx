import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BarChart3Icon,
    CalendarClockIcon,
    CheckCircle2Icon,
    Clock3Icon,
    EyeIcon,
    Link2Icon,
    PencilLineIcon,
    SaveIcon,
    SearchIcon,
    ShieldCheckIcon,
    SparklesIcon,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
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
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { send } from '@/routes/verification';

type Profile = {
    id: number;
    name: string;
    username: string;
    email: string;
    bio?: string | null;
    verified: boolean;
    email_verified_at: string | null;
    profile_photo_url?: string | null;
    banner_photo_url?: string | null;
    joined_at: string | null;
};

type TwibbonItem = {
    id: number;
    name: string;
    description: string;
    slug: string;
    preview_url: string;
    is_approved: boolean;
    uses_count: number;
    uses_last_7_days_count: number;
    links_count: number;
    link_clicks_count: number;
    created_at: string | null;
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
    mustVerifyEmail: boolean;
    status?: string;
    profile: Profile;
    filters: {
        search: string;
        status: 'all' | 'approved' | 'pending';
    };
    stats: {
        total_twibbons: number;
        approved_twibbons: number;
        pending_twibbons: number;
        total_uses: number;
        uses_last_7_days: number;
        total_links: number;
        total_link_clicks: number;
        top_twibbon: {
            name: string;
            slug: string;
            uses_count: number;
        } | null;
    };
    twibbons: Paginated<TwibbonItem>;
};

type SharedProps = {
    flash?: {
        success?: string | null;
        error?: string | null;
    };
};

type ProfileForm = {
    name: string;
    username: string;
    email: string;
    bio: string;
    profile_photo_path: File | null;
    banner_photo_path: File | null;
};

const sanitizePaginationLabel = (label: string): string =>
    label
        .replaceAll('&laquo;', '«')
        .replaceAll('&raquo;', '»')
        .replace(/<[^>]+>/g, '')
        .trim();

const formatDate = (dateTime: string | null): string => {
    if (!dateTime) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateTime));
};

const getInitials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

export default function MyProfile({
    mustVerifyEmail,
    status,
    profile,
    filters,
    stats,
    twibbons,
}: Props) {
    const { flash } = usePage<SharedProps>().props;

    const {
        data: profileData,
        setData: setProfileData,
        patch: patchProfile,
        processing: profileProcessing,
        errors: profileErrors,
    } = useForm<ProfileForm>({
        name: profile.name,
        username: profile.username,
        email: profile.email,
        bio: profile.bio ?? '',
        profile_photo_path: null,
        banner_photo_path: null,
    });

    const {
        data: filterData,
        setData: setFilterData,
        get,
        processing: filtering,
    } = useForm({
        search: filters.search,
        status: filters.status,
    });

    const [selectedDelete, setSelectedDelete] = useState<TwibbonItem | null>(
        null,
    );
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showProfileForm, setShowProfileForm] = useState(false);

    const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        patchProfile('/my-profile', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        get('/my-profile', {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const confirmDelete = () => {
        if (!selectedDelete) {
            return;
        }

        setDeletingId(selectedDelete.id);

        router.delete(`/my-profile/twibbon/${selectedDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingId(null);
                setSelectedDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Profil Saya" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_8%_16%,#ffe2ad_0%,transparent_32%),radial-gradient(circle_at_94%_8%,#c6f1ff_0%,transparent_35%),linear-gradient(180deg,#fff9ef_0%,#eef6ff_100%)] px-4 py-6 md:px-8 md:py-10">
                <div className="mx-auto max-w-375 space-y-8">
                    <TwibbonNavbar />

                    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm">
                        {profile.banner_photo_url ? (
                            <img
                                src={profile.banner_photo_url}
                                alt={`Banner ${profile.name}`}
                                className="h-36 w-full object-cover md:h-44"
                            />
                        ) : (
                            <div className="h-36 w-full bg-[linear-gradient(135deg,#dbeafe_0%,#fde68a_55%,#bbf7d0_100%)] md:h-44" />
                        )}

                        <div className="space-y-4 p-5 md:p-7">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16 overflow-hidden rounded-full border border-white shadow-sm md:h-20 md:w-20">
                                        <AvatarImage
                                            src={
                                                profile.profile_photo_url ??
                                                undefined
                                            }
                                            alt={profile.name}
                                        />
                                        <AvatarFallback className="bg-neutral-200 text-black">
                                            {getInitials(profile.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="space-y-1">
                                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                                            <VerifiedUserName
                                                name={profile.name}
                                                verified={profile.verified}
                                            />
                                        </h1>
                                        <p className="text-sm text-slate-600">
                                            @{profile.username}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Bergabung {formatDate(profile.joined_at)}
                                    </Badge>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                            setShowProfileForm((prev) => !prev)
                                        }
                                    >
                                        <PencilLineIcon className="size-4" />
                                        {showProfileForm
                                            ? 'Tutup Form'
                                            : 'Perbarui Data'}
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/my-profile/password">
                                            <ShieldCheckIcon className="size-4" />
                                            Ganti Password
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 md:text-base">
                                Halaman ini adalah pusat profil kreator kamu,
                                termasuk update biodata dan manajemen Twibbon.
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/creator/${profile.username}`}>
                                        Lihat Profil Publik
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {showProfileForm && (
                        <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm md:p-7">
                            <div className="mb-5">
                                <h2 className="text-2xl font-semibold text-slate-900">
                                    Update Profil
                                </h2>
                                <p className="text-sm text-slate-600">
                                    Ubah data akun, username kreator, dan foto profil
                                    kamu dari halaman ini.
                                </p>
                            </div>

                            <form
                                onSubmit={handleProfileSubmit}
                                className="grid gap-4 lg:grid-cols-2"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        value={profileData.name}
                                        onChange={(event) =>
                                            setProfileData('name', event.target.value)
                                        }
                                        placeholder="Nama lengkap"
                                    />
                                    {profileErrors.name && (
                                        <p className="text-sm text-red-600">
                                            {profileErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={profileData.username}
                                        onChange={(event) =>
                                            setProfileData(
                                                'username',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="contoh: creative-six"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Dipakai untuk URL kreator: /creator/
                                        {profileData.username || 'username'}
                                    </p>
                                    {profileErrors.username && (
                                        <p className="text-sm text-red-600">
                                            {profileErrors.username}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(event) =>
                                            setProfileData('email', event.target.value)
                                        }
                                        placeholder="email@example.com"
                                    />
                                    {profileErrors.email && (
                                        <p className="text-sm text-red-600">
                                            {profileErrors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2 lg:col-span-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <textarea
                                        id="bio"
                                        value={profileData.bio}
                                        onChange={(event) =>
                                            setProfileData('bio', event.target.value)
                                        }
                                        placeholder="Tulis bio singkat tentang kamu"
                                        rows={4}
                                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                                    />
                                    {profileErrors.bio && (
                                        <p className="text-sm text-red-600">
                                            {profileErrors.bio}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="profile_photo_path">
                                        Foto Profil
                                    </Label>
                                    <Input
                                        id="profile_photo_path"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(event) =>
                                            setProfileData(
                                                'profile_photo_path',
                                                event.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                    {profile.profile_photo_url && (
                                        <img
                                            src={profile.profile_photo_url}
                                            alt="Current profile"
                                            className="h-20 w-20 rounded-lg border object-cover"
                                        />
                                    )}
                                    {profileErrors.profile_photo_path && (
                                        <p className="text-sm text-red-600">
                                            {profileErrors.profile_photo_path}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="banner_photo_path">
                                        Foto Banner
                                    </Label>
                                    <Input
                                        id="banner_photo_path"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(event) =>
                                            setProfileData(
                                                'banner_photo_path',
                                                event.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                    {profile.banner_photo_url && (
                                        <img
                                            src={profile.banner_photo_url}
                                            alt="Current banner"
                                            className="h-24 w-full rounded-lg border object-cover"
                                        />
                                    )}
                                    {profileErrors.banner_photo_path && (
                                        <p className="text-sm text-red-600">
                                            {profileErrors.banner_photo_path}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 lg:col-span-2">
                                    <Button type="submit" disabled={profileProcessing}>
                                        {profileProcessing ? (
                                            <Spinner className="size-4" />
                                        ) : (
                                            <SaveIcon className="size-4" />
                                        )}
                                        Simpan Profil
                                    </Button>

                                    {mustVerifyEmail &&
                                        profile.email_verified_at === null && (
                                            <p className="text-sm text-slate-600">
                                                Email belum terverifikasi.{' '}
                                                <Link
                                                    href={send()}
                                                    method="post"
                                                    as="button"
                                                    className="font-medium text-slate-900 underline underline-offset-4"
                                                >
                                                    Kirim ulang verifikasi
                                                </Link>
                                            </p>
                                        )}
                                </div>
                            </form>

                            {status === 'verification-link-sent' && (
                                <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                    Link verifikasi baru sudah dikirim ke email kamu.
                                </p>
                            )}
                        </section>
                    )}

                    <section id="twibbon" className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm md:p-7">
                        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div className="space-y-2">
                                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <SparklesIcon className="size-4" />
                                    Statistik Twibbon kreator
                                </p>
                                <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                                    Twibbon Saya
                                </h2>
                                <p className="text-sm text-slate-600">
                                    Pantau performa upload, approval, dan
                                    pertumbuhan penggunaan.
                                </p>
                            </div>

                            {stats.top_twibbon ? (
                                <Badge variant="secondary" className="w-fit">
                                    Top: {stats.top_twibbon.name} (
                                    {stats.top_twibbon.uses_count}x)
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="w-fit">
                                    Belum ada twibbon teratas
                                </Badge>
                            )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <Card className="h-full gap-2 border-slate-200/80 bg-slate-50/70 py-0 shadow-none">
                                <CardHeader className="space-y-2 px-5 pt-4 pb-0">
                                    <CardDescription className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                        <BarChart3Icon className="size-4" />
                                        Total Upload
                                    </CardDescription>
                                    <CardTitle className="text-4xl font-semibold tracking-tight text-slate-900">
                                        {stats.total_twibbons}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-4 pt-0 text-[13px] text-slate-600">
                                    {stats.approved_twibbons} approved •{' '}
                                    {stats.pending_twibbons} pending
                                </CardContent>
                            </Card>

                            <Card className="h-full gap-2 border-slate-200/80 bg-slate-50/70 py-0 shadow-none">
                                <CardHeader className="space-y-2 px-5 pt-4 pb-0">
                                    <CardDescription className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                        <EyeIcon className="size-4" />
                                        Total Pemakaian
                                    </CardDescription>
                                    <CardTitle className="text-4xl font-semibold tracking-tight text-slate-900">
                                        {stats.total_uses}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-4 pt-0 text-[13px] text-slate-600">
                                    Dipakai dari halaman editor
                                </CardContent>
                            </Card>

                            <Card className="h-full gap-2 border-slate-200/80 bg-slate-50/70 py-0 shadow-none">
                                <CardHeader className="space-y-2 px-5 pt-4 pb-0">
                                    <CardDescription className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                        <CalendarClockIcon className="size-4" />
                                        7 Hari Terakhir
                                    </CardDescription>
                                    <CardTitle className="text-4xl font-semibold tracking-tight text-slate-900">
                                        {stats.uses_last_7_days}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-4 pt-0 text-[13px] text-slate-600">
                                    Tren penggunaan mingguan
                                </CardContent>
                            </Card>

                            <Card className="h-full gap-2 border-slate-200/80 bg-slate-50/70 py-0 shadow-none">
                                <CardHeader className="space-y-2 px-5 pt-4 pb-0">
                                    <CardDescription className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                        <Link2Icon className="size-4" />
                                        Link Analytics
                                    </CardDescription>
                                    <CardTitle className="text-4xl font-semibold tracking-tight text-slate-900">
                                        {stats.total_link_clicks}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-4 pt-0 text-[13px] text-slate-600">
                                    {stats.total_links} link aktif tercatat
                                </CardContent>
                            </Card>
                        </div>

                        <form
                            onSubmit={handleSearch}
                            className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center"
                        >
                            <Input
                                value={filterData.search}
                                onChange={(event) =>
                                    setFilterData('search', event.target.value)
                                }
                                placeholder="Cari nama atau deskripsi twibbon..."
                                className="h-11 lg:flex-1"
                            />

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant={
                                        filterData.status === 'all'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => setFilterData('status', 'all')}
                                    className="h-11"
                                >
                                    <BarChart3Icon className="size-4" />
                                    Semua
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        filterData.status === 'approved'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        setFilterData('status', 'approved')
                                    }
                                    className="h-11"
                                >
                                    <CheckCircle2Icon className="size-4" />
                                    Approved
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        filterData.status === 'pending'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        setFilterData('status', 'pending')
                                    }
                                    className="h-11"
                                >
                                    <Clock3Icon className="size-4" />
                                    Pending
                                </Button>
                                <Button type="submit" className="h-11 px-5">
                                    {filtering ? (
                                        <Spinner className="size-4" />
                                    ) : (
                                        <SearchIcon className="size-4" />
                                    )}
                                    Filter
                                </Button>
                            </div>
                        </form>

                        {flash?.success && (
                            <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                {flash.success}
                            </p>
                        )}

                        {flash?.error && (
                            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {flash.error}
                            </p>
                        )}

                        {twibbons.data.length === 0 ? (
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle>
                                        Belum ada twibbon ditemukan
                                    </CardTitle>
                                    <CardDescription>
                                        Upload twibbon baru atau ubah kata kunci
                                        pencarian.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {twibbons.data.map((twibbon) => (
                                    <Card
                                        key={twibbon.id}
                                        className="overflow-hidden py-0"
                                    >
                                        <div className="h-56 bg-slate-100">
                                            <img
                                                src={twibbon.preview_url}
                                                alt={twibbon.name}
                                                loading="lazy"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <CardHeader className="space-y-2 pb-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <CardTitle className="truncate text-lg">
                                                    {twibbon.name}
                                                </CardTitle>
                                                {twibbon.is_approved ? (
                                                    <Badge>Approved</Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        Pending
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription className="line-clamp-2">
                                                {twibbon.description}
                                            </CardDescription>
                                            <p className="text-xs text-slate-500">
                                                Upload:{' '}
                                                {formatDate(twibbon.created_at)}
                                            </p>
                                        </CardHeader>

                                        <CardContent className="space-y-2 pt-0">
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="rounded-md border bg-slate-50 p-2">
                                                    <p className="text-slate-500">
                                                        Total Uses
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {twibbon.uses_count}
                                                    </p>
                                                </div>
                                                <div className="rounded-md border bg-slate-50 p-2">
                                                    <p className="text-slate-500">
                                                        7 Hari
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {
                                                            twibbon.uses_last_7_days_count
                                                        }
                                                    </p>
                                                </div>
                                                <div className="rounded-md border bg-slate-50 p-2">
                                                    <p className="text-slate-500">
                                                        Links
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {twibbon.links_count}
                                                    </p>
                                                </div>
                                                <div className="rounded-md border bg-slate-50 p-2">
                                                    <p className="text-slate-500">
                                                        Link Clicks
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {twibbon.link_clicks_count}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="w-full gap-2 pb-5">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                <Link
                                                    href={`/my-profile/twibbon/${twibbon.id}/edit`}
                                                >
                                                    <PencilLineIcon className="size-4" />
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                                onClick={() =>
                                                    setSelectedDelete(twibbon)
                                                }
                                            >
                                                Hapus
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-2">
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
                                        <span>
                                            {sanitizePaginationLabel(link.label)}
                                        </span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </section>
                </div>

                <TwibbonFooter />
            </div>

            <Dialog
                open={selectedDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus twibbon ini?</DialogTitle>
                        <DialogDescription>
                            Twibbon yang dihapus tidak bisa dikembalikan.
                            Tindakan ini akan menghapus data terkait.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedDelete(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deletingId !== null}
                        >
                            {deletingId !== null ? (
                                <Spinner className="size-4" />
                            ) : null}
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

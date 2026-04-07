import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BarChart3Icon,
    CalendarClockIcon,
    CheckCircle2Icon,
    Clock3Icon,
    ExternalLinkIcon,
    EyeIcon,
    Link2Icon,
    PencilLineIcon,
    SaveIcon,
    SearchIcon,
    ShieldCheckIcon,
    SparklesIcon,
    Trash2Icon,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import InputError from '@/components/input-error';
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
import { Checkbox } from '@/components/ui/checkbox';
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
    custom_url?: string | null;
    public_url: string;
    preview_url: string;
    is_approved: boolean;
    uses_count: number;
    uses_last_7_days_count: number;
    links_count: number;
    link_clicks_count: number;
    created_at: string | null;
};

type ShortLinkItem = {
    id: number;
    label?: string | null;
    slug: string;
    target_url: string;
    is_private: boolean;
    is_active: boolean;
    clicks_count: number;
    clicks_last_7_days_count: number;
    public_url: string;
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
        tab: 'twibbon' | 'url';
    };
    stats: {
        total_twibbons: number;
        approved_twibbons: number;
        pending_twibbons: number;
        total_uses: number;
        uses_last_7_days: number;
        total_links: number;
        total_link_clicks: number;
        total_link_clicks_last_7_days: number;
        top_twibbon: {
            name: string;
            slug: string;
            uses_count: number;
        } | null;
    };
    twibbons: Paginated<TwibbonItem>;
    short_links: ShortLinkItem[];
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
    tab: 'twibbon' | 'url';
    _method: 'patch';
};

type TwibbonFilterForm = {
    search: string;
    status: 'all' | 'approved' | 'pending';
    tab: 'twibbon';
};

type ShortLinkForm = {
    label: string;
    slug: string;
    target_url: string;
    is_active: boolean;
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

const formatNumber = (value: number): string =>
    new Intl.NumberFormat('id-ID').format(value);

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
    short_links,
}: Props) {
    const { flash } = usePage<SharedProps>().props;
    const activeTab: 'twibbon' | 'url' = filters.tab === 'url' ? 'url' : 'twibbon';

    const {
        data: profileData,
        setData: setProfileData,
        post: postProfile,
        processing: profileProcessing,
        errors: profileErrors,
        clearErrors: clearProfileErrors,
    } = useForm<ProfileForm>({
        name: profile.name,
        username: profile.username,
        email: profile.email,
        bio: profile.bio ?? '',
        profile_photo_path: null,
        banner_photo_path: null,
        tab: activeTab,
        _method: 'patch',
    });

    const {
        data: filterData,
        setData: setFilterData,
        get: getTwibbon,
        processing: filtering,
    } = useForm<TwibbonFilterForm>({
        search: filters.search,
        status: filters.status,
        tab: 'twibbon',
    });

    const {
        data: editShortLinkData,
        setData: setEditShortLinkData,
        patch: patchShortLink,
        processing: editingShortLink,
        errors: editShortLinkErrors,
        clearErrors: clearEditShortLinkErrors,
    } = useForm<ShortLinkForm>({
        label: '',
        slug: '',
        target_url: '',
        is_active: true,
    });

    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedTwibbonDelete, setSelectedTwibbonDelete] = useState<TwibbonItem | null>(null);
    const [deletingTwibbonId, setDeletingTwibbonId] = useState<number | null>(null);
    const [selectedShortLinkDelete, setSelectedShortLinkDelete] = useState<ShortLinkItem | null>(null);
    const [deletingShortLinkId, setDeletingShortLinkId] = useState<number | null>(null);
    const [editingShortLinkTarget, setEditingShortLinkTarget] = useState<ShortLinkItem | null>(null);
    const [editShortLinkModalOpen, setEditShortLinkModalOpen] = useState(false);

    useEffect(() => {
        setProfileData('tab', activeTab);
    }, [activeTab, setProfileData]);

    const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        postProfile('/my-profile', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setProfileModalOpen(false);
                setProfileData('profile_photo_path', null);
                setProfileData('banner_photo_path', null);
            },
        });
    };

    const handleTwibbonSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        getTwibbon('/my-profile', {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const confirmDeleteTwibbon = () => {
        if (!selectedTwibbonDelete) {
            return;
        }

        setDeletingTwibbonId(selectedTwibbonDelete.id);

        router.delete(`/my-profile/twibbon/${selectedTwibbonDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingTwibbonId(null);
                setSelectedTwibbonDelete(null);
            },
        });
    };

    const openEditShortLinkModal = (shortLink: ShortLinkItem) => {
        setEditingShortLinkTarget(shortLink);
        setEditShortLinkData('label', shortLink.label ?? '');
        setEditShortLinkData('slug', shortLink.slug);
        setEditShortLinkData('target_url', shortLink.target_url);
        setEditShortLinkData('is_active', shortLink.is_active);
        clearEditShortLinkErrors();
        setEditShortLinkModalOpen(true);
    };

    const handleEditShortLinkSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editingShortLinkTarget) {
            return;
        }

        patchShortLink(`/my-profile/urls/${editingShortLinkTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditShortLinkModalOpen(false);
                setEditingShortLinkTarget(null);
            },
        });
    };

    const confirmDeleteShortLink = () => {
        if (!selectedShortLinkDelete) {
            return;
        }

        setDeletingShortLinkId(selectedShortLinkDelete.id);

        router.delete(`/my-profile/urls/${selectedShortLinkDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingShortLinkId(null);
                setSelectedShortLinkDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Profil Saya" />

            <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
                <div className="mx-auto max-w-375 space-y-6">
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
                                            src={profile.profile_photo_url ?? undefined}
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
                                        onClick={() => {
                                            clearProfileErrors();
                                            setProfileModalOpen(true);
                                        }}
                                    >
                                        <PencilLineIcon className="size-4" />
                                        Perbarui Data
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
                                Kelola profil kreator, twibbon, dan shortlink private
                                dari satu halaman terpusat.
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

                    {(flash?.success || flash?.error || status === 'verification-link-sent') && (
                        <div className="space-y-2">
                            {flash?.success && (
                                <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                    {flash.success}
                                </p>
                            )}
                            {flash?.error && (
                                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {flash.error}
                                </p>
                            )}
                            {status === 'verification-link-sent' && (
                                <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                    Link verifikasi baru sudah dikirim ke email kamu.
                                </p>
                            )}
                        </div>
                    )}

                    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-3 shadow-sm md:p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="px-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Kelola Konten
                                </p>
                                <p className="text-sm text-slate-600">
                                    Pilih area manajemen yang ingin dibuka.
                                </p>
                            </div>

                            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                <Button
                                    asChild
                                    variant={activeTab === 'twibbon' ? 'default' : 'ghost'}
                                    size="sm"
                                >
                                    <Link href="/my-profile" preserveScroll>
                                        Twibbon
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant={activeTab === 'url' ? 'default' : 'ghost'}
                                    size="sm"
                                >
                                    <Link href="/my-profile?tab=url" preserveScroll>
                                        URL
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {activeTab === 'twibbon' ? (
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
                                        Top: {stats.top_twibbon.name} ({stats.top_twibbon.uses_count}x)
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
                                            {formatNumber(stats.total_twibbons)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-5 pb-4 pt-0 text-[13px] text-slate-600">
                                        {formatNumber(stats.approved_twibbons)} approved •{' '}
                                        {formatNumber(stats.pending_twibbons)} pending
                                    </CardContent>
                                </Card>

                                <Card className="h-full gap-2 border-slate-200/80 bg-slate-50/70 py-0 shadow-none">
                                    <CardHeader className="space-y-2 px-5 pt-4 pb-0">
                                        <CardDescription className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                            <EyeIcon className="size-4" />
                                            Total Pemakaian
                                        </CardDescription>
                                        <CardTitle className="text-4xl font-semibold tracking-tight text-slate-900">
                                            {formatNumber(stats.total_uses)}
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
                                            {formatNumber(stats.uses_last_7_days)}
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
                                            {formatNumber(stats.total_link_clicks)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-5 pb-4 pt-0 text-[13px] text-slate-600">
                                        {formatNumber(stats.total_links)} link aktif tercatat
                                    </CardContent>
                                </Card>
                            </div>

                            <form
                                onSubmit={handleTwibbonSearch}
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
                                    <CardFooter>
                                        <Button asChild variant="outline">
                                            <Link href="/upload">Upload Twibbon</Link>
                                        </Button>
                                    </CardFooter>
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
                                                    Upload: {formatDate(twibbon.created_at)}
                                                </p>
                                                <a
                                                    href={twibbon.public_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-slate-600 underline underline-offset-2"
                                                >
                                                    <ExternalLinkIcon className="size-3" />
                                                    {twibbon.custom_url
                                                        ? `/${twibbon.custom_url}`
                                                        : `/twibbon/${twibbon.slug}`}
                                                </a>
                                            </CardHeader>

                                            <CardContent className="space-y-2 pt-0">
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="rounded-md border bg-slate-50 p-2">
                                                        <p className="text-slate-500">
                                                            Total Uses
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {formatNumber(
                                                                twibbon.uses_count,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-md border bg-slate-50 p-2">
                                                        <p className="text-slate-500">
                                                            7 Hari
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {formatNumber(
                                                                twibbon.uses_last_7_days_count,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-md border bg-slate-50 p-2">
                                                        <p className="text-slate-500">
                                                            Links
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {formatNumber(
                                                                twibbon.links_count,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-md border bg-slate-50 p-2">
                                                        <p className="text-slate-500">
                                                            Link Clicks
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {formatNumber(
                                                                twibbon.link_clicks_count,
                                                            )}
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
                                                        setSelectedTwibbonDelete(
                                                            twibbon,
                                                        )
                                                    }
                                                >
                                                    <Trash2Icon className="size-4" />
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
                    ) : (
                        <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm md:p-7">
                            <div className="space-y-2">
                                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <Link2Icon className="size-4" />
                                    URL Manager
                                </p>
                                <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                                    Shortlink Private
                                </h2>
                                <p className="text-sm text-slate-600 md:text-base">
                                    Kelola URL pendek untuk distribusi campaign.
                                    Pembuatan shortlink dilakukan dari menu navbar,
                                    dan di sini kamu fokus untuk monitoring.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <Card className="h-full gap-2 border-slate-200/80 bg-slate-50/70 py-0 shadow-none">
                                    <CardHeader className="space-y-2 px-5 pt-4 pb-0">
                                        <CardDescription className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                            <Link2Icon className="size-4" />
                                            Total URL
                                        </CardDescription>
                                        <CardTitle className="text-4xl font-semibold tracking-tight text-slate-900">
                                            {formatNumber(stats.total_links)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-5 pb-4 pt-0 text-[13px] text-slate-600">
                                        Jumlah shortlink private yang kamu kelola.
                                    </CardContent>
                                </Card>

                                <Card className="h-full gap-2 border-slate-200/80 bg-slate-50/70 py-0 shadow-none">
                                    <CardHeader className="space-y-2 px-5 pt-4 pb-0">
                                        <CardDescription className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                            <EyeIcon className="size-4" />
                                            Total Klik
                                        </CardDescription>
                                        <CardTitle className="text-4xl font-semibold tracking-tight text-slate-900">
                                            {formatNumber(stats.total_link_clicks)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-5 pb-4 pt-0 text-[13px] text-slate-600">
                                        Akumulasi semua klik sejak link dibuat.
                                    </CardContent>
                                </Card>

                                <Card className="h-full gap-2 border-slate-200/80 bg-slate-50/70 py-0 shadow-none sm:col-span-2 xl:col-span-1">
                                    <CardHeader className="space-y-2 px-5 pt-4 pb-0">
                                        <CardDescription className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                            <CalendarClockIcon className="size-4" />
                                            7 Hari Terakhir
                                        </CardDescription>
                                        <CardTitle className="text-4xl font-semibold tracking-tight text-slate-900">
                                            {formatNumber(
                                                stats.total_link_clicks_last_7_days,
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-5 pb-4 pt-0 text-[13px] text-slate-600">
                                        Tren pertumbuhan klik mingguan.
                                    </CardContent>
                                </Card>
                            </div>

                            {short_links.length === 0 ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Belum ada shortlink
                                        </CardTitle>
                                        <CardDescription>
                                            Belum ada data shortlink.
                                            Buat shortlink baru dari menu navbar.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ) : (
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {short_links.map((shortLink) => (
                                        <Card key={shortLink.id}>
                                            <CardHeader className="space-y-2">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <CardTitle className="text-lg">
                                                        {shortLink.label && shortLink.label !== ''
                                                            ? shortLink.label
                                                            : shortLink.slug}
                                                    </CardTitle>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {shortLink.is_private && (
                                                            <Badge variant="secondary">
                                                                Private
                                                            </Badge>
                                                        )}
                                                        {shortLink.is_active ? (
                                                            <Badge>
                                                                Aktif
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                Nonaktif
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <CardDescription className="space-y-1">
                                                    <a
                                                        href={shortLink.public_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-slate-700 underline underline-offset-2"
                                                    >
                                                        <ExternalLinkIcon className="size-3" />
                                                        /{shortLink.slug}
                                                    </a>
                                                    <p className="break-all text-xs">
                                                        Tujuan: {shortLink.target_url}
                                                    </p>
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="rounded-md border bg-slate-50 p-2">
                                                        <p className="text-slate-500">
                                                            Total Klik
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {formatNumber(
                                                                shortLink.clicks_count,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-md border bg-slate-50 p-2">
                                                        <p className="text-slate-500">
                                                            7 Hari
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {formatNumber(
                                                                shortLink.clicks_last_7_days_count,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Dibuat: {formatDate(shortLink.created_at)}
                                                </p>
                                            </CardContent>

                                            <CardFooter className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEditShortLinkModal(
                                                            shortLink,
                                                        )
                                                    }
                                                >
                                                    <PencilLineIcon className="size-4" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        setSelectedShortLinkDelete(
                                                            shortLink,
                                                        )
                                                    }
                                                >
                                                    <Trash2Icon className="size-4" />
                                                    Hapus
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>

                <TwibbonFooter />
            </div>

            <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Perbarui Profil</DialogTitle>
                        <DialogDescription>
                            Ubah data akun, username kreator, dan foto profil.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleProfileSubmit} className="grid gap-4 md:grid-cols-2">
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
                            <InputError message={profileErrors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={profileData.username}
                                onChange={(event) =>
                                    setProfileData('username', event.target.value)
                                }
                                placeholder="contoh: creative-six"
                            />
                            <p className="text-xs text-slate-500">
                                URL kreator: /creator/
                                {profileData.username || 'username'}
                            </p>
                            <InputError message={profileErrors.username} />
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
                            <InputError message={profileErrors.email} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
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
                            <InputError message={profileErrors.bio} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="profile_photo_path">Foto Profil</Label>
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
                                    alt="Foto profil saat ini"
                                    className="h-20 w-20 rounded-lg border object-cover"
                                />
                            )}
                            <InputError
                                message={profileErrors.profile_photo_path}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="banner_photo_path">Foto Banner</Label>
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
                                    alt="Banner saat ini"
                                    className="h-24 w-full rounded-lg border object-cover"
                                />
                            )}
                            <InputError
                                message={profileErrors.banner_photo_path}
                            />
                        </div>

                        {mustVerifyEmail && profile.email_verified_at === null && (
                            <p className="text-sm text-slate-600 md:col-span-2">
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

                        <DialogFooter className="md:col-span-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setProfileModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={profileProcessing}>
                                {profileProcessing ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <SaveIcon className="size-4" />
                                )}
                                Simpan Profil
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={selectedTwibbonDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedTwibbonDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus twibbon ini?</DialogTitle>
                        <DialogDescription>
                            Twibbon yang dihapus tidak bisa dikembalikan.
                            Tindakan ini juga menghapus data terkait.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedTwibbonDelete(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDeleteTwibbon}
                            disabled={
                                selectedTwibbonDelete !== null
                                && deletingTwibbonId === selectedTwibbonDelete.id
                            }
                        >
                            {selectedTwibbonDelete !== null
                                && deletingTwibbonId === selectedTwibbonDelete.id
                                && <Spinner className="size-4" />}
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={editShortLinkModalOpen}
                onOpenChange={(open) => {
                    setEditShortLinkModalOpen(open);

                    if (!open) {
                        setEditingShortLinkTarget(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Shortlink</DialogTitle>
                        <DialogDescription>
                            Perbarui slug, tujuan URL, dan status aktif link.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditShortLinkSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-shortlink-label">
                                Label (opsional)
                            </Label>
                            <Input
                                id="edit-shortlink-label"
                                value={editShortLinkData.label}
                                onChange={(event) =>
                                    setEditShortLinkData(
                                        'label',
                                        event.target.value,
                                    )
                                }
                                placeholder="Contoh: Broadcast Alumni"
                            />
                            <InputError message={editShortLinkErrors.label} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-shortlink-slug">Slug</Label>
                            <Input
                                id="edit-shortlink-slug"
                                value={editShortLinkData.slug}
                                onChange={(event) =>
                                    setEditShortLinkData(
                                        'slug',
                                        event.target.value,
                                    )
                                }
                                placeholder="contoh: osis-smkn6"
                            />
                            <p className="text-xs text-slate-500">
                                URL publik: /
                                {editShortLinkData.slug || 'slug-kamu'}
                            </p>
                            <InputError message={editShortLinkErrors.slug} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-shortlink-target">URL Tujuan</Label>
                            <Input
                                id="edit-shortlink-target"
                                type="url"
                                value={editShortLinkData.target_url}
                                onChange={(event) =>
                                    setEditShortLinkData(
                                        'target_url',
                                        event.target.value,
                                    )
                                }
                                placeholder="https://contoh.com/landing"
                            />
                            <InputError
                                message={editShortLinkErrors.target_url}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="edit-shortlink-active"
                                checked={editShortLinkData.is_active}
                                onCheckedChange={(checked) =>
                                    setEditShortLinkData(
                                        'is_active',
                                        checked === true,
                                    )
                                }
                            />
                            <Label htmlFor="edit-shortlink-active">
                                Link aktif
                            </Label>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditShortLinkModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={editingShortLink}>
                                {editingShortLink ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <SaveIcon className="size-4" />
                                )}
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={selectedShortLinkDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedShortLinkDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus shortlink ini?</DialogTitle>
                        <DialogDescription>
                            Link akan dihapus permanen dan tidak dapat diakses lagi.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedShortLinkDelete(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDeleteShortLink}
                            disabled={
                                selectedShortLinkDelete !== null
                                && deletingShortLinkId === selectedShortLinkDelete.id
                            }
                        >
                            {selectedShortLinkDelete !== null
                                && deletingShortLinkId === selectedShortLinkDelete.id
                                && <Spinner className="size-4" />}
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
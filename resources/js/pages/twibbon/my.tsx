import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BarChart3Icon,
    CalendarClockIcon,
    CheckCircle2Icon,
    Clock3Icon,
    EyeIcon,
    Link2Icon,
    SearchIcon,
    SparklesIcon,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

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
    };
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

export default function TwibbonMine({ filters, stats, twibbons }: Props) {
    const { flash } = usePage<SharedProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
        status: filters.status,
    });
    const [selectedDelete, setSelectedDelete] = useState<TwibbonItem | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        get('/my-twibbon', {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDelete = (twibbon: TwibbonItem) => {
        setSelectedDelete(twibbon);
    };

    const confirmDelete = () => {
        if (!selectedDelete) {
            return;
        }

        setDeletingId(selectedDelete.id);

        router.delete(`/my-twibbon/${selectedDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingId(null);
                setSelectedDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Twibbon Saya" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_8%_16%,#fef3c7_0%,transparent_32%),radial-gradient(circle_at_90%_10%,#dbeafe_0%,transparent_35%),linear-gradient(180deg,#fffcf5_0%,#eef6ff_100%)] px-4 py-6 md:px-8 md:py-10">
                <div className="mx-auto max-w-375 space-y-8">
                    <TwibbonNavbar />

                    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm md:p-10">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div className="space-y-2">
                                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <SparklesIcon className="size-4" />
                                    Ringkasan performa twibbon milikmu
                                </p>
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                                    Twibbon Saya
                                </h1>
                                <p className="max-w-2xl text-sm text-slate-600 md:text-base">
                                    Pantau performa upload, status approval,
                                    dan pertumbuhan penggunaan dari satu tempat.
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

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                                    {stats.approved_twibbons} approved • {stats.pending_twibbons} pending
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
                    </section>

                    <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm backdrop-blur md:p-6">
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-col gap-3 lg:flex-row lg:items-center"
                        >
                            <Input
                                value={data.search}
                                onChange={(event) => setData('search', event.target.value)}
                                placeholder="Cari nama atau deskripsi twibbon..."
                                className="h-11 lg:flex-1"
                            />

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant={data.status === 'all' ? 'default' : 'outline'}
                                    onClick={() => setData('status', 'all')}
                                    className="h-11"
                                >
                                    <BarChart3Icon className="size-4" />
                                    Semua
                                </Button>
                                <Button
                                    type="button"
                                    variant={data.status === 'approved' ? 'default' : 'outline'}
                                    onClick={() => setData('status', 'approved')}
                                    className="h-11"
                                >
                                    <CheckCircle2Icon className="size-4" />
                                    Approved
                                </Button>
                                <Button
                                    type="button"
                                    variant={data.status === 'pending' ? 'default' : 'outline'}
                                    onClick={() => setData('status', 'pending')}
                                    className="h-11"
                                >
                                    <Clock3Icon className="size-4" />
                                    Pending
                                </Button>
                                <Button type="submit" className="h-11 px-5">
                                    {processing ? <Spinner className="size-4" /> : <SearchIcon className="size-4" />}
                                    Filter
                                </Button>
                            </div>
                        </form>

                        {flash?.success && (
                            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                {flash.success}
                            </p>
                        )}

                        {twibbons.data.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Belum ada twibbon ditemukan</CardTitle>
                                    <CardDescription>
                                        Upload twibbon baru atau ubah kata kunci pencarian.
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button asChild variant="outline">
                                        <Link href="/upload">Upload Twibbon Baru</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {twibbons.data.map((twibbon) => (
                                    <Card key={twibbon.id} className="overflow-hidden py-0">
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
                                                    <Badge variant="secondary">Pending</Badge>
                                                )}
                                            </div>
                                            <CardDescription className="line-clamp-2">
                                                {twibbon.description}
                                            </CardDescription>
                                            <p className="text-xs text-slate-500">
                                                Upload: {formatDate(twibbon.created_at)}
                                            </p>
                                        </CardHeader>

                                        <CardContent className="space-y-2 pt-0">
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="rounded-md border bg-slate-50 p-2">
                                                    <p className="text-slate-500">Total Uses</p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {twibbon.uses_count}
                                                    </p>
                                                </div>
                                                <div className="rounded-md border bg-slate-50 p-2">
                                                    <p className="text-slate-500">7 Hari</p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {twibbon.uses_last_7_days_count}
                                                    </p>
                                                </div>
                                                <div className="rounded-md border bg-slate-50 p-2">
                                                    <p className="text-slate-500">Links</p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {twibbon.links_count}
                                                    </p>
                                                </div>
                                                <div className="rounded-md border bg-slate-50 p-2">
                                                    <p className="text-slate-500">Link Clicks</p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {twibbon.link_clicks_count}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="gap-2 pb-5 w-full">
                                            <Button asChild variant="outline" size="sm" className="w-full">
                                                <Link href={`/my-twibbon/${twibbon.id}/edit`}>Edit</Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleDelete(twibbon)}
                                            >
                                                Delete
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {twibbons.links.map((link) => (
                                <Button
                                    key={`${link.label}-${link.url ?? 'null'}`}
                                    asChild={link.url !== null}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={link.url === null}
                                >
                                    {link.url ? (
                                        <Link href={link.url} preserveState preserveScroll>
                                            {sanitizePaginationLabel(link.label)}
                                        </Link>
                                    ) : (
                                        <span>{sanitizePaginationLabel(link.label)}</span>
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
                        <DialogTitle>Hapus Twibbon?</DialogTitle>
                        <DialogDescription>
                            Twibbon akan dihapus permanen dan tidak bisa dikembalikan.
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
                            disabled={
                                selectedDelete !== null
                                && deletingId === selectedDelete.id
                            }
                        >
                            {selectedDelete !== null
                                && deletingId === selectedDelete.id
                                && <Spinner className="size-4" />}
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

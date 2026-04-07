import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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

type TwibbonRow = {
    id: number;
    name: string;
    slug: string;
    description: string;
    preview_url: string;
    custom_url?: string | null;
    creator_name: string;
    is_approved: boolean;
    uses_count: number;
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
};

type Props = {
    filters: {
        search: string;
    };
    twibbons: Paginated<TwibbonRow>;
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

const formatDateTime = (value: string | null): string => {
    if (!value) {
        return '-';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleString('id-ID');
};

export default function AdminTwibbonIndex({ filters, twibbons }: Props) {
    const { flash } = usePage<SharedProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
    });
    const [selectedReject, setSelectedReject] = useState<TwibbonRow | null>(
        null,
    );
    const [selectedDetail, setSelectedDetail] = useState<TwibbonRow | null>(
        null,
    );
    const [activeActionId, setActiveActionId] = useState<number | null>(null);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        get('/dashboard/twibbon', {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const approve = (twibbon: TwibbonRow, closeDetail = false) => {
        setActiveActionId(twibbon.id);

        router.patch(
            `/dashboard/twibbon/${twibbon.id}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (closeDetail) {
                        setSelectedDetail(null);
                    }
                },
                onFinish: () => setActiveActionId(null),
            },
        );
    };

    const openRejectDialog = (twibbon: TwibbonRow, closeDetail = false) => {
        setSelectedReject(twibbon);

        if (closeDetail) {
            setSelectedDetail(null);
        }
    };

    const reject = () => {
        if (!selectedReject) {
            return;
        }

        setActiveActionId(selectedReject.id);

        router.delete(`/dashboard/twibbon/${selectedReject.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setActiveActionId(null);
                setSelectedReject(null);
            },
        });
    };

    return (
        <>
            <Head title="Admin Twibbon" />

            <div className="space-y-6 p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Twibbon Approval</CardTitle>
                        <CardDescription>
                            Kelola twibbon baru, approve yang layak publish, dan
                            reject yang tidak sesuai.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-col gap-2 md:flex-row"
                        >
                            <Input
                                value={data.search}
                                onChange={(event) =>
                                    setData('search', event.target.value)
                                }
                                placeholder="Cari nama twibbon"
                                className="md:max-w-sm"
                            />
                            <Button type="submit" variant="outline">
                                {processing && <Spinner className="size-4" />}
                                Search
                            </Button>
                        </form>

                        {flash?.success && (
                            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                {flash.success}
                            </p>
                        )}

                        {twibbons.data.length === 0 ? (
                            <p className="rounded-md border border-dashed p-6 text-center text-sm text-slate-600">
                                Tidak ada data twibbon.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">
                                                Twibbon Name
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Creator
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {twibbons.data.map((twibbon) => (
                                            <tr
                                                key={twibbon.id}
                                                className="border-t align-middle"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-900">
                                                        {twibbon.name}
                                                    </div>
                                                    <Link
                                                        href={`/twibbon/${twibbon.slug}`}
                                                        className="text-xs text-slate-500 underline"
                                                    >
                                                        /twibbon/{twibbon.slug}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {twibbon.creator_name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {twibbon.is_approved ? (
                                                        <Badge>
                                                            Approved
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setSelectedDetail(
                                                                    twibbon,
                                                                )
                                                            }
                                                        >
                                                            Detail
                                                        </Button>

                                                        {!twibbon.is_approved && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                onClick={() =>
                                                                    approve(
                                                                        twibbon,
                                                                    )
                                                                }
                                                                disabled={
                                                                    activeActionId ===
                                                                    twibbon.id
                                                                }
                                                            >
                                                                {activeActionId ===
                                                                    twibbon.id && (
                                                                    <Spinner className="size-4" />
                                                                )}
                                                                Approve
                                                            </Button>
                                                        )}

                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                openRejectDialog(
                                                                    twibbon,
                                                                )
                                                            }
                                                            disabled={
                                                                activeActionId ===
                                                                twibbon.id
                                                            }
                                                        >
                                                            {activeActionId ===
                                                                twibbon.id && (
                                                                <Spinner className="size-4" />
                                                            )}
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={selectedDetail !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedDetail(null);
                    }
                }}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detail Twibbon</DialogTitle>
                        <DialogDescription>
                            Informasi lengkap twibbon untuk kebutuhan review
                            sebelum approve atau reject.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDetail && (
                        <div className="space-y-4">
                            <div className="overflow-hidden rounded-lg border bg-slate-50">
                                <img
                                    src={selectedDetail.preview_url}
                                    alt={selectedDetail.name}
                                    className="h-64 w-full object-contain"
                                />
                            </div>

                            <div className="grid gap-2 text-sm">
                                <p>
                                    <span className="font-medium text-slate-900">
                                        Nama:
                                    </span>{' '}
                                    {selectedDetail.name}
                                </p>
                                <p>
                                    <span className="font-medium text-slate-900">
                                        Creator:
                                    </span>{' '}
                                    {selectedDetail.creator_name}
                                </p>
                                <p>
                                    <span className="font-medium text-slate-900">
                                        Slug:
                                    </span>{' '}
                                    /twibbon/{selectedDetail.slug}
                                </p>
                                <p>
                                    <span className="font-medium text-slate-900">
                                        Custom URL:
                                    </span>{' '}
                                    {selectedDetail.custom_url
                                        ? `/${selectedDetail.custom_url}`
                                        : '-'}
                                </p>
                                <p>
                                    <span className="font-medium text-slate-900">
                                        Penggunaan:
                                    </span>{' '}
                                    {selectedDetail.uses_count}
                                </p>
                                <p>
                                    <span className="font-medium text-slate-900">
                                        Dibuat:
                                    </span>{' '}
                                    {formatDateTime(selectedDetail.created_at)}
                                </p>
                                <p>
                                    <span className="font-medium text-slate-900">
                                        Status:
                                    </span>{' '}
                                    {selectedDetail.is_approved
                                        ? 'Approved'
                                        : 'Pending'}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-900">
                                    Deskripsi
                                </p>
                                <p className="whitespace-pre-line text-sm text-slate-600">
                                    {selectedDetail.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {selectedDetail.is_approved ? (
                                    <Button asChild variant="outline" size="sm">
                                        <Link
                                            href={`/twibbon/${selectedDetail.slug}`}
                                        >
                                            Buka Halaman Twibbon
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled
                                    >
                                        Belum Dipublish
                                    </Button>
                                )}

                                {!selectedDetail.is_approved && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                            approve(selectedDetail, true)
                                        }
                                        disabled={
                                            activeActionId ===
                                            selectedDetail.id
                                        }
                                    >
                                        {activeActionId ===
                                            selectedDetail.id && (
                                            <Spinner className="size-4" />
                                        )}
                                        Approve
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                        openRejectDialog(selectedDetail, true)
                                    }
                                    disabled={
                                        activeActionId === selectedDetail.id
                                    }
                                >
                                    Reject
                                </Button>

                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedDetail(null)}
                                >
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={selectedReject !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedReject(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Twibbon?</DialogTitle>
                        <DialogDescription>
                            Data twibbon akan dihapus dari katalog dan file frame
                            juga ikut dihapus.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedReject(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={reject}
                            disabled={
                                selectedReject !== null &&
                                activeActionId === selectedReject.id
                            }
                        >
                            {selectedReject !== null &&
                                activeActionId === selectedReject.id && (
                                    <Spinner className="size-4" />
                                )}
                            Ya, Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminTwibbonIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin Twibbon',
            href: '/dashboard/twibbon',
        },
    ],
};

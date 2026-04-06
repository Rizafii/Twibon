import { router, usePage } from '@inertiajs/react';
import {
    CheckCircle2Icon,
    CheckIcon,
    CopyIcon,
    Link2Icon,
    SaveIcon,
} from 'lucide-react';
import {
    useMemo,
    useState,
    type CSSProperties,
    type FormEvent,
    type ReactNode,
} from 'react';
import { useClipboard } from '@/hooks/use-clipboard';
import { login } from '@/routes';
import { Button } from '@/components/ui/button';
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

type SharedProps = {
    auth: {
        user?: {
            id: number;
        } | null;
    };
};

type Props = {
    children?: (openDialog: () => void) => ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

type ShortLinkForm = {
    label: string;
    slug: string;
    target_url: string;
    is_active: boolean;
};

type FormErrors = Partial<Record<keyof ShortLinkForm, string>>;

type CreateShortLinkResponse = {
    message?: string;
    short_link?: {
        id: number;
        label: string | null;
        slug: string;
        target_url: string;
        is_active: boolean;
        public_url: string;
    };
    errors?: Partial<Record<keyof ShortLinkForm, string[]>>;
};

type ConfettiPiece = {
    left: string;
    size: number;
    color: string;
    delay: number;
    duration: number;
    drift: number;
    rotate: number;
};

type ConfettiStyle = CSSProperties & {
    '--shortlink-confetti-x': string;
    '--shortlink-confetti-rotate': string;
};

const DEFAULT_FORM: ShortLinkForm = {
    label: '',
    slug: '',
    target_url: '',
    is_active: true,
};

const CONFETTI_PIECES: ConfettiPiece[] = Array.from(
    { length: 24 },
    (_, index) => {
        const direction = index % 2 === 0 ? 1 : -1;

        return {
            left: `${((index * 17 + 5) % 100).toString()}%`,
            size: 6 + (index % 4) * 2,
            color: `hsl(${(index * 23 + 20) % 360} 90% 58%)`,
            delay: (index % 6) * 0.06,
            duration: 0.9 + (index % 5) * 0.12,
            drift: direction * (14 + (index % 5) * 6),
            rotate: direction * (170 + index * 18),
        };
    },
);

const extractErrors = (payload: CreateShortLinkResponse): FormErrors => {
    const entries = Object.entries(payload.errors ?? {});

    return entries.reduce<FormErrors>((result, [field, messages]) => {
        if (!Array.isArray(messages) || messages.length === 0) {
            return result;
        }

        if (
            field === 'label'
            || field === 'slug'
            || field === 'target_url'
            || field === 'is_active'
        ) {
            result[field] = messages[0];
        }

        return result;
    }, {});
};

export function CreateShortlinkDialog({ children, open, onOpenChange }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [copiedText, copy] = useClipboard();
    const [internalOpen, setInternalOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [successBurstKey, setSuccessBurstKey] = useState(0);
    const [formData, setFormData] = useState<ShortLinkForm>(DEFAULT_FORM);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [createdPublicUrl, setCreatedPublicUrl] = useState('');

    const dialogOpen = open ?? internalOpen;
    const copiedCurrentLink = useMemo(
        () => createdPublicUrl !== '' && copiedText === createdPublicUrl,
        [copiedText, createdPublicUrl],
    );

    const setDialogOpen = (nextOpen: boolean) => {
        if (open === undefined) {
            setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
    };

    const resetForm = () => {
        setFormData(DEFAULT_FORM);
        setFormErrors({});
        setGeneralError(null);
    };

    const openDialog = () => {
        if (!auth.user) {
            router.visit(login());

            return;
        }

        setDialogOpen(true);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        if (!csrfToken) {
            setGeneralError('Token keamanan tidak ditemukan. Muat ulang halaman.');

            return;
        }

        setProcessing(true);
        setGeneralError(null);
        setFormErrors({});

        try {
            const response = await fetch('/my-profile/urls', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(formData),
            });

            const payload = (await response.json()) as CreateShortLinkResponse;

            if (response.status === 422) {
                setFormErrors(extractErrors(payload));

                return;
            }

            if (!response.ok || !payload.short_link?.public_url) {
                setGeneralError(
                    payload.message
                    ?? 'Gagal membuat shortlink. Coba beberapa saat lagi.',
                );

                return;
            }

            setDialogOpen(false);
            resetForm();
            setCreatedPublicUrl(payload.short_link.public_url);
            setSuccessBurstKey((current) => current + 1);
            setSuccessOpen(true);
        } catch {
            setGeneralError('Terjadi gangguan jaringan. Silakan coba lagi.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            {children ? children(openDialog) : null}

            <Dialog
                open={dialogOpen}
                onOpenChange={(nextOpen) => {
                    setDialogOpen(nextOpen);

                    if (!nextOpen) {
                        resetForm();
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Buat Shortlink</DialogTitle>
                        <DialogDescription>
                            Buat URL pendek private dari navbar tanpa perlu buka
                            halaman profil.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="shortlink-label">Label (opsional)</Label>
                            <Input
                                id="shortlink-label"
                                value={formData.label}
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        label: event.target.value,
                                    }))
                                }
                                placeholder="Contoh: Broadcast Alumni"
                            />
                            {formErrors.label && (
                                <p className="text-sm text-red-600">{formErrors.label}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="shortlink-slug">Slug</Label>
                            <Input
                                id="shortlink-slug"
                                value={formData.slug}
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        slug: event.target.value,
                                    }))
                                }
                                placeholder="contoh: osis-smkn6"
                            />
                            <p className="text-xs text-slate-500">
                                URL publik: /{formData.slug || 'slug-kamu'}
                            </p>
                            {formErrors.slug && (
                                <p className="text-sm text-red-600">{formErrors.slug}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="shortlink-target-url">URL Tujuan</Label>
                            <Input
                                id="shortlink-target-url"
                                type="url"
                                value={formData.target_url}
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        target_url: event.target.value,
                                    }))
                                }
                                placeholder="https://contoh.com/landing"
                            />
                            {formErrors.target_url && (
                                <p className="text-sm text-red-600">
                                    {formErrors.target_url}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="shortlink-active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) =>
                                    setFormData((current) => ({
                                        ...current,
                                        is_active: checked === true,
                                    }))
                                }
                            />
                            <Label htmlFor="shortlink-active">Link aktif</Label>
                        </div>

                        {generalError && (
                            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {generalError}
                            </p>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <SaveIcon className="size-4" />
                                )}
                                Simpan Shortlink
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
                <DialogContent className="overflow-hidden sm:max-w-md">
                    <div
                        key={successBurstKey}
                        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
                    >
                        {CONFETTI_PIECES.map((piece, index) => {
                            const confettiStyle: ConfettiStyle = {
                                left: piece.left,
                                top: '-12px',
                                width: `${piece.size}px`,
                                height: `${Math.max(4, Math.round(piece.size * 0.55))}px`,
                                backgroundColor: piece.color,
                                animation: `shortlink-confetti-fall ${piece.duration}s cubic-bezier(0.18, 0.82, 0.32, 1) ${piece.delay}s forwards`,
                                '--shortlink-confetti-x': `${piece.drift}px`,
                                '--shortlink-confetti-rotate': `${piece.rotate}deg`,
                            };

                            return (
                                <span
                                    key={`${piece.left}-${index.toString()}`}
                                    className="absolute rounded-sm opacity-0"
                                    style={confettiStyle}
                                />
                            );
                        })}
                    </div>

                    <DialogHeader className="relative z-10 text-center sm:text-center">
                        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle2Icon className="size-8" />
                        </div>
                        <DialogTitle className="text-xl">
                            Shortlink Berhasil Dibuat
                        </DialogTitle>
                        <DialogDescription>
                            Link kamu siap dibagikan. Gunakan tombol salin agar
                            cepat dipaste ke chat atau caption.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative z-10 space-y-3">
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-1 text-xs font-medium text-slate-500">
                                URL Shortlink
                            </p>
                            <p className="break-all text-sm text-slate-900">
                                {createdPublicUrl}
                            </p>
                        </div>

                        <DialogFooter className="sm:justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={async () => {
                                    if (createdPublicUrl === '') {
                                        return;
                                    }

                                    await copy(createdPublicUrl);
                                }}
                            >
                                {copiedCurrentLink ? (
                                    <CheckIcon className="size-4" />
                                ) : (
                                    <CopyIcon className="size-4" />
                                )}
                                {copiedCurrentLink ? 'Tersalin' : 'Salin Link'}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setSuccessOpen(false);
                                }}
                            >
                                <Link2Icon className="size-4" />
                                Selesai
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <style>{`
                @keyframes shortlink-confetti-fall {
                    0% {
                        opacity: 0;
                        transform: translate3d(0, -20px, 0) rotate(0deg) scale(0.82);
                    }
                    14% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                        transform: translate3d(var(--shortlink-confetti-x), 260px, 0) rotate(var(--shortlink-confetti-rotate)) scale(1);
                    }
                }
            `}</style>
        </>
    );
}
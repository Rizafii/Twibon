import { router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2Icon, UploadIcon } from 'lucide-react';
import {
    useRef,
    useState,
    type CSSProperties,
    type FormEvent,
    type ReactNode,
} from 'react';
import { login } from '@/routes';
import { Button } from '@/components/ui/button';
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
    public_domain: string;
};

type UploadForm = {
    name: string;
    description: string;
    custom_url: string;
    frame: File | null;
};

type Props = {
    children?: (openDialog: () => void) => ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
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
    '--upload-confetti-x': string;
    '--upload-confetti-rotate': string;
};

const CONFETTI_PIECES: ConfettiPiece[] = Array.from(
    { length: 22 },
    (_, index) => {
        const direction = index % 2 === 0 ? 1 : -1;

        return {
            left: `${((index * 19 + 7) % 100).toString()}%`,
            size: 6 + (index % 4) * 2,
            color: `hsl(${(index * 26 + 30) % 360} 90% 58%)`,
            delay: (index % 6) * 0.06,
            duration: 0.9 + (index % 5) * 0.12,
            drift: direction * (14 + (index % 5) * 6),
            rotate: direction * (180 + index * 18),
        };
    },
);

export function UploadTwibbonDialog({ children, open, onOpenChange }: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [successBurstKey, setSuccessBurstKey] = useState(0);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const { auth, public_domain: publicDomain } = usePage<SharedProps>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<UploadForm>({
            name: '',
            description: '',
            custom_url: '',
            frame: null,
        });

    const buildDisplayUrl = (path: string): string => {
        const normalizedPath = path.trim().replace(/^\/+/, '');

        return normalizedPath === ''
            ? publicDomain
            : `${publicDomain}/${normalizedPath}`;
    };

    const dialogOpen = open ?? internalOpen;

    const setDialogOpen = (nextOpen: boolean) => {
        if (open === undefined) {
            setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
    };

    const resetForm = () => {
        reset();
        clearErrors();

        if (fileRef.current) {
            fileRef.current.value = '';
        }
    };

    const openDialog = () => {
        if (!auth.user) {
            router.visit(login());
            return;
        }

        setDialogOpen(true);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/upload', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                resetForm();
                setSuccessBurstKey((current) => current + 1);
                setSuccessOpen(true);
            },
        });
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
                        <DialogTitle>Upload Twibbon Baru</DialogTitle>
                        <DialogDescription>
                            Kirim desain PNG rasio 3:4. Demi keamanan, upload dibatasi
                            maksimal 5 kali per menit untuk setiap akun.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="upload-name">Name</Label>
                            <Input
                                id="upload-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Contoh: Hari Kemerdekaan 2026"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="upload-description">Description</Label>
                            <Input
                                id="upload-description"
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                                placeholder="Tuliskan tujuan kampanye atau event"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="upload-custom-url">
                                Custom URL (opsional)
                            </Label>
                            <Input
                                id="upload-custom-url"
                                value={data.custom_url}
                                onChange={(event) =>
                                    setData('custom_url', event.target.value)
                                }
                                placeholder="contoh: osis-smkn6"
                            />
                            <p className="text-xs text-slate-500">
                                URL publik: {buildDisplayUrl(data.custom_url || 'custom-url-kamu')}
                            </p>
                            {errors.custom_url && (
                                <p className="text-sm text-red-600">
                                    {errors.custom_url}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="upload-frame">
                                Upload PNG Frame (Rasio 3:4)
                            </Label>
                            <Input
                                id="upload-frame"
                                ref={fileRef}
                                type="file"
                                accept="image/png"
                                onChange={(event) =>
                                    setData('frame', event.target.files?.[0] ?? null)
                                }
                            />
                            <p className="text-xs text-slate-500">
                                Contoh ukuran valid: 1080x1440, 900x1200, 1500x2000.
                            </p>
                            {errors.frame && (
                                <p className="text-sm text-red-600">{errors.frame}</p>
                            )}
                        </div>

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
                                    <UploadIcon className="size-4" />
                                )}
                                Submit Twibbon
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
                                animation: `upload-confetti-fall ${piece.duration}s cubic-bezier(0.18, 0.82, 0.32, 1) ${piece.delay}s forwards`,
                                '--upload-confetti-x': `${piece.drift}px`,
                                '--upload-confetti-rotate': `${piece.rotate}deg`,
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
                        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
                            <CheckCircle2Icon className="size-8" />
                        </div>
                        <DialogTitle className="text-xl">
                            Twibbon Berhasil Diupload
                        </DialogTitle>
                        <DialogDescription>
                            Upload berhasil. Tunggu admin sampai menyetujui
                            twibbon kamu ya.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="relative z-10 sm:justify-center">
                        <Button type="button" onClick={() => setSuccessOpen(false)}>
                            Oke, Mengerti
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style>{`
                @keyframes upload-confetti-fall {
                    0% {
                        opacity: 0;
                        transform: translate3d(0, -20px, 0) rotate(0deg) scale(0.84);
                    }
                    14% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                        transform: translate3d(var(--upload-confetti-x), 260px, 0) rotate(var(--upload-confetti-rotate)) scale(1);
                    }
                }
            `}</style>
        </>
    );
}

import { router, useForm, usePage } from '@inertiajs/react';
import { UploadIcon } from 'lucide-react';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
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
};

type UploadForm = {
    name: string;
    description: string;
    frame: File | null;
};

type Props = {
    children?: (openDialog: () => void) => ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function UploadTwibbonDialog({ children, open, onOpenChange }: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const { auth } = usePage<SharedProps>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<UploadForm>({
            name: '',
            description: '',
            frame: null,
        });

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
        </>
    );
}

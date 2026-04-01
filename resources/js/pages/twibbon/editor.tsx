import { Head, Link } from '@inertiajs/react';
import { DownloadIcon, ImagePlusIcon } from 'lucide-react';
import type { ChangeEvent, PointerEvent } from 'react';
import {
    useEffect,
    useRef,
    useState,
} from 'react';
import { TwibbonFooter } from '@/components/twibbon-footer';
import { TwibbonNavbar } from '@/components/twibbon-navbar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    twibbon: {
        id: number;
        name: string;
        slug: string;
        frame_url: string;
    };
};

const TWIBBON_RATIO = 3 / 4;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

type Offset = {
    x: number;
    y: number;
};

type CanvasBounds = {
    drawWidth: number;
    drawHeight: number;
    maxOffsetX: number;
    maxOffsetY: number;
};

const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load image'));
        image.src = src;
    });

export default function TwibbonEditor({ twibbon }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const dragRef = useRef<{
        active: boolean;
        pointerId: number | null;
        lastX: number;
        lastY: number;
    }>({
        active: false,
        pointerId: null,
        lastX: 0,
        lastY: 0,
    });

    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
    const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(MIN_ZOOM);
    const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [canvasReady, setCanvasReady] = useState(false);
    const [frameError, setFrameError] = useState<string | null>(null);
    const [editorError, setEditorError] = useState<string | null>(null);

    const getBoundsForZoom = (zoomValue: number): CanvasBounds | null => {
        const canvas = canvasRef.current;

        if (!canvas || !frameImage || !userImage) {
            return null;
        }

        const baseScale = Math.max(
            canvas.width / userImage.width,
            canvas.height / userImage.height,
        );
        const finalScale = baseScale * zoomValue;

        const drawWidth = userImage.width * finalScale;
        const drawHeight = userImage.height * finalScale;

        return {
            drawWidth,
            drawHeight,
            maxOffsetX: Math.max(0, (drawWidth - canvas.width) / 2),
            maxOffsetY: Math.max(0, (drawHeight - canvas.height) / 2),
        };
    };

    const bounds = getBoundsForZoom(zoom);

    const maxOffsetX = bounds?.maxOffsetX ?? 0;
    const maxOffsetY = bounds?.maxOffsetY ?? 0;

    const syncOffsetToBounds = (nextZoom: number) => {
        setOffset((current) => {
            const nextBounds = getBoundsForZoom(nextZoom);

            if (!nextBounds) {
                return current;
            }

            return {
                x: clamp(current.x, -nextBounds.maxOffsetX, nextBounds.maxOffsetX),
                y: clamp(current.y, -nextBounds.maxOffsetY, nextBounds.maxOffsetY),
            };
        });
    };

    const resetEditorPosition = () => {
        setZoom(MIN_ZOOM);
        setOffset({ x: 0, y: 0 });
    };

    useEffect(() => {
        return () => {
            if (photoUrl) {
                URL.revokeObjectURL(photoUrl);
            }
        };
    }, [photoUrl]);

    useEffect(() => {
        let cancelled = false;

        const setupFrame = async () => {
            setIsRendering(true);

            try {
                const nextFrameImage = await loadImage(twibbon.frame_url);

                if (cancelled) {
                    return;
                }

                const frameRatio = nextFrameImage.width / nextFrameImage.height;

                if (Math.abs(frameRatio - TWIBBON_RATIO) > 0.01) {
                    setFrameError('Frame twibbon tidak valid. Rasio wajib 3:4.');
                    setFrameImage(null);
                    setCanvasReady(false);

                    return;
                }

                const canvas = canvasRef.current;

                if (!canvas) {
                    return;
                }

                canvas.width = nextFrameImage.width;
                canvas.height = nextFrameImage.height;

                setFrameError(null);
                setFrameImage(nextFrameImage);
            } catch {
                setFrameError('Gagal memuat frame twibbon. Coba refresh halaman.');
                setFrameImage(null);
                setCanvasReady(false);
            } finally {
                if (!cancelled) {
                    setIsRendering(false);
                }
            }
        };

        void setupFrame();

        return () => {
            cancelled = true;
        };
    }, [twibbon.frame_url]);

    useEffect(() => {
        if (!photoUrl) {
            setCanvasReady(false);
            setUserImage(null);
            setEditorError(null);
            setZoom(MIN_ZOOM);
            setOffset({ x: 0, y: 0 });

            return;
        }

        let cancelled = false;

        const loadUserImage = async () => {
            setIsRendering(true);
            setEditorError(null);

            try {
                const nextUserImage = await loadImage(photoUrl);

                if (cancelled) {
                    return;
                }

                setUserImage(nextUserImage);
                setZoom(MIN_ZOOM);
                setOffset({ x: 0, y: 0 });
            } catch {
                setEditorError('Gagal memproses gambar. Coba file lain.');
                setCanvasReady(false);
            } finally {
                if (!cancelled) {
                    setIsRendering(false);
                }
            }
        };

        void loadUserImage();

        return () => {
            cancelled = true;
        };
    }, [photoUrl]);

    useEffect(() => {
        if (!frameImage || !userImage || !bounds) {
            return;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const context = canvas.getContext('2d');

        if (!context) {
            setEditorError('Canvas tidak tersedia di browser ini.');
            setCanvasReady(false);

            return;
        }

        const clampedOffsetX = clamp(offset.x, -bounds.maxOffsetX, bounds.maxOffsetX);
        const clampedOffsetY = clamp(offset.y, -bounds.maxOffsetY, bounds.maxOffsetY);

        if (
            Math.abs(clampedOffsetX - offset.x) > 0.1
            || Math.abs(clampedOffsetY - offset.y) > 0.1
        ) {
            setOffset({ x: clampedOffsetX, y: clampedOffsetY });

            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        const drawX = (canvas.width - bounds.drawWidth) / 2 + clampedOffsetX;
        const drawY = (canvas.height - bounds.drawHeight) / 2 + clampedOffsetY;

        context.drawImage(userImage, drawX, drawY, bounds.drawWidth, bounds.drawHeight);
        context.drawImage(frameImage, 0, 0, canvas.width, canvas.height);

        setCanvasReady(true);
    }, [frameImage, userImage, bounds, offset.x, offset.y]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setEditorError('File harus berupa gambar.');

            return;
        }

        const nextPhotoUrl = URL.createObjectURL(file);
        setCanvasReady(false);
        setEditorError(null);

        dragRef.current.active = false;
        dragRef.current.pointerId = null;
        setIsDragging(false);

        setPhotoUrl((current) => {
            if (current) {
                URL.revokeObjectURL(current);
            }

            return nextPhotoUrl;
        });
    };

    const handleZoomChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextZoom = Number(event.target.value);

        setZoom(nextZoom);
        syncOffsetToBounds(nextZoom);
    };

    const handleOffsetXChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextOffsetX = Number(event.target.value);

        setOffset((current) => ({
            ...current,
            x: clamp(nextOffsetX, -maxOffsetX, maxOffsetX),
        }));
    };

    const handleOffsetYChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextOffsetY = Number(event.target.value);

        setOffset((current) => ({
            ...current,
            y: clamp(nextOffsetY, -maxOffsetY, maxOffsetY),
        }));
    };

    const stopDragging = () => {
        dragRef.current.active = false;
        dragRef.current.pointerId = null;
        setIsDragging(false);
    };

    const handleCanvasPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
        if (!userImage || !bounds) {
            return;
        }

        dragRef.current.active = true;
        dragRef.current.pointerId = event.pointerId;
        dragRef.current.lastX = event.clientX;
        dragRef.current.lastY = event.clientY;
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsDragging(true);
    };

    const handleCanvasPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
        if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId || !bounds) {
            return;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const rect = canvas.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
            return;
        }

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const deltaX = (event.clientX - dragRef.current.lastX) * scaleX;
        const deltaY = (event.clientY - dragRef.current.lastY) * scaleY;

        dragRef.current.lastX = event.clientX;
        dragRef.current.lastY = event.clientY;

        setOffset((current) => ({
            x: clamp(current.x + deltaX, -bounds.maxOffsetX, bounds.maxOffsetX),
            y: clamp(current.y + deltaY, -bounds.maxOffsetY, bounds.maxOffsetY),
        }));
    };

    const handleCanvasPointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
        if (dragRef.current.pointerId !== null) {
            try {
                event.currentTarget.releasePointerCapture(dragRef.current.pointerId);
            } catch {
                // Ignore capture release errors when pointer capture is already gone.
            }
        }

        stopDragging();
    };

    const activeError = frameError ?? editorError;

    const handleDownload = async () => {
        const canvas = canvasRef.current;

        if (!canvas || !canvasReady) {
            return;
        }

        setIsDownloading(true);

        try {
            const csrfToken = (
                document.querySelector(
                    'meta[name="csrf-token"]',
                ) as HTMLMetaElement | null
            )?.content;

            await fetch(`/editor/${twibbon.slug}/usage`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken ?? '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({}),
            });

            const downloadLink = document.createElement('a');
            downloadLink.href = canvas.toDataURL('image/png');
            downloadLink.download = `${twibbon.slug}-result.png`;
            downloadLink.click();
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <Head title={`Editor - ${twibbon.name}`} />

            <div className="min-h-screen bg-[linear-gradient(180deg,#fffdfa_0%,#eef8ff_100%)] px-4 py-8 md:px-8 md:py-12">
                <div className="mx-auto max-w-6xl space-y-6">
                    <TwibbonNavbar />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                                Editor Twibbon
                            </h1>
                            <p className="text-sm text-slate-600">
                                {twibbon.name}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href="/catalog">
                                    Kembali ke katalog
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview Hasil</CardTitle>
                                <CardDescription>
                                    Upload foto, lalu atur zoom dan posisi langsung
                                    di canvas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative overflow-hidden rounded-xl border bg-slate-100 p-3">
                                    <canvas
                                        ref={canvasRef}
                                        onPointerDown={handleCanvasPointerDown}
                                        onPointerMove={handleCanvasPointerMove}
                                        onPointerUp={handleCanvasPointerUp}
                                        onPointerCancel={handleCanvasPointerUp}
                                        className={`mx-auto w-full max-w-140 rounded-lg bg-white touch-none ${
                                            userImage
                                                ? isDragging
                                                    ? 'cursor-grabbing'
                                                    : 'cursor-grab'
                                                : ''
                                        }`}
                                    />

                                    {!photoUrl && (
                                        <div className="absolute inset-3 grid place-items-center rounded-lg border border-dashed bg-white/90 p-6 text-center">
                                            <div className="space-y-2">
                                                <p className="font-medium text-slate-800">
                                                    Belum ada foto pengguna
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    Pilih gambar terlebih dahulu untuk
                                                    memulai editor.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pengaturan</CardTitle>
                                <CardDescription>
                                    Frame twibbon wajib rasio 3:4. Format foto
                                    terbaik: 1:1 agar pas dengan frame.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="photo">Upload Foto</Label>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="zoom">Zoom Foto</Label>
                                        <span className="text-xs text-slate-500">
                                            {Math.round(zoom * 100)}%
                                        </span>
                                    </div>
                                    <Input
                                        id="zoom"
                                        type="range"
                                        min={MIN_ZOOM}
                                        max={MAX_ZOOM}
                                        step={0.01}
                                        value={zoom}
                                        onChange={handleZoomChange}
                                        disabled={!userImage || !bounds}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="positionX">
                                            Geser Horizontal
                                        </Label>
                                        <span className="text-xs text-slate-500">
                                            {Math.round(offset.x)}
                                        </span>
                                    </div>
                                    <Input
                                        id="positionX"
                                        type="range"
                                        min={-maxOffsetX}
                                        max={maxOffsetX}
                                        step={1}
                                        value={offset.x}
                                        onChange={handleOffsetXChange}
                                        disabled={!userImage || maxOffsetX === 0}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="positionY">
                                            Geser Vertikal
                                        </Label>
                                        <span className="text-xs text-slate-500">
                                            {Math.round(offset.y)}
                                        </span>
                                    </div>
                                    <Input
                                        id="positionY"
                                        type="range"
                                        min={-maxOffsetY}
                                        max={maxOffsetY}
                                        step={1}
                                        value={offset.y}
                                        onChange={handleOffsetYChange}
                                        disabled={!userImage || maxOffsetY === 0}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={resetEditorPosition}
                                    disabled={!userImage}
                                >
                                    Reset Zoom & Posisi
                                </Button>

                                <p className="text-xs text-slate-500">
                                    Tip: kamu bisa drag langsung gambar di canvas
                                    untuk atur posisi.
                                </p>

                                {activeError && (
                                    <p className="text-sm text-red-600">
                                        {activeError}
                                    </p>
                                )}
                            </CardContent>

                            <CardFooter>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="w-full"
                                    disabled={!canvasReady || isRendering || isDownloading || !!frameError}
                                    onClick={handleDownload}
                                >
                                    {isRendering || isDownloading ? (
                                        <Spinner className="size-4" />
                                    ) : canvasReady ? (
                                        <DownloadIcon className="size-4" />
                                    ) : (
                                        <ImagePlusIcon className="size-4" />
                                    )}
                                    Download Result
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                <TwibbonFooter />
            </div>
        </>
    );
}

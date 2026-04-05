import { Head } from '@inertiajs/react';
import { DownloadIcon, ImagePlusIcon, Share2Icon } from 'lucide-react';
import type {
    ChangeEvent,
    CSSProperties,
    PointerEvent,
    WheelEvent,
} from 'react';
import { useEffect, useRef, useState } from 'react';
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

type ConfettiPiece = {
    left: string;
    size: number;
    hue: number;
    delay: number;
    duration: number;
    drift: number;
    rotate: number;
};

type ConfettiStyle = CSSProperties & {
    '--confetti-x': string;
    '--confetti-rotate': string;
};

const CONFETTI_PIECES: ConfettiPiece[] = Array.from(
    { length: 26 },
    (_, index) => {
        const direction = index % 2 === 0 ? 1 : -1;

        return {
            left: `${((index * 17 + 11) % 100).toString()}%`,
            size: 6 + (index % 4) * 2,
            hue: (index * 29 + 35) % 360,
            delay: (index % 7) * 0.05,
            duration: 0.9 + (index % 5) * 0.14,
            drift: direction * (16 + (index % 6) * 8),
            rotate: direction * (180 + index * 20),
        };
    },
);

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
    const pointersRef = useRef<Map<number, Offset>>(new Map());
    const pinchRef = useRef<{
        active: boolean;
        distance: number;
        center: Offset;
    }>({
        active: false,
        distance: 0,
        center: { x: 0, y: 0 },
    });
    const interactionRef = useRef<{
        zoom: number;
        offset: Offset;
    }>({
        zoom: MIN_ZOOM,
        offset: { x: 0, y: 0 },
    });

    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
    const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(MIN_ZOOM);
    const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [canvasReady, setCanvasReady] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [shareFeedback, setShareFeedback] = useState<string | null>(null);
    const [confettiBurstKey, setConfettiBurstKey] = useState(0);
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

    const clampOffsetToBounds = (
        nextOffset: Offset,
        nextBounds: CanvasBounds | null,
    ): Offset => {
        if (!nextBounds) {
            return nextOffset;
        }

        return {
            x: clamp(
                nextOffset.x,
                -nextBounds.maxOffsetX,
                nextBounds.maxOffsetX,
            ),
            y: clamp(
                nextOffset.y,
                -nextBounds.maxOffsetY,
                nextBounds.maxOffsetY,
            ),
        };
    };

    const getCanvasPointFromClient = (
        clientX: number,
        clientY: number,
    ): Offset | null => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return null;
        }

        const rect = canvas.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
            return null;
        }

        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const getPinchMetrics = (): { distance: number; center: Offset } | null => {
        const points = [...pointersRef.current.values()];

        if (points.length !== 2) {
            return null;
        }

        const [firstPoint, secondPoint] = points;
        const deltaX = secondPoint.x - firstPoint.x;
        const deltaY = secondPoint.y - firstPoint.y;

        return {
            distance: Math.hypot(deltaX, deltaY),
            center: {
                x: (firstPoint.x + secondPoint.x) / 2,
                y: (firstPoint.y + secondPoint.y) / 2,
            },
        };
    };

    const getOffsetForZoomAtPoint = (
        fromZoom: number,
        toZoom: number,
        fromOffset: Offset,
        anchor: Offset,
    ): Offset => {
        const canvas = canvasRef.current;
        const fromBounds = getBoundsForZoom(fromZoom);
        const toBounds = getBoundsForZoom(toZoom);

        if (!canvas || !fromBounds || !toBounds) {
            return fromOffset;
        }

        const fromDrawX =
            (canvas.width - fromBounds.drawWidth) / 2 + fromOffset.x;
        const fromDrawY =
            (canvas.height - fromBounds.drawHeight) / 2 + fromOffset.y;

        const relativeX = (anchor.x - fromDrawX) / fromBounds.drawWidth;
        const relativeY = (anchor.y - fromDrawY) / fromBounds.drawHeight;

        return clampOffsetToBounds(
            {
                x:
                    anchor.x -
                    (canvas.width - toBounds.drawWidth) / 2 -
                    relativeX * toBounds.drawWidth,
                y:
                    anchor.y -
                    (canvas.height - toBounds.drawHeight) / 2 -
                    relativeY * toBounds.drawHeight,
            },
            toBounds,
        );
    };

    const resetEditorPosition = () => {
        interactionRef.current = {
            zoom: MIN_ZOOM,
            offset: { x: 0, y: 0 },
        };
        setZoom(MIN_ZOOM);
        setOffset({ x: 0, y: 0 });
    };

    useEffect(() => {
        interactionRef.current = { zoom, offset };
    }, [zoom, offset]);

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
                    setFrameError(
                        'Frame twibbon tidak valid. Rasio wajib 3:4.',
                    );
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
                setFrameError(
                    'Gagal memuat frame twibbon. Coba refresh halaman.',
                );
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
            pointersRef.current.clear();
            pinchRef.current.active = false;
            dragRef.current.active = false;
            dragRef.current.pointerId = null;
            setIsDragging(false);
            interactionRef.current = {
                zoom: MIN_ZOOM,
                offset: { x: 0, y: 0 },
            };
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
                interactionRef.current = {
                    zoom: MIN_ZOOM,
                    offset: { x: 0, y: 0 },
                };
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

        const clampedOffsetX = clamp(
            offset.x,
            -bounds.maxOffsetX,
            bounds.maxOffsetX,
        );
        const clampedOffsetY = clamp(
            offset.y,
            -bounds.maxOffsetY,
            bounds.maxOffsetY,
        );

        if (
            Math.abs(clampedOffsetX - offset.x) > 0.1 ||
            Math.abs(clampedOffsetY - offset.y) > 0.1
        ) {
            const clampedOffset = { x: clampedOffsetX, y: clampedOffsetY };
            interactionRef.current = {
                ...interactionRef.current,
                offset: clampedOffset,
            };
            setOffset(clampedOffset);

            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        const drawX = (canvas.width - bounds.drawWidth) / 2 + clampedOffsetX;
        const drawY = (canvas.height - bounds.drawHeight) / 2 + clampedOffsetY;

        context.drawImage(
            userImage,
            drawX,
            drawY,
            bounds.drawWidth,
            bounds.drawHeight,
        );
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
        pointersRef.current.clear();
        pinchRef.current.active = false;
        setIsDragging(false);

        setPhotoUrl((current) => {
            if (current) {
                URL.revokeObjectURL(current);
            }

            return nextPhotoUrl;
        });
    };

    const stopDragging = () => {
        dragRef.current.active = false;
        dragRef.current.pointerId = null;
        setIsDragging(false);
    };

    const handleCanvasPointerDown = (
        event: PointerEvent<HTMLCanvasElement>,
    ) => {
        if (!userImage) {
            return;
        }

        const point = getCanvasPointFromClient(event.clientX, event.clientY);

        if (!point) {
            return;
        }

        pointersRef.current.set(event.pointerId, point);
        event.currentTarget.setPointerCapture(event.pointerId);

        if (pointersRef.current.size >= 2) {
            stopDragging();

            const pinchMetrics = getPinchMetrics();

            if (!pinchMetrics || pinchMetrics.distance <= 0) {
                return;
            }

            pinchRef.current.active = true;
            pinchRef.current.distance = pinchMetrics.distance;
            pinchRef.current.center = pinchMetrics.center;

            return;
        }

        pinchRef.current.active = false;
        dragRef.current.active = true;
        dragRef.current.pointerId = event.pointerId;
        dragRef.current.lastX = point.x;
        dragRef.current.lastY = point.y;
        setIsDragging(true);
    };

    const handleCanvasPointerMove = (
        event: PointerEvent<HTMLCanvasElement>,
    ) => {
        if (!pointersRef.current.has(event.pointerId) || !userImage) {
            return;
        }

        const point = getCanvasPointFromClient(event.clientX, event.clientY);

        if (!point) {
            return;
        }

        pointersRef.current.set(event.pointerId, point);

        if (pinchRef.current.active && pointersRef.current.size >= 2) {
            const pinchMetrics = getPinchMetrics();

            if (!pinchMetrics || pinchMetrics.distance <= 0) {
                return;
            }

            const currentZoom = interactionRef.current.zoom;
            const zoomRatio = pinchMetrics.distance / pinchRef.current.distance;
            const nextZoom = clamp(currentZoom * zoomRatio, MIN_ZOOM, MAX_ZOOM);

            let nextOffset = interactionRef.current.offset;

            if (Math.abs(nextZoom - currentZoom) > 0.0001) {
                nextOffset = getOffsetForZoomAtPoint(
                    currentZoom,
                    nextZoom,
                    nextOffset,
                    pinchMetrics.center,
                );
            }

            const nextBounds = getBoundsForZoom(nextZoom);
            nextOffset = clampOffsetToBounds(
                {
                    x:
                        nextOffset.x +
                        (pinchMetrics.center.x - pinchRef.current.center.x),
                    y:
                        nextOffset.y +
                        (pinchMetrics.center.y - pinchRef.current.center.y),
                },
                nextBounds,
            );

            interactionRef.current = {
                zoom: nextZoom,
                offset: nextOffset,
            };
            setZoom(nextZoom);
            setOffset(nextOffset);

            pinchRef.current.distance = pinchMetrics.distance;
            pinchRef.current.center = pinchMetrics.center;

            return;
        }

        if (
            !dragRef.current.active ||
            dragRef.current.pointerId !== event.pointerId
        ) {
            return;
        }

        const currentZoom = interactionRef.current.zoom;
        const currentBounds = getBoundsForZoom(currentZoom);

        if (!currentBounds) {
            return;
        }

        const deltaX = point.x - dragRef.current.lastX;
        const deltaY = point.y - dragRef.current.lastY;

        dragRef.current.lastX = point.x;
        dragRef.current.lastY = point.y;

        const nextOffset = clampOffsetToBounds(
            {
                x: interactionRef.current.offset.x + deltaX,
                y: interactionRef.current.offset.y + deltaY,
            },
            currentBounds,
        );

        interactionRef.current = {
            ...interactionRef.current,
            offset: nextOffset,
        };
        setOffset(nextOffset);
    };

    const handleCanvasWheel = (event: WheelEvent<HTMLCanvasElement>) => {
        if (!userImage || !bounds) {
            return;
        }

        event.preventDefault();

        const anchor = getCanvasPointFromClient(event.clientX, event.clientY);

        if (!anchor) {
            return;
        }

        const currentZoom = interactionRef.current.zoom;
        const sensitivity = event.ctrlKey ? 0.004 : 0.002;
        const nextZoom = clamp(
            currentZoom - event.deltaY * sensitivity,
            MIN_ZOOM,
            MAX_ZOOM,
        );

        if (Math.abs(nextZoom - currentZoom) < 0.0001) {
            return;
        }

        const nextOffset = getOffsetForZoomAtPoint(
            currentZoom,
            nextZoom,
            interactionRef.current.offset,
            anchor,
        );

        interactionRef.current = {
            zoom: nextZoom,
            offset: nextOffset,
        };
        setZoom(nextZoom);
        setOffset(nextOffset);
    };

    const handleCanvasPointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
        try {
            event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
            // Ignore capture release errors when pointer capture is already gone.
        }

        pointersRef.current.delete(event.pointerId);

        if (pointersRef.current.size < 2) {
            pinchRef.current.active = false;
        }

        if (pointersRef.current.size === 1) {
            const [remainingPointerId, remainingPoint] = [
                ...pointersRef.current.entries(),
            ][0];

            dragRef.current.active = true;
            dragRef.current.pointerId = remainingPointerId;
            dragRef.current.lastX = remainingPoint.x;
            dragRef.current.lastY = remainingPoint.y;
            setIsDragging(true);

            return;
        }

        pointersRef.current.clear();

        stopDragging();
    };

    const activeError = frameError ?? editorError;

    const downloadImageDataUrl = (dataUrl: string) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = `${twibbon.slug}-result.png`;
        downloadLink.click();
    };

    const handleDownloadFromPreview = () => {
        if (!previewImageUrl) {
            return;
        }

        downloadImageDataUrl(previewImageUrl);
    };

    const handleSharePreview = async () => {
        if (!previewImageUrl) {
            return;
        }

        setIsSharing(true);
        setShareFeedback(null);

        try {
            if (navigator.share) {
                const previewResponse = await fetch(previewImageUrl);
                const previewBlob = await previewResponse.blob();
                const previewFile = new File(
                    [previewBlob],
                    `${twibbon.slug}-result.png`,
                    { type: 'image/png' },
                );

                const canShareFiles =
                    typeof navigator.canShare === 'function' &&
                    navigator.canShare({ files: [previewFile] });

                if (canShareFiles) {
                    await navigator.share({
                        title: `Hasil ${twibbon.name}`,
                        text: 'Lihat hasil twibbon saya',
                        files: [previewFile],
                    });

                    setShareFeedback('Berhasil membuka panel bagikan.');

                    return;
                }

                await navigator.share({
                    title: `Hasil ${twibbon.name}`,
                    text: 'Lihat hasil twibbon saya',
                    url: window.location.href,
                });

                setShareFeedback('Berhasil membuka panel bagikan.');

                return;
            }

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(window.location.href);
                setShareFeedback('Link halaman editor disalin.');

                return;
            }

            setShareFeedback('Browser belum mendukung fitur bagikan otomatis.');
        } catch {
            setShareFeedback('Aksi bagikan dibatalkan atau gagal.');
        } finally {
            setIsSharing(false);
        }
    };

    const handleDownload = async () => {
        const canvas = canvasRef.current;

        if (!canvas || !canvasReady) {
            return;
        }

        setIsDownloading(true);

        try {
            const resultImageUrl = canvas.toDataURL('image/png');
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

            setPreviewImageUrl(resultImageUrl);
            setShareFeedback(null);
            setConfettiBurstKey((current) => current + 1);
            setPreviewOpen(true);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <Head title={`Editor - ${twibbon.name}`} />

            <div className="min-h-screen bg-[linear-gradient(180deg,#fffdfa_0%,#eef8ff_100%)] px-4 py-8 md:px-8 md:py-12">
                <div className="mx-auto max-w-375 space-y-6">
                    <TwibbonNavbar />

                    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_1.8fr]">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview Hasil</CardTitle>
                                <CardDescription>
                                    Upload foto, lalu atur zoom dan posisi
                                    langsung di canvas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative overflow-hidden rounded-xl border bg-slate-100">
                                    <canvas
                                        ref={canvasRef}
                                        onPointerDown={handleCanvasPointerDown}
                                        onPointerMove={handleCanvasPointerMove}
                                        onPointerUp={handleCanvasPointerUp}
                                        onPointerCancel={handleCanvasPointerUp}
                                        onWheel={handleCanvasWheel}
                                        className={`mx-auto w-full max-w-140 touch-none rounded-lg bg-white ${
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
                                                    Pilih gambar terlebih dahulu
                                                    untuk memulai editor.
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
                                    Tip: seret gambar langsung di frame untuk
                                    geser posisi. Zoom bisa dengan cubit layar
                                    sentuh atau scroll mouse/trackpad di
                                    desktop.
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
                                    disabled={
                                        !canvasReady ||
                                        isRendering ||
                                        isDownloading ||
                                        !!frameError
                                    }
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

            <Dialog
                open={previewOpen}
                onOpenChange={(open) => {
                    setPreviewOpen(open);

                    if (!open) {
                        setShareFeedback(null);
                    }
                }}
            >
                <DialogContent className="overflow-hidden sm:max-w-xl">
                    <div
                        key={confettiBurstKey}
                        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
                    >
                        {CONFETTI_PIECES.map((piece, index) => {
                            const confettiStyle: ConfettiStyle = {
                                left: piece.left,
                                top: '-14px',
                                width: `${piece.size}px`,
                                height: `${Math.max(4, Math.round(piece.size * 0.55))}px`,
                                backgroundColor: `hsl(${piece.hue} 90% 58%)`,
                                animation: `editor-confetti-fall ${piece.duration}s cubic-bezier(0.16, 0.84, 0.32, 1) ${piece.delay}s forwards`,
                                '--confetti-x': `${piece.drift}px`,
                                '--confetti-rotate': `${piece.rotate}deg`,
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

                    <DialogHeader className="relative z-10">
                        <DialogTitle>Preview Hasil Twibbon</DialogTitle>
                        <DialogDescription>
                            Hasil siap diunduh atau dibagikan langsung.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative z-10 overflow-hidden rounded-xl border bg-slate-50 p-2">
                        {previewImageUrl ? (
                            <img
                                src={previewImageUrl}
                                alt={`Preview hasil ${twibbon.name}`}
                                className="mx-auto max-h-[65vh] w-full rounded-lg object-contain"
                            />
                        ) : (
                            <div className="grid h-72 place-items-center text-sm text-slate-500">
                                Preview belum tersedia.
                            </div>
                        )}
                    </div>

                    {shareFeedback && (
                        <p className="relative z-10 text-sm text-slate-600">
                            {shareFeedback}
                        </p>
                    )}

                    <DialogFooter className="relative z-10 sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDownloadFromPreview}
                            disabled={!previewImageUrl}
                        >
                            <DownloadIcon className="size-4" />
                            Download PNG
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSharePreview}
                            disabled={!previewImageUrl || isSharing}
                        >
                            {isSharing ? (
                                <Spinner className="size-4" />
                            ) : (
                                <Share2Icon className="size-4" />
                            )}
                            Bagikan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style>{`
                @keyframes editor-confetti-fall {
                    0% {
                        opacity: 0;
                        transform: translate3d(0, -24px, 0) rotate(0deg) scale(0.8);
                    }
                    14% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                        transform: translate3d(var(--confetti-x), 320px, 0) rotate(var(--confetti-rotate)) scale(1);
                    }
                }
            `}</style>
        </>
    );
}

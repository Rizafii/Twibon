import { Link } from '@inertiajs/react';
import { ArrowUpRight, SparklesIcon, Upload } from 'lucide-react';
import { UploadTwibbonDialog } from '@/components/upload-twibbon-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
    className?: string;
};

export function TwibbonFooter({ className }: Props) {
    const year = new Date().getFullYear();

    return (
        <footer className={cn('mx-auto mt-10 w-full max-w-375', className)}>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-sm backdrop-blur">
                <div className="pointer-events-none absolute inset-0 bg-white/80" />

                <div className="relative grid gap-8 px-5 py-8 md:px-8 md:py-10 lg:grid-cols-2">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                            <SparklesIcon className="size-3.5 text-primary" />
                            Platform Resmi Twibbon Sekolah
                        </span>

                        <div className="space-y-2">
                            <Link
                                href="/"
                                className="flex shrink-0 items-center gap-2 tracking-tight"
                            >
                                <img
                                    src="/favicon.svg"
                                    alt="Logo"
                                    className="h-10 w-10"
                                />
                                <p className="text-xl font-semibold text-slate-900">
                                    Creative Six
                                </p>
                            </Link>
                            <p className="max-w-xl text-sm text-slate-600 md:text-base">
                                Ruang kolaborasi digital untuk kampanye event
                                sekolah, organisasi, dan kegiatan siswa lewat
                                twibbon serta shortlink.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Button asChild size="sm">
                                <Link href="/catalog">
                                    Jelajahi Katalog
                                    <ArrowUpRight className="size-4" />
                                </Link>
                            </Button>
                            <UploadTwibbonDialog>
                                {(openUploadDialog) => (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={openUploadDialog}
                                    >
                                        <Upload className="size-4" />
                                        Upload Twibbon
                                    </Button>
                                )}
                            </UploadTwibbonDialog>
                        </div>
                    </div>

                    <div className="space-y-3 ">
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-800">
                            Navigasi
                        </p>
                        <div className="flex flex-col gap-2 text-sm text-slate-600">
                            <Link
                                href="/"
                                className="w-fit transition-colors hover:text-slate-900"
                            >
                                Beranda
                            </Link>
                            <Link
                                href="/catalog"
                                className="w-fit transition-colors hover:text-slate-900"
                            >
                                Katalog
                            </Link>
                            <Link
                                href="/creators"
                                className="w-fit transition-colors hover:text-slate-900"
                            >
                                Kreator
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-col gap-2 border-t border-slate-200/80 px-5 py-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-8">
                    <p>Creative Six © {year}. Semua hak cipta dilindungi.</p>
                    <p>Dibangun untuk kampanye digital SMKN 6 Surakarta.</p>
                </div>
            </div>
        </footer>
    );
}

import { Link } from '@inertiajs/react';
import { ShieldCheckIcon, SparklesIcon, WandSparklesIcon } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_15%_18%,#ffe3b0_0%,transparent_40%),radial-gradient(circle_at_86%_14%,#c4f2ff_0%,transparent_45%),linear-gradient(180deg,#fff9ef_0%,#edf6ff_100%)] p-4 md:p-8">
            <div className="pointer-events-none absolute -top-12 -left-10 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl" />
            <div className="pointer-events-none absolute right-6 -bottom-16 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />

            <div className="relative mx-auto grid min-h-[calc(100svh-2rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/70 bg-white/45 shadow-xl backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
                <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/60 bg-[linear-gradient(145deg,#0f172a_0%,#1e293b_45%,#0f766e_100%)] p-10 text-white lg:flex">
                    <div className="space-y-6">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3"
                        >
                            <div className="rounded-xl bg-white/12 p-1.5 ring-1 ring-white/25">
                                <img
                                    src="/favicon.svg"
                                    alt="Creative Six"
                                    className="size-8"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-semibold tracking-[0.2em] text-white/75 uppercase">
                                    SMK Negeri 6 Surakarta
                                </p>
                                <p className="text-lg font-semibold">Creative Six</p>
                            </div>
                        </Link>

                        <div className="space-y-3">
                            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
                                <SparklesIcon className="size-3.5" />
                                Portal Resmi SMKN 6 Surakarta
                            </p>
                            <h2 className="text-4xl leading-tight font-semibold">
                                Web Twibbon dan Shortlink.
                            </h2>
                            <p className="max-w-md text-sm text-white/75">
                                Platform kampanye digital untuk acara sekolah,
                                organisasi, hingga kegiatan siswa dalam satu tempat.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm text-white/80">
                        <p className="inline-flex items-center gap-2">
                            <ShieldCheckIcon className="size-4" />
                            Akses akun kreator dan admin lebih aman.
                        </p>
                        <p className="inline-flex items-center gap-2">
                            <WandSparklesIcon className="size-4" />
                            Siap dipakai untuk event sekolah dan komunitas.
                        </p>
                    </div>
                </aside>

                <main className="flex items-center justify-center bg-white/88 p-6 md:p-10">
                    <div className="w-full max-w-md space-y-8">
                        <div className="flex flex-col gap-4">
                            <Link href={home()} className="inline-flex w-fit items-center gap-2 lg:hidden">
                                <div className="rounded-lg bg-slate-900 p-1.5">
                                    <img
                                        src="/favicon.svg"
                                        alt="Creative Six"
                                        className="size-6"
                                    />
                                </div>
                                <span className="text-sm font-semibold text-slate-900">Creative Six</span>
                            </Link>

                            <div className="space-y-2">
                                <h1 className="text-3xl leading-tight font-semibold text-slate-900">
                                    {title}
                                </h1>
                                <p className="text-sm text-slate-600">{description}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

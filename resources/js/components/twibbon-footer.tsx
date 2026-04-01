import { Link } from '@inertiajs/react';

export function TwibbonFooter() {
    return (
        <footer className="mt-10 border-t border-white/60 bg-white/70">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:px-8">
                <p>
                    Twibone Studio © {new Date().getFullYear()}.
                </p>

                <div className="flex items-center gap-4">
                    <Link href="/" className="hover:text-slate-900">
                        Beranda
                    </Link>
                    <Link href="/catalog" className="hover:text-slate-900">
                        Katalog
                    </Link>
                    <Link href="/upload" className="hover:text-slate-900">
                        Upload
                    </Link>
                </div>
            </div>
        </footer>
    );
}

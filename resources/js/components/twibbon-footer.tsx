import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type Props = {
    className?: string;
};

export function TwibbonFooter({ className }: Props) {
    return (
        <footer className={cn('mt-10 mx-auto max-w-375 w-full rounded-3xl bg-primary', className)}>
            <div className="flex flex-col gap-2 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:px-8">
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

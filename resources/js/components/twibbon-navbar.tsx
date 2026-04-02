import { Link, usePage } from '@inertiajs/react';
import { ChevronDownIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboard, home, login, logout, register } from '@/routes';
import { edit } from '@/routes/profile';

type Props = {
    canRegister?: boolean;
};

type SharedProps = {
    auth: {
        user?: {
            id: number;
            name: string;
            email: string;
            is_admin?: boolean;
            avatar?: string | null;
        } | null;
    };
};

const getInitials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

export function TwibbonNavbar({ canRegister = true }: Props) {
    const { auth } = usePage<SharedProps>().props;

    return (
        <header className="relative mb-8 flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
            <Link
                href={home()}
                className="  tracking-tight"
            >
                <p className='text-xl font-semibold text-slate-900'>Creative Six</p>
            </Link>

            <Link
                href="/catalog"
                className="self-center text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 md:absolute md:left-1/2 md:-translate-x-1/2"
            >
                Katalog
            </Link>

            <div className="flex flex-wrap items-center gap-4 md:ml-auto">

                {auth.user ? (
                    <>
                        {auth.user.is_admin && (
                            <Button asChild variant="secondary">
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div
                                    className="inline-flex h-auto items-center gap-2 text-sm cursor-pointer"
                                >
                                    <Avatar className="h-6 w-6 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user.avatar ?? undefined}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="bg-neutral-200 text-[10px] text-black">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="grid text-left leading-tight">
                                        <span className="text-xs font-medium text-slate-900">
                                            Hi, {auth.user.name}
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                            {auth.user.email}
                                        </span>
                                    </div>

                                    <ChevronDownIcon className="size-4 text-slate-500" />
                                </div>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href="/my-twibbon">Twibbon Saya</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/upload">Upload Twibbon</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={edit()}>Profile Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={logout()}
                                        as="button"
                                        data-test="logout-button"
                                    >
                                        Logout
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <div className='flex gap-4 items-center'>
                        <Button asChild variant="outline">
                            <Link href={login()}>Log in</Link>
                        </Button>

                        {canRegister && (
                            <Button asChild>
                                <Link href={register()}>Register</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

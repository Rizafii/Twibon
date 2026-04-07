import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDownIcon,
    LayoutDashboard,
    Link2,
    LogOut,
    Menu,
    Upload,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { CreateShortlinkDialog } from '@/components/create-shortlink-dialog';
import { UploadTwibbonDialog } from '@/components/upload-twibbon-dialog';
import { VerifiedUserName } from '@/components/verified-user-name';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { dashboard, home, login, logout, register } from '@/routes';

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
            verified?: boolean;
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
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [shortlinkDialogOpen, setShortlinkDialogOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => setMobileMenuOpen(false);
    const openUploadDialogFromMobile = () => {
        setUploadDialogOpen(true);
        closeMobileMenu();
    };
    const openShortlinkDialogFromMobile = () => {
        setShortlinkDialogOpen(true);
        closeMobileMenu();
    };

    return (
        <header className="sticky top-6 z-50 mb-8 rounded-3xl border border-slate-200/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur md:px-6 md:py-5">
            <div className="flex items-center gap-3 md:gap-5">
                <Link
                    href={home()}
                    className="flex shrink-0 items-center gap-2 tracking-tight"
                >
                    <img src="/favicon.svg" alt="Logo" className="h-10 w-10" />
                    <p className="text-xl font-semibold text-slate-900">
                        Creative Six
                    </p>
                </Link>

                <nav className="hidden lg:flex lg:flex-1 lg:justify-center">
                    <div className="flex items-center gap-5 text-sm font-medium text-slate-700">
                        <Link
                            href="/catalog"
                            className="transition-colors hover:text-slate-900"
                        >
                            Katalog
                        </Link>
                        <Link
                            href="/creators"
                            className="transition-colors hover:text-slate-900"
                        >
                            Kreator
                        </Link>
                    </div>
                </nav>

                <div className="ml-auto flex items-center gap-2 md:gap-3 lg:ml-0">
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="lg:hidden"
                            >
                                <Menu className="size-5" />
                                <span className="sr-only">Buka menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[88vw] max-w-sm border-slate-200/80"
                        >
                            <SheetHeader className="pr-12 pb-2 text-left">
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>

                            <div className="flex h-full flex-col gap-8 px-4 pt-2 pb-6 sm:px-5">
                                <div className="space-y-7">
                                    <div className="space-y-2">
                                        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Navigasi
                                        </p>
                                        <Link
                                            href="/catalog"
                                            onClick={closeMobileMenu}
                                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                        >
                                            Katalog
                                        </Link>
                                        <Link
                                            href="/creators"
                                            onClick={closeMobileMenu}
                                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                        >
                                            Kreator
                                        </Link>
                                    </div>

                                    {auth.user ? (
                                        <>


                                            <div className="space-y-2">
                                                <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Menu
                                                </p>
                                                {auth.user.is_admin && (
                                                    <Link
                                                        href={dashboard()}
                                                        onClick={closeMobileMenu}
                                                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                                    >
                                                        <LayoutDashboard className="size-4 text-primary" />
                                                        Dashboard
                                                    </Link>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={
                                                        openUploadDialogFromMobile
                                                    }
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <Upload className="size-4 text-primary" />
                                                    Upload Twibbon
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={
                                                        openShortlinkDialogFromMobile
                                                    }
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <Link2 className="size-4 text-primary" />
                                                    Buat Shortlink
                                                </button>
                                                
                                            </div>

                                            <div className="space-y-2">
                                                <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Akun
                                                </p>
                                                
                                                <Link
                                                    href="/my-profile"
                                                    onClick={closeMobileMenu}
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <User className="size-4 text-primary" />
                                                    Profil Saya
                                                </Link>
                                                
                                                <Link
                                                    href={logout()}
                                                    onClick={closeMobileMenu}
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <LogOut className="size-4" />
                                                    Logout
                                                </Link>
                                                                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="inline-flex items-center gap-3 text-sm">
                                                    <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                                                        <AvatarImage
                                                            src={
                                                                auth.user.avatar ??
                                                                undefined
                                                            }
                                                            alt={auth.user.name}
                                                        />
                                                        <AvatarFallback className="bg-neutral-200 text-[11px] text-black">
                                                            {getInitials(
                                                                auth.user.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="grid text-left leading-tight">
                                                        <VerifiedUserName
                                                            name={`Hi, ${auth.user.name}`}
                                                            verified={
                                                                auth.user
                                                                    .verified
                                                            }
                                                            className="text-xs font-medium text-slate-900"
                                                            iconClassName="size-3"
                                                        />
                                                        <span className="text-[11px] text-slate-500">
                                                            {auth.user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Akun
                                            </p>
                                            <Link
                                                href={login()}
                                                onClick={closeMobileMenu}
                                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                            >
                                                Log in
                                            </Link>
                                            {canRegister && (
                                                <Link
                                                    href={register()}
                                                    onClick={closeMobileMenu}
                                                    className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                                                >
                                                    Register
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {auth.user ? (
                        <div className="hidden items-center gap-1.5 lg:flex">
                            {auth.user.is_admin && (
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={dashboard()}>
                                        <LayoutDashboard className="text-primary" />
                                        Dashboard
                                    </Link>
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setUploadDialogOpen(true)}
                            >
                                <Upload className="text-primary" />
                                Upload Twibbon
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShortlinkDialogOpen(true)}
                            >
                                <Link2 className="text-primary" />
                                Buat Shortlink
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="inline-flex h-auto cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-slate-100"
                                    >
                                        <Avatar className="h-7 w-7 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={
                                                    auth.user.avatar ??
                                                    undefined
                                                }
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="bg-neutral-200 text-[10px] text-black">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="hidden text-left leading-tight xl:grid">
                                            <VerifiedUserName
                                                name={`Hi, ${auth.user.name}`}
                                                verified={auth.user.verified}
                                                className="text-xs font-medium text-slate-900"
                                                iconClassName="size-3"
                                            />
                                            <span className="text-[11px] text-slate-500">
                                                {auth.user.email}
                                            </span>
                                        </div>

                                        <ChevronDownIcon className="size-4 text-slate-500" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href="/my-profile">
                                            <User className="text-primary" />
                                            Akun Saya
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={logout()}
                                            className="text-red-600"
                                        >
                                            <LogOut className="text-red-600" />
                                            Logout
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="hidden items-center gap-4 lg:flex">
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
            </div>

            {auth.user && (
                <>
                    <UploadTwibbonDialog
                        open={uploadDialogOpen}
                        onOpenChange={setUploadDialogOpen}
                    />
                    <CreateShortlinkDialog
                        open={shortlinkDialogOpen}
                        onOpenChange={setShortlinkDialogOpen}
                    />
                </>
            )}
        </header>
    );
}

import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRightIcon,
    GlobeIcon,
    Link2Icon,
    ShieldCheckIcon,
    SparklesIcon,
    UploadIcon,
    UsersIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

type SharedProps = {
    auth: {
        user?: {
            name: string;
            is_admin?: boolean;
            verified?: boolean;
        } | null;
    };
};

export default function Dashboard() {
    const { auth } = usePage<SharedProps>().props;
    const userName = auth.user?.name ?? 'Kreator';
    const isAdmin = auth.user?.is_admin === true;

    const quickActions = isAdmin
        ? [
              {
                  title: 'Moderasi Twibbon',
                  description: 'Review, approve, atau reject twibbon baru.',
                  href: '/dashboard/twibbon',
                  icon: SparklesIcon,
              },
              {
                  title: 'User Management',
                  description: 'Atur role admin dan status verified akun.',
                  href: '/dashboard/users',
                  icon: UsersIcon,
              },
              {
                  title: 'Lihat Website Publik',
                  description: 'Pantau tampilan platform dari sisi pengunjung.',
                  href: '/',
                  icon: GlobeIcon,
              },
          ]
        : [
              {
                  title: 'Upload Twibbon',
                  description: 'Kirim twibbon baru untuk proses approval admin.',
                  href: '/upload',
                  icon: UploadIcon,
              },
              {
                  title: 'Kelola Shortlink',
                  description: 'Atur shortlink private dan pantau klik.',
                  href: '/my-profile?tab=url',
                  icon: Link2Icon,
              },
              {
                  title: 'Lihat Website Publik',
                  description: 'Jelajahi katalog twibbon yang sudah tayang.',
                  href: '/catalog',
                  icon: GlobeIcon,
              },
          ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Card className="overflow-hidden border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#e2e8f0_45%,#dbeafe_100%)]">
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="w-fit">
                                {isAdmin ? 'Admin Console' : 'Creator Console'}
                            </Badge>
                            {auth.user?.verified && (
                                <Badge className="w-fit bg-sky-600 hover:bg-sky-600">
                                    <ShieldCheckIcon className="size-3.5" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-2xl md:text-3xl">
                            Selamat datang, {userName}
                        </CardTitle>
                        <CardDescription className="max-w-2xl text-slate-700">
                            {isAdmin
                                ? 'Pusat kendali moderasi konten, manajemen akun, dan pemantauan kualitas publikasi.'
                                : 'Kelola twibbon, custom URL, dan shortlink dari satu dashboard tanpa pindah-pindah halaman.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-wrap gap-2 pb-6">
                        {isAdmin ? (
                            <>
                                <Button asChild>
                                    <Link href="/dashboard/twibbon">
                                        Buka Moderasi Twibbon
                                        <ArrowRightIcon className="size-4" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/dashboard/users">
                                        Kelola User
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild>
                                    <Link href="/upload">
                                        Upload Twibbon
                                        <ArrowRightIcon className="size-4" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/my-profile">
                                        Buka Profil Saya
                                    </Link>
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                <section className="grid gap-4 md:grid-cols-3">
                    {quickActions.map((action) => (
                        <Card key={action.title} className="h-full border-slate-200/80">
                            <CardHeader className="space-y-3 pb-3">
                                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                                    <action.icon className="size-4" />
                                </div>
                                <CardTitle className="text-lg">
                                    {action.title}
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    {action.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={action.href}>
                                        Buka
                                        <ArrowRightIcon className="size-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <Card className="border-slate-200/80">
                    <CardHeader>
                        <CardTitle>
                            {isAdmin
                                ? 'Checklist Operasional Admin'
                                : 'Checklist Aktivitas Kreator'}
                        </CardTitle>
                        <CardDescription>
                            {isAdmin
                                ? 'Gunakan daftar ringkas ini untuk menjaga kualitas konten yang tayang.'
                                : 'Panduan cepat supaya campaign kamu rapi dan gampang dilacak performanya.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-3 md:grid-cols-3">
                        {(isAdmin
                            ? [
                                  'Review twibbon pending secara berkala.',
                                  'Verifikasi akun penting yang resmi.',
                                  'Pantau URL publik agar tidak bentrok.',
                              ]
                            : [
                                  'Upload frame PNG rasio 3:4.',
                                  'Set custom URL yang mudah diingat.',
                                  'Gunakan shortlink untuk tracking klik.',
                              ])
                            .map((item) => (
                                <div
                                    key={item}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                                >
                                    {item}
                                </div>
                            ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

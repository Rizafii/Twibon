import { Head, Link } from '@inertiajs/react';
import { CalendarDaysIcon, Link2Icon, Share2Icon, User } from 'lucide-react';
import { useState } from 'react';
import { TwibbonFooter } from '@/components/twibbon-footer';
import { TwibbonNavbar } from '@/components/twibbon-navbar';
import { VerifiedUserName } from '@/components/verified-user-name';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type Props = {
    twibbon: {
        id: number;
        name: string;
        description: string;
        created_at: string | null;
        slug: string;
        custom_url?: string | null;
        preview_url: string;
        creator_name: string;
        creator: {
            id: number | null;
            username?: string | null;
            name: string;
            bio?: string | null;
            profile_photo_url?: string | null;
            banner_photo_url?: string | null;
            verified: boolean;
        };
        uses_count: number;
    };
};

const getInitials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

const formatCreatedAt = (value: string | null): string => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
};

export default function TwibbonShow({ twibbon }: Props) {
    const [shareFeedback, setShareFeedback] = useState<string>('Share');

    const handleShare = async () => {
        const shareUrl = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: twibbon.name,
                    text: 'Lihat twibbon ini',
                    url: shareUrl,
                });

                return;
            }

            await navigator.clipboard.writeText(shareUrl);
            setShareFeedback('Link disalin');
            setTimeout(() => setShareFeedback('Share'), 1800);
        } catch {
            // Ignore share/copy failures to avoid blocking navigation flow.
        }
    };

    return (
        <>
            <Head title={twibbon.name} />

            <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8">
                <div className="mx-auto max-w-375">
                    <TwibbonNavbar />

                    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_1.8fr]">
                        <Card className="overflow-hidden py-0">
                            <div className="aspect-3/4 bg-slate-100">
                                <img
                                    src={twibbon.preview_url}
                                    alt={twibbon.name}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl leading-tight md:text-3xl">
                                    {twibbon.name}
                                </CardTitle>
                                <CardDescription>
                                    {twibbon.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="rounded-full px-3 py-1 text-xs">
                                        <CalendarDaysIcon className="size-3.5" />
                                        Dibuat pada{' '}
                                        {formatCreatedAt(twibbon.created_at)}
                                    </Badge>
                                    <Badge className="max-w-full rounded-full px-3 py-1 text-xs">
                                        <Link2Icon className="size-3.5 shrink-0" />
                                        <span className="truncate">
                                            {twibbon.custom_url
                                                ? `/${twibbon.custom_url}`
                                                : `/twibbon/${twibbon.slug}`}
                                        </span>
                                    </Badge>
                                </div>

                                <p className="flex items-center gap-1 text-sm">
                                    <User size={15} />
                                    {twibbon.uses_count}
                                </p>

                                <div className="overflow-hidden rounded-xl border bg-slate-50">
                                    {twibbon.creator.banner_photo_url ? (
                                        <img
                                            src={
                                                twibbon.creator.banner_photo_url
                                            }
                                            alt={`Banner ${twibbon.creator.name}`}
                                            className="h-24 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-24 w-full bg-slate-200" />
                                    )}

                                    <div className="space-y-2 p-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 overflow-hidden rounded-full border">
                                                <AvatarImage
                                                    src={
                                                        twibbon.creator
                                                            .profile_photo_url ??
                                                        undefined
                                                    }
                                                    alt={twibbon.creator.name}
                                                />
                                                <AvatarFallback className="bg-neutral-200 text-black">
                                                    {getInitials(
                                                        twibbon.creator.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                {twibbon.creator.username ? (
                                                    <Link
                                                        href={`/creator/${twibbon.creator.username}`}
                                                        className="font-medium text-slate-900 hover:underline"
                                                    >
                                                        <VerifiedUserName
                                                            name={
                                                                twibbon.creator
                                                                    .name
                                                            }
                                                            verified={
                                                                twibbon.creator
                                                                    .verified
                                                            }
                                                        />
                                                    </Link>
                                                ) : (
                                                    <p className="font-medium text-slate-900">
                                                        <VerifiedUserName
                                                            name={
                                                                twibbon.creator
                                                                    .name
                                                            }
                                                            verified={
                                                                twibbon.creator
                                                                    .verified
                                                            }
                                                        />
                                                    </p>
                                                )}
                                                <p className="text-xs text-slate-500">
                                                    Creator profile
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600">
                                            {twibbon.creator.bio &&
                                            twibbon.creator.bio.trim() !== ''
                                                ? twibbon.creator.bio
                                                : 'Creator belum menambahkan bio.'}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600">
                                    Preview ukuran besar tersedia di editor.
                                    Unggah fotomu dan download hasil akhir dalam
                                    format PNG.
                                </p>
                            </CardContent>

                            <CardFooter className="flex-col gap-2 md:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full md:w-auto"
                                    onClick={handleShare}
                                >
                                    <Share2Icon className="size-4" />
                                    {shareFeedback}
                                </Button>

                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full md:ml-auto md:w-auto"
                                >
                                    <Link href={`/editor/${twibbon.slug}`}>
                                        Pilih Foto dan Edit
                                    </Link>
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

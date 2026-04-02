import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { TwibbonFooter } from '@/components/twibbon-footer';
import { TwibbonNavbar } from '@/components/twibbon-navbar';
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
        slug: string;
        preview_url: string;
        creator_name: string;
        creator: {
            name: string;
            bio?: string | null;
            profile_photo_url?: string | null;
            banner_photo_url?: string | null;
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

export default function TwibbonShow({ twibbon }: Props) {
    return (
        <>
            <Head title={twibbon.name} />

            <div className="min-h-screen bg-[linear-gradient(140deg,#fffef5_0%,#f1f8ff_50%,#fff9f2_100%)] px-4 py-8 md:px-8 md:py-12">
                <div className="mx-auto max-w-375">
                    <TwibbonNavbar />

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
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
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline">
                                        Creator: {twibbon.creator_name}
                                    </Badge>
                                    <Badge variant="secondary">
                                        {twibbon.uses_count} kali dipakai
                                    </Badge>
                                </div>

                                <div className="overflow-hidden rounded-xl border bg-slate-50">
                                    {twibbon.creator.banner_photo_url ? (
                                        <img
                                            src={twibbon.creator.banner_photo_url}
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
                                                    src={twibbon.creator.profile_photo_url ?? undefined}
                                                    alt={twibbon.creator.name}
                                                />
                                                <AvatarFallback className="bg-neutral-200 text-black">
                                                    {getInitials(twibbon.creator.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {twibbon.creator.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Creator profile
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600">
                                            {twibbon.creator.bio && twibbon.creator.bio.trim() !== ''
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

                            <CardFooter>
                                <Button asChild size="lg" className="w-full">
                                    <Link href={`/editor/${twibbon.slug}`}>
                                        Use This Twibbon
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                <TwibbonFooter/>
            </div>
        </>
    );
}

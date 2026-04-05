import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, ShieldCheck, ShieldOff } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { VerifiedUserName } from '@/components/verified-user-name';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

type UserRow = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    verified: boolean;
    twibbons_count: number;
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
};

type Props = {
    filters: {
        search: string;
    };
    users: Paginated<UserRow>;
};

type SharedProps = {
    auth: {
        user: {
            id: number;
        };
    };
    flash?: {
        success?: string | null;
        error?: string | null;
    };
};

const sanitizePaginationLabel = (label: string): string =>
    label
        .replaceAll('&laquo;', '«')
        .replaceAll('&raquo;', '»')
        .replace(/<[^>]+>/g, '')
        .trim();

const formatDate = (value: string | null): string => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export default function AdminUserIndex({ filters, users }: Props) {
    const { auth, flash } = usePage<SharedProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
    });

    const [activeActionKey, setActiveActionKey] = useState<string | null>(null);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        get('/dashboard/users', {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const updateUser = (
        user: UserRow,
        nextState: { is_admin: boolean; verified: boolean },
        keySuffix: 'admin' | 'verified',
    ) => {
        const key = `${user.id}-${keySuffix}`;
        setActiveActionKey(key);

        router.patch(`/dashboard/users/${user.id}`, nextState, {
            preserveScroll: true,
            onFinish: () => setActiveActionKey(null),
        });
    };

    return (
        <>
            <Head title="User Management" />

            <div className="space-y-6 p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                            Kelola role admin dan status verified (centang biru)
                            untuk semua akun.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-col gap-2 md:flex-row"
                        >
                            <Input
                                value={data.search}
                                onChange={(event) =>
                                    setData('search', event.target.value)
                                }
                                placeholder="Cari nama atau email"
                                className="md:max-w-sm"
                            />
                            <Button type="submit" variant="outline">
                                {processing && <Spinner className="size-4" />}
                                Search
                            </Button>
                        </form>

                        {flash?.success && (
                            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                {flash.success}
                            </p>
                        )}

                        {flash?.error && (
                            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {flash.error}
                            </p>
                        )}

                        {users.data.length === 0 ? (
                            <p className="rounded-md border border-dashed p-6 text-center text-sm text-slate-600">
                                Tidak ada data user.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">
                                                User
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Role
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Verified
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Twibbon
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Join Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.data.map((user) => {
                                            const isSelf = user.id === auth.user.id;
                                            const roleActionKey = `${user.id}-admin`;
                                            const verifiedActionKey =
                                                `${user.id}-verified`;

                                            return (
                                                <tr
                                                    key={user.id}
                                                    className="border-t align-middle"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-0.5">
                                                            <div className="font-medium text-slate-900">
                                                                <VerifiedUserName
                                                                    name={
                                                                        user.name
                                                                    }
                                                                    verified={
                                                                        user.verified
                                                                    }
                                                                />
                                                            </div>
                                                            <p className="text-xs text-slate-500">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={
                                                                user.is_admin
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            onClick={() =>
                                                                updateUser(
                                                                    user,
                                                                    {
                                                                        is_admin:
                                                                            !user.is_admin,
                                                                        verified:
                                                                            user.verified,
                                                                    },
                                                                    'admin',
                                                                )
                                                            }
                                                            disabled={
                                                                isSelf ||
                                                                activeActionKey ===
                                                                    roleActionKey
                                                            }
                                                        >
                                                            {activeActionKey ===
                                                                roleActionKey && (
                                                                <Spinner className="size-4" />
                                                            )}
                                                            {user.is_admin ? (
                                                                <>
                                                                    <ShieldCheck className="size-4" />
                                                                    Admin
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ShieldOff className="size-4" />
                                                                    User
                                                                </>
                                                            )}
                                                        </Button>
                                                        {isSelf && (
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Akun kamu
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={
                                                                user.verified
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            className={
                                                                user.verified
                                                                    ? 'bg-sky-600 hover:bg-sky-700'
                                                                    : undefined
                                                            }
                                                            onClick={() =>
                                                                updateUser(
                                                                    user,
                                                                    {
                                                                        is_admin:
                                                                            user.is_admin,
                                                                        verified:
                                                                            !user.verified,
                                                                    },
                                                                    'verified',
                                                                )
                                                            }
                                                            disabled={
                                                                activeActionKey ===
                                                                verifiedActionKey
                                                            }
                                                        >
                                                            {activeActionKey ===
                                                                verifiedActionKey && (
                                                                <Spinner className="size-4" />
                                                            )}
                                                            <BadgeCheck className="size-4" />
                                                            {user.verified
                                                                ? 'Verified'
                                                                : 'Unverified'}
                                                        </Button>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="secondary">
                                                            {user.twibbons_count}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {formatDate(
                                                            user.created_at,
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                            {users.links.map((link) => (
                                <Button
                                    key={`${link.label}-${link.url ?? 'null'}`}
                                    asChild={link.url !== null}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={link.url === null}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            preserveState
                                            preserveScroll
                                        >
                                            {sanitizePaginationLabel(link.label)}
                                        </Link>
                                    ) : (
                                        <span>
                                            {sanitizePaginationLabel(link.label)}
                                        </span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminUserIndex.layout = {
    breadcrumbs: [
        {
            title: 'User Management',
            href: '/dashboard/users',
        },
    ],
};

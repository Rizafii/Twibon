import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    name: string;
    verified?: boolean;
    className?: string;
    nameClassName?: string;
    iconClassName?: string;
};

export function VerifiedUserName({
    name,
    verified = false,
    className,
    nameClassName,
    iconClassName,
}: Props) {
    return (
        <span className={cn('inline-flex items-center gap-1', className)}>
            <span className={nameClassName}>{name}</span>
            {verified && (
                <BadgeCheck
                    size={20}
                    className={cn(
                        'fill-blue-500 text-background',
                        iconClassName,
                    )}
                    aria-label="Akun terverifikasi"
                />
            )}
        </span>
    );
}

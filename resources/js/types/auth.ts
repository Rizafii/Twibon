export type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    bio?: string | null;
    profile_photo_path?: string | null;
    banner_photo_path?: string | null;
    profile_photo_url?: string | null;
    banner_photo_url?: string | null;
    is_admin?: boolean;
    verified?: boolean;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

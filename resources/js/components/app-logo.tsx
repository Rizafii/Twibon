import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
<img src='/favicon.svg' alt="Logo" className="h-9 w-9" />
            
            <div className=" flex flex-col gap-0 text-left text-sm">
                <p className=" truncate leading-tight font-semibold">
                    Creative Six
                </p>
                <p className="text-xs font-medium">Admin Panel</p>
            </div>
        </>
    );
}

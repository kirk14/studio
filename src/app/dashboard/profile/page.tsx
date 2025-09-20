
import { ProfileForm } from "@/components/dashboard/profile-form";

export default function ProfilePage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Your Profile
            </h1>
            <p className="text-muted-foreground mb-8">
                View and manage your account details here.
            </p>
            <ProfileForm />
        </div>
    );
}

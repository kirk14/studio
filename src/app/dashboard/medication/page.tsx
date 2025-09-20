import { MedicationReminder } from "@/components/dashboard/medication-reminder";

export default function MedicationPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Medication Reminders
            </h1>
            <p className="text-muted-foreground mb-8">
                Manage your medication schedule here.
            </p>
            <MedicationReminder />
        </div>
    );
}

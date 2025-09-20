import { MedicalReportUploader } from "@/components/dashboard/medical-report-uploader";

export default function MedicalReportPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">
                Medical Reports & Diet Plan
            </h1>
            <p className="text-muted-foreground mb-8">
                Upload your medical reports to get an instant health analysis and a diet plan tailored to your results.
            </p>
            <MedicalReportUploader />
        </div>
    );
}

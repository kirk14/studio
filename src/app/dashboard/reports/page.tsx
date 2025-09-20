import { MedicalReportUploader } from "@/components/dashboard/medical-report-uploader";

export default function MedicalReportPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Medical Reports
            </h1>
            <p className="text-muted-foreground mb-8">
                Upload your medical reports to get a diet plan tailored to your health metrics.
            </p>
            <MedicalReportUploader />
        </div>
    );
}

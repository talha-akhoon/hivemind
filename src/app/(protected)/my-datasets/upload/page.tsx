import DatasetUploadForm from "@/components/DatasetUploadForm";

export default function UploadDatasetPage() {
    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full">
                <DatasetUploadForm />
            </div>
        </div>
    );
}
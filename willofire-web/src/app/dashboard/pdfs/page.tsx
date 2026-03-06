import { UploadCard } from '@/components/shared/UploadCard';
import { PdfList } from '@/components/shared/PdfList';

export default function PdfsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    My PDFs
                </h1>
                <p className="text-slate-500 mt-2">
                    Upload and manage your study materials.
                </p>
            </div>

            <UploadCard />

            <PdfList />
        </div>
    );
}

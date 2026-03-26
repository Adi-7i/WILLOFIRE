import { FileText } from 'lucide-react';

export function EmptyState() {
    return (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-[#2A3040] bg-[#151821] px-6 text-center">
            <div className="mb-3 rounded-full border border-[#2B3344] bg-[#161D2A] p-3">
                <FileText className="h-5 w-5 text-[#9AA3B2]" />
            </div>
            <p className="text-base font-medium text-[#E6EAF2]">No study materials yet</p>
            <p className="mt-1 text-sm text-[#9AA3B2]">Upload your first PDF to begin</p>
        </div>
    );
}


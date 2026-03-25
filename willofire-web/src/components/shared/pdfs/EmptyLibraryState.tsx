import { LibraryBig } from 'lucide-react';

export function EmptyLibraryState() {
    return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#2A3040] bg-[#151821] px-6 text-center">
            <div className="mb-4 rounded-full border border-[#2B3344] bg-[#161D2A] p-3">
                <LibraryBig className="h-6 w-6 text-[#9AA3B2]" />
            </div>
            <h3 className="text-lg font-semibold text-[#E6EAF2]">No study material yet</h3>
            <p className="mt-1 max-w-sm text-sm text-[#9AA3B2]">
                Upload your first PDF to start practicing with AI
            </p>
        </div>
    );
}


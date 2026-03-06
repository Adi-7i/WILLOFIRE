import { FileDown, Calendar, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type DownloadCategory = 'mock-test' | 'answer-key' | 'long-question';

interface DownloadCardProps {
    title: string;
    category: DownloadCategory;
    date: string;
    size: string;
}

const categoryConfig = {
    'mock-test': { label: 'Mock Test', badgeClass: 'bg-blue-100 text-blue-700' },
    'answer-key': { label: 'Answer Key', badgeClass: 'bg-green-100 text-green-700' },
    'long-question': { label: 'Long Question', badgeClass: 'bg-amber-100 text-amber-700' },
};

export function DownloadCard({ title, category, date, size }: DownloadCardProps) {
    const config = categoryConfig[category];

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${config.badgeClass}`}>
                    {config.label}
                </span>
            </div>

            <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>

                <div className="space-y-1.5 mb-6">
                    <div className="flex items-center text-xs text-slate-500 gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Generated: {date}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 gap-2">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{size}</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100">
                <Button
                    variant="outline"
                    className="w-full justify-center gap-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                    <FileDown className="w-4 h-4" />
                    Download PDF
                </Button>
            </div>
        </div>
    );
}

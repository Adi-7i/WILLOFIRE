import { FileDown, Calendar, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type DownloadCategory = 'mock-test' | 'answer-key' | 'long-question';

interface DownloadCardProps {
    id: string;
    title: string;
    category: DownloadCategory;
    date: string;
    size?: string;
    onDownload: (id: string) => void;
    isDownloading: boolean;
}

const categoryConfig = {
    'mock-test': { label: 'Mock Test', badgeClass: 'bg-[rgba(46,74,98,0.28)] text-[#A7BDC8]' },
    'answer-key': { label: 'Answer Key', badgeClass: 'bg-[rgba(63,110,106,0.24)] text-[#A3C0B7]' },
    'long-question': { label: 'Long Question', badgeClass: 'bg-[rgba(63,110,106,0.22)] text-[#A8B9B6]' },
};

export function DownloadCard({ id, title, category, date, size, onDownload, isDownloading }: DownloadCardProps) {
    const config = categoryConfig[category];

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 group flex flex-col h-full wf-soft-glow-hover">
            <div className="flex items-start justify-between mb-4">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${config.badgeClass}`}>
                    {config.label}
                </span>
            </div>

            <div className="flex-1">
                <h3 className="text-base font-bold text-foreground leading-snug mb-3 group-hover:text-[#93ADBF] transition-colors">
                    {title}
                </h3>

                <div className="space-y-1.5 mb-6">
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Generated: {date}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{size ?? 'Generated on demand'}</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border/70">
                <Button
                    variant="outline"
                    className="w-full justify-center gap-2 border-border hover:border-[#3F6E6A]/50 hover:bg-[rgba(46,74,98,0.22)] hover:text-[#A7BDC8] transition-colors"
                    onClick={() => onDownload(id)}
                    disabled={isDownloading}
                >
                    <FileDown className="w-4 h-4" />
                    {isDownloading ? 'Preparing...' : 'Download PDF'}
                </Button>
            </div>
        </div>
    );
}

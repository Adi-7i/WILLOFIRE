import { FileText, CheckCircle, FileQuestion, BookOpen } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    trend?: string;
    icon: 'pdf' | 'evaluation' | 'mock' | 'ask';
}

const icons = {
    pdf: { icon: FileText, bg: 'bg-[rgba(46,74,98,0.28)]', color: 'text-[#93ADBF]' },
    evaluation: { icon: CheckCircle, bg: 'bg-[rgba(63,110,106,0.24)]', color: 'text-[#93B6AC]' },
    mock: { icon: BookOpen, bg: 'bg-[rgba(63,110,106,0.22)]', color: 'text-[#95AAA7]' },
    ask: { icon: FileQuestion, bg: 'bg-[rgba(46,74,98,0.26)]', color: 'text-[#93ADBF]' },
};

export function StatCard({ title, value, trend, icon }: StatCardProps) {
    const IconProps = icons[icon];
    const IconComp = IconProps.icon;

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${IconProps.bg} ${IconProps.color}`}>
                    <IconComp className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                        {trend ? (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {trend}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

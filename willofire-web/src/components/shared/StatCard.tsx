import { FileText, CheckCircle, FileQuestion, BookOpen } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    trend?: string;
    icon: 'pdf' | 'evaluation' | 'mock' | 'ask';
}

const icons = {
    pdf: { icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' },
    evaluation: { icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' },
    mock: { icon: BookOpen, bg: 'bg-amber-100', color: 'text-amber-600' },
    ask: { icon: FileQuestion, bg: 'bg-purple-100', color: 'text-purple-600' },
};

export function StatCard({ title, value, trend, icon }: StatCardProps) {
    const IconProps = icons[icon];
    const IconComp = IconProps.icon;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${IconProps.bg} ${IconProps.color}`}>
                    <IconComp className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
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

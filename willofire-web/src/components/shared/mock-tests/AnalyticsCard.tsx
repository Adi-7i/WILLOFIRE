type AnalyticsCardProps = {
    subject: string;
    percentage: number;
    note: string;
};

export function AnalyticsCard({ subject, percentage, note }: AnalyticsCardProps) {
    const progressStyle = {
        background: `conic-gradient(#3F6E6A ${percentage * 3.6}deg, #232734 0deg)`,
    };

    return (
        <article className="flex items-center gap-4 rounded-2xl border border-[#232734] bg-[#151821] px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3F6E6A]/60 hover:shadow-[0_0_0_1px_rgba(63,110,106,0.18),0_10px_24px_rgba(18,29,36,0.35)]">
            <div className="relative grid h-14 w-14 place-items-center rounded-full p-[3px]" style={progressStyle}>
                <div className="grid h-full w-full place-items-center rounded-full bg-[#0D0F14]">
                    <span className="text-[11px] font-medium text-[#E6EAF2]">{percentage}%</span>
                </div>
            </div>

            <div className="min-w-0">
                <p className="truncate text-sm font-medium tracking-[0.01em] text-[#E6EAF2]">{subject}</p>
                <p className="mt-1 text-xs text-[#9AA3B2]">{note}</p>
            </div>
        </article>
    );
}

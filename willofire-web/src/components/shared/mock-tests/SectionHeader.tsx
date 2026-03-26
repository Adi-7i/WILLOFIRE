type StatItem = {
    label: string;
    value: string;
};

type SectionHeaderProps = {
    eyebrow: string;
    title: string;
    description: string;
    stats: StatItem[];
};

export function SectionHeader({ eyebrow, title, description, stats }: SectionHeaderProps) {
    return (
        <section className="rounded-3xl border border-[#232734] bg-[#151821] p-6 sm:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl space-y-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9AA3B2]">{eyebrow}</p>
                    <h1 className="text-3xl font-semibold tracking-[0.02em] text-[#E6EAF2] sm:text-[2.05rem]">{title}</h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-[#9AA3B2] sm:text-[15px]">{description}</p>
                </div>

                <div className="flex gap-7 lg:gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="space-y-1 text-right">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-[#9AA3B2]">{stat.label}</p>
                            <p className="text-xl font-semibold tracking-[0.01em] text-[#E6EAF2]">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

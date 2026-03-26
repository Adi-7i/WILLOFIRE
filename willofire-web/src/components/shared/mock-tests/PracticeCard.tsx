import Link from 'next/link';

type PracticeCardProps = {
    title: string;
    description: string;
    features: string[];
    ctaLabel: string;
    href: string;
    badge: string;
};

export function PracticeCard({ title, description, features, ctaLabel, href, badge }: PracticeCardProps) {
    return (
        <article className="group relative flex h-full flex-col rounded-3xl border border-[#232734] bg-[#151821] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#3F6E6A]/70 hover:shadow-[0_0_0_1px_rgba(63,110,106,0.25),0_18px_40px_rgba(16,35,38,0.45)] sm:p-8">
            <span className="absolute right-4 top-4 rounded-full border border-[#2C3645] bg-[#161C27] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#A8B8C8]">
                {badge}
            </span>

            <h2 className="pr-24 text-2xl font-semibold tracking-[0.01em] text-[#E6EAF2]">{title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#9AA3B2]">{description}</p>

            <ul className="mt-7 space-y-2.5">
                {features.map((feature) => (
                    <li key={feature} className="text-sm text-[#C1CAD6]">
                        {feature}
                    </li>
                ))}
            </ul>

            <Link
                href={href}
                className="mt-8 inline-flex w-fit items-center rounded-xl bg-[linear-gradient(135deg,#2E4A62,#3F6E6A)] px-4 py-2.5 text-sm font-medium tracking-[0.01em] text-[#E6EAF2] transition-all duration-200 group-hover:brightness-110"
            >
                {ctaLabel}
            </Link>
        </article>
    );
}

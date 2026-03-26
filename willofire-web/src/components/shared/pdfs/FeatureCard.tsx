import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
    title: string;
    description: string;
    ctaLabel?: string;
    ctaHref?: string;
    compact?: boolean;
}

export function FeatureCard({ title, description, ctaLabel, ctaHref, compact = false }: FeatureCardProps) {
    return (
        <article
            className={[
                'rounded-2xl border border-[#232734] p-6',
                compact
                    ? 'bg-[linear-gradient(135deg,rgba(46,74,98,0.26),rgba(63,110,106,0.1))]'
                    : 'bg-[linear-gradient(135deg,rgba(46,74,98,0.2),rgba(63,110,106,0.14))]',
            ].join(' ')}
        >
            <h3 className="text-xl font-medium tracking-tight text-[#E6EAF2]">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#9AA3B2]">{description}</p>

            {ctaLabel && ctaHref && (
                <Link
                    href={ctaHref}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#BFD4D1] transition-colors hover:text-[#E6EAF2]"
                >
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                </Link>
            )}
        </article>
    );
}


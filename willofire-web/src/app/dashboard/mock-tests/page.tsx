'use client';

import { AnalyticsCard } from '@/components/shared/mock-tests/AnalyticsCard';
import { PracticeCard } from '@/components/shared/mock-tests/PracticeCard';
import { SectionHeader } from '@/components/shared/mock-tests/SectionHeader';

const practiceCards = [
    {
        title: 'MCQ Practice',
        description: 'Test your conceptual clarity with exam-level multiple choice questions generated from your material.',
        features: ['Instant scoring', 'Explanation-based learning', 'Timed environment'],
        ctaLabel: 'Start MCQ Test →',
        href: '/dashboard/mock-tests/mcq',
        badge: 'Recommended',
    },
    {
        title: 'Answer Writing Practice',
        description: 'Develop structured answers with AI-based evaluation and feedback.',
        features: ['AI evaluation', 'Structure feedback', 'Model answers'],
        ctaLabel: 'Start Writing Test →',
        href: '/dashboard/mock-tests/long-questions',
        badge: 'Advanced',
    },
];

const analyticsCards = [
    { subject: 'Polity', percentage: 82, note: 'Concept clarity: High' },
    { subject: 'History', percentage: 71, note: 'Application: Improving' },
    { subject: 'Geography', percentage: 76, note: 'Concept clarity: High' },
    { subject: 'Economy', percentage: 68, note: 'Application: Improving' },
];

export default function MockTestsPage() {
    return (
        <div className="space-y-8 pb-4 text-[#E6EAF2] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <SectionHeader
                eyebrow="AI GENERATED FROM YOUR NOTES"
                title="Mock Tests"
                description="Practice like the real exam environment. AI generates personalized assessments based on your study material."
                stats={[
                    { label: 'Average Score', value: '78%' },
                    { label: 'Tests Completed', value: '24' },
                ]}
            />

            <section className="space-y-4">
                <div className="grid gap-5 lg:grid-cols-2">
                    {practiceCards.map((card) => (
                        <PracticeCard key={card.title} {...card} />
                    ))}
                </div>
            </section>

            <section className="rounded-3xl border border-[#232734] bg-[#151821] p-6 sm:p-7">
                <h2 className="text-xl font-semibold tracking-[0.02em] text-[#E6EAF2]">Recent Performance Analytics</h2>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {analyticsCards.map((card) => (
                        <AnalyticsCard key={card.subject} {...card} />
                    ))}
                </div>
            </section>
        </div>
    );
}

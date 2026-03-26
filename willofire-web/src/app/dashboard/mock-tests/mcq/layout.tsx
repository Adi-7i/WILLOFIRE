import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Exam Assessment | Willofire',
    description: 'Immersive exam practice environment',
};

export default function McqPracticeLayout({ children }: { children: React.ReactNode }) {
    // This layout intentionally bypasses the parent dashboard layout (Sidebar, Topbar)
    // to force a true distraction-free, full-screen exam interface.
    return (
        <div className="min-h-screen bg-[#0D0F14] text-foreground font-sans antialiased selection:bg-[#3F6E6A]/30 selection:text-[#E8EFEE]">
            {children}
        </div>
    );
}

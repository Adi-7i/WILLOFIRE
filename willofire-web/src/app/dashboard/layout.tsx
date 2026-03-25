'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';

const Topbar = dynamic(
    () => import('@/components/shared/Topbar').then((mod) => mod.Topbar),
    { ssr: false }
);

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const isAskPdfPage = pathname === '/dashboard/ask-pdf';

    return (
        <div className="min-h-screen bg-[#0B1120] text-[#E5E7EB]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex min-h-screen flex-1 flex-col md:pl-24">
                {!isAskPdfPage && <Topbar onOpenSidebar={() => setSidebarOpen(true)} />}

                <main className={isAskPdfPage ? 'flex-1 p-4 md:p-6' : 'flex-1 p-4 sm:p-6 lg:p-8'}>
                    {isAskPdfPage ? children : <div className="mx-auto h-full max-w-7xl">{children}</div>}
                </main>
            </div>
        </div>
    );
}

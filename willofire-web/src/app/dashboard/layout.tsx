'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
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

    return (
        <div className="flex bg-[#F7F8FA] min-h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

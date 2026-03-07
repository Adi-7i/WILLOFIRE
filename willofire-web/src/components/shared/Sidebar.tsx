'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, MessageSquare, Files, CheckCircle, Download, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const NAV_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover', href: '/dashboard/discover', icon: Globe },
    { name: 'My PDFs', href: '/dashboard/pdfs', icon: FileText },
    { name: 'Ask PDF', href: '/dashboard/ask-pdf', icon: MessageSquare },
    { name: 'Mock Tests', href: '/dashboard/mock-tests', icon: Files },
    { name: 'Answer Evaluation', href: '/dashboard/answer-evaluation', icon: CheckCircle },
    { name: 'Downloads', href: '/dashboard/downloads', icon: Download },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-zinc-950/80 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1E2D4E] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-16 shrink-0 items-center justify-between px-6">
                    <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white flex gap-2 items-center">
                        <div className="w-6 h-6 rounded bg-amber-500 shrink-0" />
                        Willofire
                    </Link>
                    <Button variant="ghost" size="icon" className="md:hidden text-zinc-400 hover:text-white hover:bg-white/10" onClick={onClose}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close sidebar</span>
                    </Button>
                </div>

                <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
                    <div className="text-xs font-semibold text-[#A9BAD0] uppercase tracking-wider mb-4 px-2">
                        Menu
                    </div>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-[#2D4A7A] text-white'
                                    : 'text-[#A9BAD0] hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#A9BAD0] group-hover:text-white'
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                        <p className="text-sm font-medium text-white">Upgrade to Pro</p>
                        <p className="mt-1 text-xs text-[#A9BAD0]">Get unlimited mock tests and evaluations.</p>
                        <Button className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white border-0" size="sm">
                            Upgrade
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
}

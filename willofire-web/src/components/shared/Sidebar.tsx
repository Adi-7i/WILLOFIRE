'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { LayoutDashboard, FileText, MessageSquare, Files, CheckCircle, Download, X, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const NAV_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My PDFs', href: '/dashboard/pdfs', icon: FileText },
    { name: 'Ask PDF', href: '/dashboard/ask-pdf', icon: MessageSquare },
    { name: 'Mock Tests', href: '/dashboard/mock-tests', icon: Files },
    { name: 'Answer Evaluation', href: '/dashboard/answer-evaluation', icon: CheckCircle },
    { name: 'Downloads', href: '/dashboard/downloads', icon: Download },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = useMemo(() => isHovered, [isHovered]);

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-4 left-4 z-50 w-64 rounded-2xl border border-[#1F2937] bg-[#0B1120]/95 p-3 text-[#9CA3AF] shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform duration-300 ease-out md:hidden',
                    isOpen ? 'translate-x-0' : '-translate-x-[120%]'
                )}
            >
                <div className="mb-3 flex items-center justify-between px-2">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-[#E5E7EB]">
                        <Flame className="h-5 w-5 text-[#38BDF8]" />
                        Willofire
                    </Link>
                    <Button variant="ghost" size="icon" className="text-[#9CA3AF] hover:bg-[#0F172A] hover:text-[#E5E7EB]" onClick={onClose}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close sidebar</span>
                    </Button>
                </div>
                <nav className="space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-[#111827] text-[#E5E7EB]'
                                        : 'text-[#9CA3AF] hover:bg-[#111827]/70 hover:text-[#E5E7EB]'
                                )}
                                onClick={onClose}
                            >
                                <Icon
                                    className={cn('mr-3 h-5 w-5 shrink-0', isActive ? 'text-[#38BDF8]' : 'text-[#9CA3AF]')}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Desktop floating rail */}
            <aside
                className={cn(
                    'fixed left-4 top-4 bottom-4 z-40 hidden rounded-[28px] border border-[#1F2937] bg-[#0B1120]/72 px-2 py-3 text-[#9CA3AF] shadow-[0_16px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-[width,background-color] duration-300 ease-out md:flex md:flex-col',
                    isExpanded ? 'w-56 bg-[#0B1120]/84' : 'w-[72px]'
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Link
                    href="/dashboard"
                    className={cn(
                        'mb-4 flex h-11 items-center rounded-2xl transition-all duration-300',
                        isExpanded ? 'gap-3 px-3 justify-start' : 'justify-center'
                    )}
                >
                    <Flame className="h-5 w-5 shrink-0 text-[#38BDF8]" />
                    <span
                        className={cn(
                            'overflow-hidden whitespace-nowrap text-sm font-semibold text-[#E5E7EB] transition-all duration-300',
                            isExpanded ? 'max-w-[140px] opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-1'
                        )}
                    >
                        Willofire
                    </span>
                </Link>

                <nav className="flex-1 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group relative flex h-11 items-center rounded-2xl transition-all duration-300',
                                    isExpanded ? 'justify-start gap-3 px-3' : 'justify-center',
                                    isActive
                                        ? 'bg-[#111827] text-[#E5E7EB]'
                                        : 'text-[#9CA3AF] hover:bg-[#111827]/70 hover:text-[#E5E7EB]'
                                )}
                            >
                                {isActive && (
                                    <span className="absolute inset-0 rounded-2xl shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_0_28px_rgba(37,99,235,0.18)]" />
                                )}
                                <Icon className={cn('relative z-10 h-5 w-5 shrink-0', isActive && 'text-[#38BDF8]')} />
                                <span
                                    className={cn(
                                        'relative z-10 overflow-hidden whitespace-nowrap text-sm transition-all duration-300',
                                        isExpanded ? 'max-w-[140px] opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-1'
                                    )}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}

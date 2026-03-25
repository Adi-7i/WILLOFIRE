'use client';

import { Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import { useLogout } from '@/features/auth/useAuth';

interface TopbarProps {
    onOpenSidebar: () => void;
}

const getPageTitle = (pathname: string) => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.includes('/pdfs')) return 'My PDFs';
    if (pathname.includes('/ask')) return 'Ask PDF';
    if (pathname.includes('/mock-tests')) return 'Mock Tests';
    if (pathname.includes('/evaluation')) return 'Answer Evaluation';
    if (pathname.includes('/downloads')) return 'Downloads';
    return 'Dashboard';
};

export function Topbar({ onOpenSidebar }: TopbarProps) {
    const pathname = usePathname();
    const logout = useLogout();

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-[#1F2937] bg-[#0B1120]/85 px-4 backdrop-blur-lg sm:gap-x-6 sm:px-6 lg:px-8">
            <Button
                variant="ghost"
                size="icon"
                className="-m-2.5 p-2.5 text-[#9CA3AF] hover:bg-[#111827] hover:text-[#E5E7EB] md:hidden"
                onClick={onOpenSidebar}
            >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>

            <div className="h-6 w-px bg-[#1F2937] md:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <div className="flex flex-1 items-center">
                    <h1 className="text-xl font-semibold leading-6 text-[#E5E7EB]">
                        {getPageTitle(pathname)}
                    </h1>
                </div>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-[#111827] text-[#BFDBFE] font-medium border border-[#1F2937]">WF</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Willofire User</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        Logged in
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => logout.mutate()}
                                className="text-red-600 focus:bg-red-50 focus:text-red-600"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{logout.isPending ? 'Logging out...' : 'Log out'}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

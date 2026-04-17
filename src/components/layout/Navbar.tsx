'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, CheckSquare, Settings, List, Tag, ChevronDown, Users } from 'lucide-react';
import UserInfo from '@/features/auth/components/UserInfo';
import ProjectSelector from '@/features/projects/components/ProjectSelector';

const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Backlog', href: '/backlog', icon: List },
    { name: 'Settings', href: '/settings', icon: Settings },
];

const adminLinks = [
    { name: 'Projects', href: '/projects', icon: CheckSquare },
    { name: 'Labels', href: '/admin/labels', icon: Tag },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isAdminOpen, setIsAdminOpen] = useState(false);

    const isAdminActive = pathname.startsWith('/admin') || pathname.startsWith('/projects');

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 mr-8">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                        <CheckSquare size={20} strokeWidth={3} />
                    </div>
                    <span className="font-bold text-lg tracking-tight hidden md:inline-block">TaskForge360</span>
                </div>

                <nav className="flex items-center gap-4 text-sm font-medium flex-1">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 transition-colors hover:text-foreground/80 ${isActive ? 'text-foreground' : 'text-foreground/60'}`}
                            >
                                <Icon size={16} />
                                <span className="hidden lg:inline-block">{link.name}</span>
                            </Link>
                        );
                    })}

                    <div className="relative">
                        <button
                            onClick={() => setIsAdminOpen(!isAdminOpen)}
                            className={`flex items-center gap-2 transition-colors hover:text-foreground/80 ${isAdminActive ? 'text-foreground' : 'text-foreground/60'}`}
                        >
                            <Users size={16} />
                            <span className="hidden lg:inline-block">Admin</span>
                            <ChevronDown size={14} className={`transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isAdminOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setIsAdminOpen(false)}
                                />
                                <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border/60 rounded-xl shadow-lg z-50 overflow-hidden">
                                    {adminLinks.map((link) => {
                                        const Icon = link.icon;
                                        const isActive = pathname === link.href || pathname.startsWith(link.href);

                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setIsAdminOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50 ${isActive ? 'bg-accent/30 text-primary' : 'text-foreground/80'}`}
                                            >
                                                <Icon size={16} />
                                                {link.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </nav>

                <div className="flex items-center gap-3">
                    <ProjectSelector />
                    <UserInfo />
                </div>
            </div>
        </header>
    );
}
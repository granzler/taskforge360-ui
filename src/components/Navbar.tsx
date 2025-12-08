'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CheckSquare, Settings } from 'lucide-react';
import UserInfo from './UserInfo';

// Map of links to display in the navbar
const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 mr-8">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                        <CheckSquare size={20} strokeWidth={3} />
                    </div>
                    <span className="font-bold text-lg tracking-tight hidden md:inline-block">TaskForge360</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="flex items-center gap-6 text-sm font-medium flex-1">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 transition-colors hover:text-foreground/80 ${isActive ? 'text-foreground' : 'text-foreground/60'
                                    }`}
                            >
                                <Icon size={16} />
                                <span className="hidden lg:inline-block">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Actions */}
                <div className="flex items-center gap-4">
                    <UserInfo />
                </div>
            </div>
        </header>
    );
}

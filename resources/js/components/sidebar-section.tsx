// components/sidebar-section.tsx
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    items: NavItem[];
    storageKey?: string;
};

const matchesUrl = (currentUrl: string, href?: string) =>
    Boolean(href && (currentUrl === href || currentUrl.startsWith(`${href}/`) || currentUrl.startsWith(`${href}?`)));

export default function SidebarSection({ items, storageKey = 'sidebar-open-menus' }: Props) {
    const page = usePage();
    const currentUrl = page.url;
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        let parsed: Record<string, boolean> = {};

        if (stored) {
            try {
                parsed = JSON.parse(stored);
            } catch {
                parsed = {};
            }
        }

        items.forEach((item) => {
            if (item.children?.some((child) => matchesUrl(currentUrl, child.href)) && !parsed[item.title]) {
                parsed[item.title] = true;
            }
        });

        setOpenMenus(parsed);
    }, [currentUrl, items, storageKey]);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(openMenus));
    }, [openMenus, storageKey]);

    const toggleMenu = (title: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <SidebarMenu>
            {items.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openMenus[item.title] || false;
                const isActive = matchesUrl(currentUrl, item.href) || item.children?.some((child) => matchesUrl(currentUrl, child.href));

                return (
                    <div key={item.title}>
                        <SidebarMenuItem>
                            {hasChildren ? (
                                <SidebarMenuButton
                                    asChild={false}
                                    onClick={() => toggleMenu(item.title)}
                                    isActive={isActive}
                                    aria-expanded={isOpen}
                                    tooltip={{ children: item.title }}
                                    className="justify-between"
                                >
                                    <div className="flex items-center space-x-2">
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </div>
                                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </SidebarMenuButton>
                            ) : (
                                <SidebarMenuButton asChild isActive={isActive} tooltip={{ children: item.title }}>
                                    <Link href={item.href ?? '#'}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>

                        <AnimatePresence initial={false}>
                            {hasChildren && isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-1 ml-4 space-y-1 overflow-hidden border-l border-sidebar-border pl-2"
                                >
                                    {item.children?.map((child) => (
                                        <SidebarMenuItem key={child.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={matchesUrl(currentUrl, child.href)}
                                                tooltip={{ children: child.title }}
                                            >
                                                <Link href={child.href ?? '#'}>
                                                    {child.icon && <child.icon size={16} />}
                                                    <span>{child.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </SidebarMenu>
    );
}

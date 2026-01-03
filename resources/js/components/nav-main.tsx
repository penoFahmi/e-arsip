"use client";

import { ChevronRight } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { resolveUrl, cn } from "@/lib/utils";
import { type NavItem } from "@/types";
import { Link, usePage } from "@inertiajs/react";

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isUrlActive = (href: string) => {
                         if (href === '#' || href === '') return false;
                         return page.url.startsWith(resolveUrl(href));
                    }

                    const hasSubMenu = item.items && item.items.length > 0;
                    const isSubMenuActive = hasSubMenu && item.items?.some(subItem =>
                        isUrlActive(subItem.href)
                    );

                    const activeClass = "bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";

                    if (hasSubMenu) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={isSubMenuActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            className={cn(isSubMenuActive && activeClass)}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => {
                                                 const isChildActive = isUrlActive(subItem.href);
                                                 return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            className={cn(isChildActive && "font-medium text-blue-600 bg-transparent")}
                                                        >
                                                            <Link href={subItem.href}>
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                )
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    const isActive = isUrlActive(item.href);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={cn(isActive && activeClass)}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

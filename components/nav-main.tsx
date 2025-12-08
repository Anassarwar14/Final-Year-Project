"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
    isActive?: boolean
    badge?: string
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  
  const basePath = "/dashboard" 
  const pathname = usePathname()

  console.log('Current pathname:', pathname) // Debug log

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const fullPath = item.url === '/' ? basePath : basePath + item.url
          const isItemActive = pathname === fullPath || (item.items?.some(subItem => pathname === (subItem.url === item.url ? basePath + subItem.url : subItem.url.startsWith('/') ? basePath + subItem.url : basePath + '/' + subItem.url)))
          
          console.log(`Item: ${item.title}, fullPath: ${fullPath}, pathname: ${pathname}, isActive: ${!item.items && pathname === fullPath}`) // Debug log
          
          return (
            <Collapsible key={item.title} asChild defaultOpen={isItemActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} asChild isActive={!item.items && pathname === fullPath}>
                    <Link href={fullPath}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.items && (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const subPath = subItem.url.startsWith('/dashboard') ? subItem.url : basePath + subItem.url
                        console.log(`SubItem: ${subItem.title}, subPath: ${subPath}, pathname: ${pathname}, isActive: ${pathname === subPath}`) // Debug
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={pathname === subPath}>
                              <Link href={subPath}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

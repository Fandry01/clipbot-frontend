import { useMemo } from "react"
import { NavLink, useNavigate,useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "./ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  LayoutDashboard,
  Library,
  Upload,
  Palette,
  User,
  ChevronUp, 
  LogOut, 
  Settings
} from "lucide-react"



type NavItem = {
  title: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  activePrefixes?: string[]
}

const items: NavItem[] = [
  { title: "Overview", to: "/dashboard/overview", icon: LayoutDashboard, activePrefixes: ["/dashboard/project/", "/dashboard/media/", "/dashboard/clip/"] },
  { title: "Library", to: "/dashboard/library", icon: Library },
  { title: "Uploads", to: "/dashboard/uploads", icon: Upload },
  { title: "Brand template", to: "/dashboard/brand-template", icon: Palette },
  { title: "Me", to: "/dashboard/me", icon: User },
]

export function AppSidebar() {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { state } = useSidebar() 
    const collapsed = state === "collapsed"
  const user = {
    name: "Builder",              // TODO: uit auth/profile halen
    email: "builder@clipbot.ai",  // TODO
    avatarUrl: "",                // optional
  }
  const initials = useMemo(() => {
      const parts = user.name.trim().split(/\s+/).slice(0, 2)
      return parts.map((p) => p[0]?.toUpperCase()).join("")
    }, [user.name])
  const logout = () => {
    // TODO: jouw auth logout (supabase / jwt / etc)
    navigate("/login") // of wat jullie route is
  }

return (
    <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader className="p-1">
          <div className={["flex items-center rounded-md", collapsed ? "justify-center px-0 py-2" : "gap-2 px-2 py-1.5", ].join(" ")}>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold">
              V
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold leading-4">Vrame</div>
                <div className="truncate text-xs text-muted-foreground">Dashboard</div>
              </div>
            )}
          </div>
        </SidebarHeader>

      <SidebarContent className={collapsed ? "pt-7" : ""} >
      <SidebarGroup className={collapsed ? "p-1" : ""}>
        {!collapsed && <SidebarGroupLabel>Dashboard</SidebarGroupLabel>}

        <SidebarGroupContent className={collapsed ? "flex justify-center" : ""}>
          <SidebarMenu className={collapsed ? "gap-2 items-center" : "gap-2"}>
            {items.map((item) => {
              const isActive =
                pathname === item.to ||
                pathname.startsWith(item.to + "/") ||
                (item.activePrefixes?.some((p) => pathname.startsWith(p)) ?? false)

              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={collapsed ? "!size-10 !p-0 justify-center" : ""}
                  >
                    <NavLink to={item.to}>
                      <item.icon className="h-4 w-4" />
                      <span className={collapsed ? "sr-only" : ""}>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

      <SidebarFooter className="mt-auto p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={[
                "w-full gap-2 px-2",
                collapsed ? "justify-center" : "justify-start",
              ].join(" ")}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-medium">{user.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 opacity-70" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/me")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

    </Sidebar>
  )
}

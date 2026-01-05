import { Outlet } from "react-router-dom"
import { AppSidebar } from "../components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar"

export default function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 px-7">
          <SidebarTrigger/>
        </header>
        <main className="p-16 pt-2">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

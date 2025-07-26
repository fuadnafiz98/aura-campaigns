import { Outlet } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";

export default function App() {
  return (
    <SidebarProvider>
      <Outlet />
    </SidebarProvider>
  );
}

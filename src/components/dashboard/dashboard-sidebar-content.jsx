import { cn } from "@/lib/utils";
import { userRoles } from "@/utils/constants";
import { clientItems, freelancerItems } from "@/utils/sidebar-items";
import { Link, useLocation } from "react-router-dom";

export default function DashboardSidebarContent({ userRole }) {
  const location = useLocation();
  const sidebarItems =
    userRole === userRoles.FREELANCER ? freelancerItems : clientItems;

  return (
    <nav className="space-y-1 px-3 py-2">
      {sidebarItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center space-x-3 rounded-lg px-3 py-[10px] text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-primary text-white hover:shadow-md hover:bg-primary/80 hover:text-white"
                : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import FullscreenLoader from "@/components/FullScreenLoader";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

export default function Dashboard() {
  const { userRole, authLoading, isAuthenticated } = useAuth();
  const [activeItem, setActiveItem] = useState("/dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (userRole === null) {
    return null;
  }

  if (authLoading) {
    return <FullscreenLoader show={true} />;
  }

  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-background flex flex-col">
      <Helmet>
        <title>
          FG - {userRole === "freelancer" ? "Freelancer" : "Client"} Dashboard
        </title>
        <meta name="description" content="Dashboard" />
        <meta name="keywords" content="Dashboard" />
      </Helmet>
      {/* Dashboard Header */}
      <div>
        <DashboardHeader
          userRole={userRole}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
      </div>

      {/* Layout Content */}
      <div className="relative flex-1 flex max-h-full overflow-y-auto">
        <DashboardSidebar
          userRole={userRole}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
        <main className="flex-1 h-fit p-4 md:p-6">
          <Outlet context={{ activeItem, setActiveItem }} />
        </main>
      </div>
    </div>
  );
}

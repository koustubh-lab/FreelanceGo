"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import FreelancerProfile from "@/components/profile/freelancer-profile";
import ClientProfile from "@/components/profile/client-profile";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";

export default function ProfilePage() {
  // const [userRole, setUserRole] = useState<"freelancer" | "client">("freelancer")
  const [userRole, setUserRole] = useState("freelancer");

  return (
    <main className="flex-1 p-4 md:p-6">
      <Helmet>
        <title>
          FG - {userRole === "freelancer" ? "Freelancer" : "Client"} Profile
        </title>
        <meta name="description" content="Profile" />
        <meta name="keywords" content="Profile" />
      </Helmet>
      <div className="max-w-5xl mx-auto">
        {/* Page Header with Role Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {userRole === "freelancer"
                ? "Freelancer Profile"
                : "Client Profile"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {userRole === "freelancer"
                ? "Manage your professional profile and showcase your work"
                : "Manage your company profile and hiring history"}
            </p>
          </div>
          <div className="flex gap-2 bg-secondary rounded-lg p-1">
            <Button
              variant={userRole === "freelancer" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUserRole("freelancer")}
              className="gap-2"
            >
              Freelancer
            </Button>
            <Button
              variant={userRole === "client" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUserRole("client")}
              className="gap-2"
            >
              Client
            </Button>
          </div>
        </div>

        {/* Profile Content */}
        {userRole === "freelancer" ? <FreelancerProfile /> : <ClientProfile />}
      </div>
    </main>
  );
}

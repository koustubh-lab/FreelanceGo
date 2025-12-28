import { apiClient } from "@/api/AxiosServiceApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { userRoles } from "@/utils/constants";
import {
  Briefcase,
  Clock,
  DollarSign,
  Plus,
  PlusCircle,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

export default function DashboardContent() {
  const { userRole, token, authLoading } = useAuth();
  const { activeItem, setActiveItem } = useOutletContext();

  const [dashboardData, setDashboardData] = useState({
    activeProjects: [],
    recentJobPosts: [],
    completedJobs: [],
    dashboard: {
      totalJobs: 0,
      totalActiveProjects: 0,
      totalSpending: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (token) => {
    if (!authLoading && token) {
      try {
        setLoading(true);
        const response = await apiClient.get(
          "/api/dashboard/get-post-in-progress",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          },
        );
        const { data } = response;
        setDashboardData(data);
        console.log(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData(token);
  }, [token, authLoading]);

  // Generate stats based on fetched data
  const getStats = () => {
    if (userRole === userRoles.FREELANCER) {
      return [
        {
          title: "Total Earnings",
          value: "$12,450", // You'll need to add this to your API
          change: "+12.5%",
          changeType: "positive",
          icon: DollarSign,
        },
        {
          title: "Active Projects",
          value: dashboardData.dashboard.totalActiveProjects.toString(),
          change: "+2",
          changeType: "positive",
          icon: Briefcase,
        },
        {
          title: "Pending Proposals",
          value: "15", // You'll need to add this to your API
          change: "-3",
          changeType: "negative",
          icon: Clock,
        },
        {
          title: "Success Rate",
          value: "87%", // You'll need to add this to your API
          change: "+5%",
          changeType: "positive",
          icon: TrendingUp,
        },
      ];
    } else {
      return [
        {
          title: "Total Spent",
          value: `$${dashboardData.dashboard.totalSpending.toLocaleString()}`,
          change: "+18.2%",
          changeType: "positive",
          icon: DollarSign,
        },
        {
          title: "Active Projects",
          value: dashboardData.dashboard.totalActiveProjects.toString(),
          change: "+4",
          changeType: "positive",
          icon: Briefcase,
        },
        {
          title: "Job Posts",
          value: dashboardData.dashboard.totalJobs.toString(),
          change: "+1",
          changeType: "positive",
          icon: PlusCircle,
        },
        {
          title: "Hired Freelancers",
          value: "23", // You'll need to add this to your API
          change: "+7",
          changeType: "positive",
          icon: UserCheck,
        },
      ];
    }
  };

  // Transform active projects for display
  const getProjects = () => {
    return dashboardData.activeProjects.map((project) => {
      const job = project.job;
      return {
        title: job.jobTitle,
        client:
          userRole === userRoles.FREELANCER
            ? job.clientDto.companyName
            : project.freelancer?.userDto.username || "N/A",
        freelancer: project.freelancer?.userDto.username,
        status: project.status,
        budget: job.budget.toLocaleString(),
        deadline: new Date(job.projectEndTime).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        progress: 65, // You'll need to add progress tracking to your API
      };
    });
  };

  // Transform recent job posts for display
  const getRecentActivity = () => {
    if (userRole === userRoles.FREELANCER) {
      // For freelancer, show their bids (you'll need to add this to your API)
      return []; // Placeholder - add bid data when available
    } else {
      // For client, show recent job posts
      return dashboardData.recentJobPosts.map((job) => ({
        title: job.jobTitle,
        budget: `$${job.budget.toLocaleString()}`,
        proposals: job.proposalsCount,
        status: job.status === "INACTIVE" ? "Active" : job.status,
        postedAt: new Date(job.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const projects = getProjects();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {userRole === userRoles.FREELANCER ? "Freelancer" : "Client"}{" "}
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {userRole === userRoles.FREELANCER
              ? "Welcome back! Here's what's happening with your freelance work."
              : "Welcome back! Here's an overview of your projects and hiring activity."}
          </p>
        </div>
        <Link
          to={
            userRole === userRoles.FREELANCER
              ? "/dashboard/browse-jobs"
              : "/dashboard/post-job"
          }
          onClick={() =>
            setActiveItem(
              userRole === userRoles.FREELANCER
                ? "/dashboard/browse-jobs"
                : "/dashboard/post-job",
            )
          }
        >
          <Button className="w-full sm:w-auto">
            {userRole === userRoles.FREELANCER ? (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Browse Jobs
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Post a Job
              </>
            )}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="space-y-0">
            <CardTitle className="text-lg md:text-xl">
              {userRole === userRoles.FREELANCER
                ? "Recent Projects"
                : "Active Projects"}
            </CardTitle>
            <CardDescription className="text-sm">
              {userRole === userRoles.FREELANCER
                ? "Your active and recently completed projects"
                : "Projects you're currently managing"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active projects yet
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="rounded-lg border p-4 space-y-3">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <h4 className="font-semibold text-sm md:text-base">
                          {project.title}
                        </h4>
                        <Badge
                          variant={
                            project.status === "COMPLETED"
                              ? "default"
                              : "outline"
                          }
                          className="w-fit"
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 text-xs md:text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Users className="mr-1 h-3 w-3" />
                          {userRole === userRoles.FREELANCER
                            ? project.client
                            : project.freelancer}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="mr-1 h-3 w-3" />
                          {project.budget}
                        </span>
                        <span className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {project.deadline}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Project Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="space-y-0">
            <CardTitle className="text-lg md:text-xl">
              {userRole === userRoles.FREELANCER
                ? "Recent Bids"
                : "Recent Job Posts"}
            </CardTitle>
            <CardDescription className="text-sm">
              {userRole === userRoles.FREELANCER
                ? "Your latest proposal submissions"
                : "Your recent job postings and proposals"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {userRole === userRoles.FREELANCER
                  ? "No recent bids"
                  : "No recent job posts"}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <div key={index} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm leading-tight pr-2">
                        {item.title}
                      </h3>
                      <Badge
                        variant={
                          item.status === "Shortlisted" ||
                          item.status === "Hired"
                            ? "default"
                            : item.status === "Pending" ||
                                item.status === "Reviewing"
                              ? "secondary"
                              : item.status === "Active"
                                ? "outline"
                                : "destructive"
                        }
                        className="text-xs flex-shrink-0"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {userRole === userRoles.FREELANCER ? (
                        <>
                          <div>Budget: {item.budget}</div>
                          <div>Your bid: {item.bidAmount}</div>
                          <div>{item.submittedAt}</div>
                        </>
                      ) : (
                        <>
                          <div>Budget: {item.budget}</div>
                          <div>Proposals: {item.proposals}</div>
                          <div>{item.postedAt}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

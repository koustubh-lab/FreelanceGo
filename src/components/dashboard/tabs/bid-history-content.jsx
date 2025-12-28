import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Clock, Eye, Users, FileText } from "lucide-react";
import { userRoles } from "@/utils/constants.js";
import { useAuth } from "@/context/AuthContext.jsx";
import FullScreenLoader from "@/components/FullScreenLoader.jsx";

const freelancerBidHistory = [
  {
    id: 1,
    title: "Full-Stack Web Application Development",
    client: "TechStartup Inc.",
    budget: "$5,000 - $8,000",
    bidAmount: "$6,500",
    status: "Won",
    submittedAt: "2024-01-15",
    responseTime: "2 days",
    description:
      "Looking for an experienced full-stack developer to build a modern web application...",
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design",
    client: "DesignCorp",
    budget: "$2,000 - $3,500",
    bidAmount: "$2,800",
    status: "Shortlisted",
    submittedAt: "2024-01-12",
    responseTime: "Pending",
    description:
      "Need a creative designer to redesign our mobile application interface...",
  },
  {
    id: 3,
    title: "E-commerce Website Optimization",
    client: "RetailPro",
    budget: "$1,500 - $2,500",
    bidAmount: "$2,000",
    status: "Rejected",
    submittedAt: "2024-01-10",
    responseTime: "1 day",
    description:
      "Optimize our existing e-commerce platform for better performance and SEO...",
  },
];

// Client job posting history
const clientJobHistory = [
  {
    id: 1,
    title: "React Developer for SaaS Platform",
    budget: "$4,000 - $6,000",
    proposals: 23,
    status: "Hired",
    postedAt: "2024-01-20",
    hiredFreelancer: "Sarah Johnson",
    description:
      "Looking for an experienced React developer to join our SaaS platform development...",
  },
  {
    id: 2,
    title: "Brand Identity Design Package",
    budget: "$1,500 - $2,500",
    proposals: 15,
    status: "In Review",
    postedAt: "2024-01-18",
    hiredFreelancer: null,
    description:
      "Need a complete brand identity package including logo, colors, and guidelines...",
  },
  {
    id: 3,
    title: "Content Writing for Tech Blog",
    budget: "$800 - $1,200",
    proposals: 31,
    status: "Completed",
    postedAt: "2024-01-15",
    hiredFreelancer: "Mike Chen",
    description:
      "Looking for technical content writers to create engaging blog posts...",
  },
];

export default function BidHistoryContent({ userRole }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const { authLoading } = useAuth();

  const data =
    userRole === userRoles.FREELANCER ? freelancerBidHistory : clientJobHistory;

  const filteredData = data.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case "won":
      case "hired":
      case "completed":
        return "default";
      case "shortlisted":
      case "in review":
        return "secondary";
      case "pending":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStats = () => {
    if (userRole === userRoles.FREELANCER) {
      return {
        total: freelancerBidHistory.length,
        won: freelancerBidHistory.filter((bid) => bid.status === "Won").length,
        pending: freelancerBidHistory.filter((bid) => bid.status === "Pending")
          .length,
        rejected: freelancerBidHistory.filter(
          (bid) => bid.status === "Rejected",
        ).length,
        successRate: Math.round(
          (freelancerBidHistory.filter((bid) => bid.status === "Won").length /
            freelancerBidHistory.length) *
            100,
        ),
      };
    } else {
      return {
        total: clientJobHistory.length,
        hired: clientJobHistory.filter((job) => job.status === "Hired").length,
        inReview: clientJobHistory.filter((job) => job.status === "In Review")
          .length,
        completed: clientJobHistory.filter((job) => job.status === "Completed")
          .length,
        totalProposals: clientJobHistory.reduce(
          (sum, job) => sum + job.proposals,
          0,
        ),
      };
    }
  };

  const stats = getStats();

  if (authLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {userRole === userRoles.FREELANCER
            ? "Bid History"
            : "Job Posting History"}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {userRole === userRoles.FREELANCER
            ? "Track all your proposal submissions and their outcomes"
            : "Manage your job postings and review proposals"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {userRole === userRoles.FREELANCER ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  Total Bids
                </CardTitle>
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {stats.total}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  Won
                </CardTitle>
                <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {stats.won}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  Pending
                </CardTitle>
                <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  Rejected
                </CardTitle>
                <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-red-600">
                  {stats.rejected}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2 sm:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  Success Rate
                </CardTitle>
                <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {stats.successRate}%
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  Total Jobs
                </CardTitle>
                <FileText className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {stats.total}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  Hired
                </CardTitle>
                <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {stats.hired}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  In Review
                </CardTitle>
                <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-yellow-600">
                  {stats.inReview}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  Completed
                </CardTitle>
                <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {stats.completed}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2 sm:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  Total Proposals
                </CardTitle>
                <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {stats.totalProposals}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search by ${userRole === userRoles.FREELANCER ? "project title or client" : "job title"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {userRole === userRoles.FREELANCER ? (
                  <>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="in review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Budget</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            {userRole === userRoles.FREELANCER
              ? `Your Bids (${filteredData.length})`
              : `Your Jobs (${filteredData.length})`}
          </CardTitle>
          <CardDescription className="text-sm">
            {userRole === userRoles.FREELANCER
              ? "Complete history of your proposal submissions"
              : "Complete history of your job postings"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border p-4 md:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                  <div className="space-y-2 flex-1 pr-0 sm:pr-4">
                    <h3 className="font-semibold text-base md:text-lg">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusColor(item.status)}
                    className="w-fit"
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {userRole === userRoles.FREELANCER ? (
                    <>
                      <div className="space-y-1">
                        <div className="font-medium">Client</div>
                        <div className="text-muted-foreground">
                          {item.client}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">Budget Range</div>
                        <div className="text-muted-foreground">
                          {item.budget}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">Your Bid</div>
                        <div className="text-muted-foreground font-semibold">
                          {item.bidAmount}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">Submitted</div>
                        <div className="text-muted-foreground">
                          {item.submittedAt}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <div className="font-medium">Budget</div>
                        <div className="text-muted-foreground">
                          {item.budget}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">Proposals</div>
                        <div className="text-muted-foreground">
                          {item.proposals}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">Hired</div>
                        <div className="text-muted-foreground">
                          {item.hiredFreelancer || "None"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">Posted</div>
                        <div className="text-muted-foreground">
                          {item.postedAt}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {userRole === userRoles.FREELANCER ? (
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        Response: {item.responseTime}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {item.proposals} proposals received
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto bg-transparent"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { apiClient } from "@/api/AxiosServiceApi";
import InlineLoader from "@/components/InlineLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { userRoles } from "@/utils/constants";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  IndianRupee,
  Info,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Search,
  Trash,
  Users,
  View,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";

export default function JobPostsContent({ userRole }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [expandedJobs, setExpandedJobs] = useState({});
  const { authLoading } = useAuth();

  const navigate = useNavigate();
  const CURRENT_THEME = localStorage.getItem("theme");

  // 🧩 Fetch paginated job posts
  const fetchPosts = async (
    pageNum = 0,
    status = statusFilter,
    search = searchTerm,
  ) => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/dashboard/get-post", {
        params: {
          page: pageNum,
          size: 5,
          status: status === "all" ? undefined : status,
          search: search.trim() || undefined,
        },
      });
      const { content, totalPages, totalElements } = response.data;

      setJobPosts(Array.isArray(content) ? content : []);
      setTotalPages(totalPages);
      setTotalJobs(totalElements);
      setPage(pageNum);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(0, statusFilter, searchTerm);
  }, [statusFilter, searchTerm]);

  const getPhaseColor = (phase) => {
    switch (phase?.toUpperCase()) {
      case "PENDING":
        return "outline";
      case "IN_PROGRESS":
        return "default";
      case "SUCCESS":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPhaseIcon = (phase) => {
    switch (phase?.toUpperCase()) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <Play className="h-4 w-4" />;
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4" />;
      case "FAILED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPhaseBorderColor = (phase) => {
    switch (phase?.toUpperCase()) {
      case "PENDING":
        return "border-l-yellow-500";
      case "IN_PROGRESS":
        return "border-l-blue-500";
      case "SUCCESS":
        return "border-l-green-500";
      case "FAILED":
        return "border-l-red-500";
      default:
        return "border-l-gray-300";
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchPosts(newPage);
    }
  };

  const toggleJobDescription = (jobId) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const shouldShowToggle = (description) => {
    if (!description) return false;
    // Only show toggle if description is longer than 200 characters
    return description.length > 200;
  };

  // 🧠 If user is freelancer — block job management
  if (userRole === userRoles.FREELANCER) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Switch to Client Role</CardTitle>
            <CardDescription>
              You need to be in client mode to manage job posts. Switch your
              role to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Switch to Client
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authLoading) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            My Job Posts
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your posted jobs and track their performance
          </p>
        </div>
        <div className="flex justify-end *:flex-1 sm:*:flex-none items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" onClick={() => navigate("/dashboard/post-job")}>
            <Plus className="h-4 w-4" />
            <span className="inline ml-2">Post New Job</span>
          </Button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <InlineLoader />
            </div>
          ) : jobPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobPosts.map((job) => (
                <div
                  key={job.id}
                  className={`border rounded-lg border-l-4 ${getPhaseBorderColor(job.phase)} p-4 sm:p-6 hover:shadow-md transition-shadow`}
                >
                  <div className="space-y-4">
                    {/* Title with inline phase badge */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 flex flex-col sm:flex-row sm:justify-between">
                          <h3 className="font-semibold text-base sm:text-lg break-words">
                            {job.jobTitle}
                          </h3>
                          {/* Phase badge inline with title on mobile, separate on larger screens */}
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getPhaseColor(job.phase)}
                              className="flex items-center space-x-1 w-fit"
                            >
                              <span className="text-xs">{job.phase}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Job Description with Toggle */}
                      <div className="mt-2">
                        <p
                          className={`text-sm text-muted-foreground whitespace-pre-wrap ${
                            shouldShowToggle(job.jobDescription) &&
                            !expandedJobs[job.id]
                              ? "line-clamp-3"
                              : ""
                          }`}
                        >
                          {job.jobDescription}
                        </p>
                        {shouldShowToggle(job.jobDescription) && (
                          <button
                            onClick={() => toggleJobDescription(job.id)}
                            className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                            aria-label={
                              expandedJobs[job.id]
                                ? "Show less description"
                                : "Show more description"
                            }
                          >
                            {expandedJobs[job.id] ? (
                              <>
                                Show less
                                <ChevronUp className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                Show more
                                <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={"grid grid-cols-1 sm:grid-cols-2 gap-2"}>
                      {/* Skills */}
                      {job.requiredSkills?.length > 0 && (
                        <div className={"space-y-2"}>
                          <h3 className={"text-xs font-medium"}>
                            Required Skills:
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {job.requiredSkills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attachment */}
                      {job.file && (
                        <div className={"space-y-1"}>
                          <h3 className={"text-xs font-medium"}>Attachment:</h3>
                          <div className="text-sm">
                            <a
                              href={job.file}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto"
                              >
                                <span>Open Link</span>
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Job Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 bg-muted/50 border px-3 py-2 rounded-md">
                        <IndianRupee className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          Budget:{" "}
                          {job.budget ? job.budget.toLocaleString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 border px-3 py-2 rounded-md">
                        <Users className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          No of Proposals: {job.proposalsCount || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 border px-3 py-2 rounded-md">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          Posted:{" "}
                          {format(new Date(job.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 border px-3 py-2 rounded-md">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          Deadline:{" "}
                          {format(new Date(job.projectEndTime), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Link to={`/dashboard/job/${job.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="sm:w-auto w-full"
                          >
                            <MoreVertical className="h-4 w-4 sm:mr-0 mr-2" />
                            <span className="sm:hidden">More Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          side={"top"}
                          className="w-48"
                        >
                          <DropdownMenuItem
                            className={`${job.phase !== "PENDING" ? "pointer-events-none opacity-50" : ""}`}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={
                              job.proposalsCount
                                ? ""
                                : "pointer-events-none opacity-50"
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Review Bids
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          {job.status === "ACTIVE" && (
                            <DropdownMenuItem className="text-primary">
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </DropdownMenuItem>
                          )}
                          {job.status === "INACTIVE" &&
                            job.phase === "PENDING" && (
                              <DropdownMenuItem className="text-green-500">
                                <Play className="mr-2 h-4 w-4" />
                                Resume
                              </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Page {page + 1} of {totalPages} ({totalJobs} total jobs)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

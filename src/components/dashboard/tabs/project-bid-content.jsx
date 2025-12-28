import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  ArrowLeft,
  Star,
  MapPin,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Briefcase,
  Award,
  FileText,
  User,
  ThumbsUp,
  ThumbsDown,
  Send,
  DollarSign,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { RUPEE } from "@/utils/constants";
import { apiClient } from "@/api/AxiosServiceApi.js";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from "sonner";

export default function ProjectBidsContent() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedBid, setSelectedBid] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userId } = useAuth();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchJobDetails = async (jobId) => {
    try {
      const response = await apiClient.get(`/api/dashboard/get-post/${jobId}`);
      setJobDetails(response.data.job);
    } catch (e) {
      console.error("Error fetching job details:", e);
      throw new Error("Failed to load job details");
    }
  };

  const fetchProjectBids = async (jobId, page = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/api/dashboard/get-bids`, {
        params: {
          jobId: jobId,
          page: page,
          size: pageSize,
        },
      });

      const transformedBids = response.data.content.map((bid) => ({
        id: bid.id,
        freelancer: {
          id: bid.freelancerDto.id,
          name: bid.freelancerDto.userDto.username,
          avatar: bid.freelancerDto.userDto.imageData
            ? `data:image/jpeg;base64,${bid.freelancerDto.userDto.imageData}`
            : null,
          title: bid.freelancerDto.designation || "Freelancer",
          rating: 4.5,
          reviewsCount: 0,
          completedJobs: 0,
          location: "Remote",
          verified: true,
          hourlyRate: "Contact for rate",
          bio: bid.freelancerDto.bio || "",
          portfolioUrl: bid.freelancerDto.portfolioUrl || "",
          experienceLevel: bid.freelancerDto.experienceLevel || "ENTRY_LEVEL",
          phone: bid.freelancerDto.phone || "",
        },
        proposal: {
          bidAmount: bid.amount,
          timeline: bid.timeRequired,
          coverLetter: bid.coverLetter,
          skills: bid.freelancerDto.skills || [],
          attachment: bid.attachmentPublicUrl ? bid.attachmentPublicUrl : null,
          submittedAt: bid.submittedAt,
          status: bid.status.toLowerCase(),
          category: bid.category,
        },
      }));

      setBids(transformedBids);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setCurrentPage(response.data.number);
    } catch (e) {
      console.error("Error fetching bids:", e);
      setError("Failed to load project bids. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      Promise.all([
        fetchJobDetails(projectId),
        fetchProjectBids(projectId, currentPage),
      ]).catch((err) => {
        setError(err.message || "Failed to load project data");
        setLoading(false);
      });
    }
  }, [projectId, currentPage]);

  const filteredBids = bids.filter((bid) => {
    const matchesSearch =
      bid.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.proposal.coverLetter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || bid.proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedBids = [...filteredBids].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.proposal.submittedAt).getTime() -
          new Date(a.proposal.submittedAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.proposal.submittedAt).getTime() -
          new Date(b.proposal.submittedAt).getTime()
        );
      case "lowest-bid":
        return a.proposal.bidAmount - b.proposal.bidAmount;
      case "highest-bid":
        return b.proposal.bidAmount - a.proposal.bidAmount;
      case "highest-rated":
        return b.freelancer.rating - a.freelancer.rating;
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
      case "pending":
        return "secondary";
      case "shortlisted":
        return "outline";
      case "accepted":
        return "default";
      case "hired":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
      case "pending":
        return <Eye className="h-4 w-4" />;
      case "shortlisted":
        return <Star className="h-4 w-4" />;
      case "interviewed":
        return <MessageSquare className="h-4 w-4" />;
      case "hired":
        return <CheckCircle className="h-4 w-4" />;
      case "declined":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getBidStats = () => {
    if (!bids || bids.length === 0) {
      return { total: 0, avgBid: 0, lowestBid: 0, highestBid: 0 };
    }
    const total = totalElements;
    const avgBid =
      bids.reduce((sum, bid) => sum + bid.proposal.bidAmount, 0) / bids.length;
    const lowestBid = Math.min(...bids.map((bid) => bid.proposal.bidAmount));
    const highestBid = Math.max(...bids.map((bid) => bid.proposal.bidAmount));

    return { total, avgBid: Math.round(avgBid), lowestBid, highestBid };
  };

  const stats = getBidStats();

  const handleHire = async (bid) => {
    try {
      /*@PostMapping("/create-contract/{bidId}/{jobId}/{clientId}/{freelancerId}")*/
      const response = await apiClient.post(
        `/api/create-contract/${bid.id}/${projectId}/${userId}/${bid.freelancer.id}`,
      );
      const { status } = response;
      if (status === 200) {
        toast.success("Contract created successfully");
        navigate("/dashboard/projects");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExperienceLevelLabel = (level) => {
    const labels = {
      ENTRY_LEVEL: "Entry Level",
      INTERMEDIATE: "Intermediate",
      EXPERT: "Expert",
    };
    return labels[level] || level;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleChatCreation = async (senderId, receiverId) => {
    try {
      const response = await apiClient.post(
        `/api/chat-history/create/${senderId}/${receiverId}`,
      );
      const { status } = response;
      if (status === 200) {
        navigate("/dashboard/messages");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading project details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4 text-destructive">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => navigate("/dashboard/proposals-review")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The project you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/dashboard/proposals-review")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard/proposals-review")}
          className="bg-transparent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>

        <div className="flex-1">
          <div className={"flex items-center gap-3"}>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {jobDetails.jobTitle}
            </h1>
            <Badge
              variant={jobDetails.status === "ACTIVE" ? "default" : "secondary"}
              className="capitalize self-start"
            >
              {jobDetails.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Review {totalElements} proposals for this project
          </p>
        </div>
      </div>

      <Card className="bg-gradient-to-r bg-muted/30 border-blue-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {RUPEE}
                {jobDetails.budget.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Project Budget
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.ceil(
                  (new Date(jobDetails.projectEndTime) -
                    new Date(jobDetails.projectStartTime)) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                days
              </div>
              <div className="text-sm text-muted-foreground">Timeline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalElements}</div>
              <div className="text-sm text-muted-foreground">
                Total Proposals
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {jobDetails.requiredSkills.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Required Skills
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {jobDetails.jobDescription}
              </p>
            </div>

            {jobDetails.requirement && (
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {jobDetails.requirement}
                </p>
              </div>
            )}

            <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
              <div>
                <h3 className="font-semibold mb-2">Project Timeline</h3>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(jobDetails.projectStartTime), "PP")}
                    </span>
                  </div>
                  <div className={"sm:hidden"}>|</div>
                  <div className={"hidden sm:block"}>-</div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(jobDetails.projectEndTime), "PP")}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className={"font-semibold mb-2"}>Experience Required</h3>
                <div className={"text-muted-foreground text-sm"}>
                  {getExperienceLevelLabel(jobDetails.experienceLevel)}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {jobDetails.requiredSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {jobDetails.file && (
                <Button variant="link" size="sm" asChild>
                  <a
                    href={jobDetails.file}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Attachment
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Received proposals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Bid</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {RUPEE}
              {stats.avgBid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Average proposal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Bid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {RUPEE}
              {stats.lowestBid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Most competitive</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Bid</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {RUPEE}
              {stats.highestBid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Premium option</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by freelancer name, title, or proposal content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interviewed">Interviewed</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="lowest-bid">Lowest Bid</SelectItem>
            <SelectItem value="highest-bid">Highest Bid</SelectItem>
            <SelectItem value="highest-rated">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {sortedBids.map((bid) => (
          <Card key={bid.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-8 w-8 sm:h-16 sm:w-16">
                      <AvatarImage
                        src={bid.freelancer.avatar || "/placeholder.svg"}
                        alt={bid.freelancer.name}
                      />
                      <AvatarFallback>
                        {bid.freelancer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-lg">
                          {bid.freelancer.name}
                        </h4>
                        {bid.freelancer.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {bid.freelancer.title} (
                        {bid.freelancer.phone || "No phone number"})
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{bid.freelancer.rating}</span>
                          <span>({bid.freelancer.reviewsCount})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{bid.freelancer.completedJobs} jobs</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{bid.freelancer.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge
                      variant={getStatusColor(bid.proposal.status)}
                      className="flex items-center space-x-1"
                    >
                      {getStatusIcon(bid.proposal.status)}
                      <span className="capitalize">{bid.proposal.status}</span>
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(bid.proposal.submittedAt)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {RUPEE}
                      {bid.proposal.bidAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Proposed Amount
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {bid.proposal.timeline}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Timeline
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {bid.freelancer.hourlyRate}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Hourly Rate
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-semibold">Cover Letter</h5>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-line">
                      {bid.proposal.coverLetter}
                    </p>
                  </div>
                </div>

                {bid.proposal.skills.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-semibold">Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {bid.proposal.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {bid.proposal.attachment && (
                  <div className="space-y-3">
                    <h5 className="font-semibold">Attachments</h5>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={bid.proposal.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Attachment
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {bid.freelancer.portfolioUrl && (
                  <div className="space-y-3">
                    <h5 className="font-semibold">Portfolio</h5>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={bid.freelancer.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        View Portfolio Website
                      </a>
                    </Button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleChatCreation(
                          jobDetails.clientDto.id,
                          bid.freelancer.id,
                        )
                      }
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {bid.proposal.status === "PENDING".toLowerCase() ? (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              Hire Freelancer
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Hire Confirmation</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to hire{" "}
                                {selectedBid?.freelancer?.name} for this job?
                                <p className={"text-red-500"}>
                                  Every other candidate will be automatically
                                  rejected...
                                </p>
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button
                                  variant="secondary"
                                  onClick={() => setSelectedBid(null)}
                                >
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button onClick={() => handleHire(bid)}>
                                Hire
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      <Badge
                        variant={getStatusColor(bid.proposal.status)}
                        className="capitalize"
                      >
                        {bid.proposal.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedBids.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or wait for more freelancers to
            submit proposals.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import { apiClient } from "@/api/AxiosServiceApi";
import InlineLoader from "@/components/InlineLoader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  AlertCircle,
  Eye,
  Filter,
  Heart,
  IndianRupee,
  PhoneCall,
  Search,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function BrowseJobsContent() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination states
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ Fetch paginated jobs
  useEffect(() => {
    (async function fetchJobs() {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/browse-job`, {
          params: { page, size },
        });
        const { data } = res;
        setJobs(data.content || data); // if your backend sends `content` like Spring Pageable
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, size]);

  // ✅ Filtering
  const filteredJobs = jobs.filter((item) => {
    const job = item.job;
    const matchesSearch =
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      categoryFilter === "all" ||
      job.status.toLowerCase() === categoryFilter.toLowerCase();

    const matchesExperience =
      experienceFilter === "all" ||
      job.experienceLevel.toLowerCase() === experienceFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesExperience;
  });

  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId],
    );
  };

  const handleSubmitProposal = (jobId) => {
    navigate(`/dashboard/submit-proposal?jobId=${jobId}`);
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getExperienceColor = (level) => {
    switch (level?.toLowerCase()) {
      case "entry":
        return "text-green-600";
      case "intermediate":
        return "text-blue-600";
      case "expert":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getBudgetColor = (amount) => {
    if (amount < 1000) return "text-orange-600";
    if (amount < 3000) return "text-blue-600";
    if (amount < 5000) return "text-green-600";
    return "text-purple-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Browse Jobs
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Find your next freelance opportunity from {jobs.length} available
            projects
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Heart className="mr-2 h-4 w-4" />
            Saved Jobs ({savedJobs.length})
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by job title, description, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={experienceFilter} onValueChange={setExperienceFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Experience</SelectItem>
              <SelectItem value="ENTRY">Entry</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="EXPERT">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ✅ Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <InlineLoader />
        </div>
      ) : (
        <>
          {/* Job Listings */}
          <div className="space-y-6">
            {filteredJobs.map((item) => {
              const job = item.job;
              const client = job.clientDto;
              const user = client?.userDto;
              const isAlreadyBid = item.alreadyBid;

              const startDate = new Date(job.projectStartTime);
              const endDate = new Date(job.projectEndTime);
              const duration = Math.ceil(
                (endDate - startDate) / (1000 * 60 * 60 * 24),
              );

              return (
                <Card
                  key={job.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-xl">
                          {job.jobTitle}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveJob(job.id)}
                          className={`${
                            savedJobs.includes(job.id)
                              ? "text-red-500"
                              : "text-muted-foreground"
                          } hover:text-red-500`}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              savedJobs.includes(job.id) ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatDate(job.createdAt)}</span>
                        <span>•</span>
                        <span
                          className={
                            getExperienceColor(job.experienceLevel) +
                            " font-medium capitalize"
                          }
                        >
                          {job?.experienceLevel?.toLowerCase()}
                        </span>
                        <span>•</span>
                        <span className="text-green-500 font-medium">
                          Active
                        </span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {job.jobDescription}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="text-center">
                        <div
                          className={`text-lg font-bold flex gap-0 items-center justify-center ${getBudgetColor(
                            job.budget,
                          )}`}
                        >
                          <IndianRupee className="h-4 w-4" />{" "}
                          {job.budget.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Budget
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{duration} days</div>
                        <div className="text-sm text-muted-foreground">
                          Duration
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {format(startDate, "PP")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Start
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {format(endDate, "PP")}
                        </div>
                        <div className="text-sm text-muted-foreground">End</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex flex-col md:flex-row items-center space-x-4 gap-2 w-full">
                        <Avatar className="h-12 w-12">
                          {user?.imageData ? (
                            <AvatarImage
                              src={`data:image/png;base64,${user.imageData}`}
                              alt={user.username}
                            />
                          ) : (
                            <AvatarFallback>
                              {user?.username?.[0] || "?"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="w-full">
                          <div className="flex gap-2">
                            <h4 className="font-semibold">
                              {client?.companyName || "Individual Request"}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <PhoneCall className="h-4 w-4" />
                              <span>{client?.phone || "N/A"}</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Posted by {user?.username}
                          </div>
                          <div className="text-sm text-muted-foreground p-2 bg-muted mt-2 rounded-md">
                            <h5 className="font-semibold mb-2">Bio</h5>
                            <p className="line-clamp-3">"{client?.bio}"</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold mb-2">Required Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <Link to={`/dashboard/job/${job.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitProposal(job.id)}
                        className={`${isAlreadyBid ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        {isAlreadyBid ? (
                          <>
                            <AlertCircle className="mr-2 h-4 w-4" />{" "}
                            <span>Submitted</span>
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />{" "}
                            <span>Submit Proposal</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ✅ Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 pt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setExperienceFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

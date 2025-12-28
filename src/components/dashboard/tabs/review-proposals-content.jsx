"use client";

import { apiClient } from "@/api/AxiosServiceApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Eye,
  FileText,
  Filter,
  Loader2,
  MapPin,
  Phone,
  Search,
  Star,
  Stars,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RUPEE } from "@/utils/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.jsx";

const ITEMS_PER_PAGE = 3;

export default function ReviewProposalsContent() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsToDisplay, setItemsToDisplay] = useState(ITEMS_PER_PAGE);
  const [isObservingLoad, setIsObservingLoad] = useState(false);
  const loadMoreRef = useRef(null);

  const filteredProjects = projects.filter((project) => {
    const title = project.jobTitle || "";
    const description = project.jobDescription || "";
    const skills = project.requiredSkills || [];

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      categoryFilter === "all" || project.category === categoryFilter;

    const budgetAmount = project.budget || 0;
    const matchesBudget =
      budgetFilter === "all" ||
      (budgetFilter === "under-1000" && budgetAmount < 1000) ||
      (budgetFilter === "1000-3000" &&
        budgetAmount >= 1000 &&
        budgetAmount <= 3000) ||
      (budgetFilter === "3000-5000" &&
        budgetAmount >= 3000 &&
        budgetAmount <= 5000) ||
      (budgetFilter === "over-5000" && budgetAmount > 5000);

    return matchesSearch && matchesCategory && matchesBudget;
  });

  const projectsOnPage = filteredProjects.slice(0, itemsToDisplay);
  const hasMore = itemsToDisplay < filteredProjects.length;

  useEffect(() => {
    setItemsToDisplay(ITEMS_PER_PAGE);
    setIsObservingLoad(false);
  }, [searchTerm, categoryFilter, budgetFilter]);

  useEffect(() => {
    if (!hasMore || isObservingLoad) return;

    const loadNextPage = () => {
      setIsObservingLoad(true);
      setTimeout(() => {
        setItemsToDisplay((prevCount) => prevCount + ITEMS_PER_PAGE);
        setIsObservingLoad(false);
      }, 1000);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    const currentRef = loadMoreRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isObservingLoad, filteredProjects.length]);

  const fetchActiveProjects = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/api/dashboard/review-proposals");
      const projectContent = response.data.content || [];
      setProjects(projectContent);
    } catch (error) {
      console.error("Error fetching active projects:", error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveProjects();
  }, []);

  const getProjectStats = () => {
    const totalProjects = projects.length;
    const totalBids = projects.reduce(
      (sum, project) => sum + (project.proposalsCount || 0),
      0,
    );
    const avgBidsPerProject =
      totalProjects > 0 ? (totalBids / totalProjects).toFixed(1) : 0;
    const highestBids =
      projects.length > 0
        ? Math.max(...projects.map((p) => p.proposalsCount || 0))
        : 0;

    return {
      totalProjects,
      totalBids,
      avgBidsPerProject,
      highestBids,
    };
  };

  const stats = getProjectStats();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatBudget = (budget) => {
    if (typeof budget !== "number") {
      return "N/A";
    }
    return `${RUPEE}${budget.toLocaleString()}`;
  };

  const getBudgetColor = (budgetAmount) => {
    if (budgetAmount < 1000) return "text-orange-600";
    if (budgetAmount < 3000) return "text-blue-600";
    if (budgetAmount < 5000) return "text-green-600";
    return "text-purple-600";
  };

  const handleShowBids = (projectId) => {
    navigate(`/dashboard/project-bids/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-blue-500" />
        <span className="text-lg">Fetching active projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Review Proposals
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your active job posts and review incoming proposals
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
          <Button size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Awaiting proposals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalBids}
            </div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Bids/Project
            </CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.avgBidsPerProject}
            </div>
            <p className="text-xs text-muted-foreground">Average interest</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Bids</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.highestBids}
            </div>
            <p className="text-xs text-muted-foreground">
              Most popular project
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by project title, description, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Web Development">Web Development</SelectItem>
            <SelectItem value="Design & Creative">Design & Creative</SelectItem>
            <SelectItem value="Writing & Translation">
              Writing & Translation
            </SelectItem>
            <SelectItem value="Data Science">Data Science</SelectItem>
          </SelectContent>
        </Select>
        <Select value={budgetFilter} onValueChange={setBudgetFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Budgets</SelectItem>
            <SelectItem value="under-1000">Under ₹1,000</SelectItem>
            <SelectItem value="1000-3000">₹1,000 - ₹3,000</SelectItem>
            <SelectItem value="3000-5000">₹3,000 - ₹5,000</SelectItem>
            <SelectItem value="over-5000">Over ₹5,000</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {projectsOnPage.map((project, index) => {
          const isLastProject = index === projectsOnPage.length - 1;
          const refProps = isLastProject && hasMore ? { ref: loadMoreRef } : {};

          return (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow"
              {...refProps}
            >
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-2">
                        {project.jobTitle}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <span>Posted: {formatDate(project.createdAt)}</span>
                        <span>•</span>
                        <TooltipProvider skipDelayDuration={true}>
                          <Tooltip>
                            <TooltipTrigger>
                              <span>{project.experienceLevel}</span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-black border">
                              <p>Required Experience Level</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {project.category && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {project.category}
                            </Badge>
                          </>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {project.jobDescription}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 *:rounded-lg *:bg-muted/50 *:p-3">
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${getBudgetColor(
                          project.budget,
                        )}`}
                      >
                        {formatBudget(project.budget)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Budget
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {project.projectStartTime && project.projectEndTime
                          ? `${Math.ceil(
                              (new Date(project.projectEndTime) -
                                new Date(project.projectStartTime)) /
                                (1000 * 60 * 60 * 24 * 7),
                            )} weeks`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Timeline
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {project.experienceLevel || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Experience
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {project.proposalsCount || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Proposals
                      </div>
                    </div>
                  </div>

                  {/*<div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br rounded-full overflow-hidden flex items-center justify-center text-white font-semibold">
                        {project.clientDto?.companyName?.charAt(0) ||
                          project.clientDto?.userDto?.username?.charAt(0) ||
                          "?"}
                        <img
                          src={`data:image/png;base64, ${project.clientDto.userDto.imageData}`}
                          alt="image"
                        />
                      </div>
                      <div>
                        <div className={"flex items-center gap-2"}>
                          <h4 className="font-semibold">
                            {project.clientDto?.companyName ||
                              project.clientDto?.userDto?.username ||
                              "Unknown Client"}
                          </h4>
                          <p
                            className={
                              "flex items-center gap-2 text-sm text-muted-foreground"
                            }
                          >
                            <Phone className={"w-4 h-4"} />
                            {project.clientDto.phone}
                          </p>
                        </div>
                        <div
                          className={
                            "text-muted-foreground font-medium text-xs"
                          }
                        >
                          posted by {project.clientDto.userDto.username}
                        </div>
                      </div>
                    </div>
                  </div>*/}

                  <div className="space-y-3">
                    <h5 className="font-semibold">Required Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {project.requiredSkills?.map((skill, index) => (
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

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-muted-foreground">
                        {project.proposalsCount || 0}{" "}
                        {project.proposalsCount === 1
                          ? "proposal"
                          : "proposals"}{" "}
                        received
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link to={`/dashboard/job/${project.id}`}>
                        <Button variant="outline" className={"text-xs"}>
                          <Eye />
                          View Project Details
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleShowBids(project.id)}
                        disabled={
                          !project.proposalsCount ||
                          project.proposalsCount === 0
                        }
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Show Bids
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isObservingLoad ? (
            <div className="flex items-center text-blue-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Loading more proposals...</span>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Scroll down to load more
            </p>
          )}
        </div>
      )}

      {!hasMore && filteredProjects.length > 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm border-t mt-6">
          You've reached the end of the matching projects list.
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or post a new job to get started.
          </p>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>
      )}
    </div>
  );
}

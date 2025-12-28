import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Target,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Plus,
  FileText,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Edit,
} from "lucide-react";
import { apiClient } from "@/api/AxiosServiceApi";
import { userRoles } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext.jsx";
import { format, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function ProjectsContent() {
  const { userRole } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [isProjectsPaneCollapsed, setIsProjectsPaneCollapsed] = useState(false);

  // Milestone management state
  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    name: "",
    description: "",
    daysRequired: "",
    amount: "",
  });
  const [uploadingMilestoneId, setUploadingMilestoneId] = useState(null);
  const [submissionType, setSubmissionType] = useState("file"); // 'file' or 'url'
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedMilestoneForPayment, setSelectedMilestoneForPayment] =
    useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const endpoint =
          userRole === userRoles.FREELANCER
            ? "/api/active-projects-for-freelancer"
            : "/api/dashboard/get-in-progress-post";
        const res = await apiClient.get(endpoint);
        const formatted = (res.data || []).map((p) => ({
          id: p.id,
          contractId: p.id,
          title: p.job?.jobTitle ?? "Untitled",
          description: p.job?.jobDescription ?? "",
          requiredSkills: p.job?.requiredSkills ?? [],
          experienceLevel: p.job?.experienceLevel ?? "",
          proposalsCount: p.job?.proposalsCount ?? p.proposalsCount ?? 0,
          client: {
            id: p.client?.id ?? null,
            companyName:
              p.client?.companyName ?? p.client?.userDto?.username ?? "Client",
            name:
              p.client?.userDto?.username ?? p.client?.companyName ?? "Client",
            email: p.client?.userDto?.email ?? "N/A",
            phone: p.client?.phone ?? "N/A",
            bio: p.client?.bio ?? "",
            imageData: p.client?.userDto?.imageData ?? null,
          },
          freelancer: {
            id: p.freelancer?.id ?? p.freelancerDto?.id ?? null,
            name:
              p.freelancer?.userDto?.username ??
              p.freelancerDto?.userDto?.username ??
              p.freelancer?.username ??
              "Freelancer",
            email:
              p.freelancer?.userDto?.email ??
              p.freelancerDto?.userDto?.email ??
              "N/A",
            phone: p.freelancer?.phone ?? p.freelancerDto?.phone ?? "N/A",
            bio: p.freelancer?.bio ?? p.freelancerDto?.bio ?? "",
            imageData:
              p.freelancer?.userDto?.imageData ??
              p.freelancerDto?.userDto?.imageData ??
              null,
            designation:
              p.freelancer?.designation ?? p.freelancerDto?.designation ?? "",
            portfolioUrl:
              p.freelancer?.portfolioUrl ?? p.freelancerDto?.portfolioUrl ?? "",
            skills: p.freelancer?.skills ?? p.freelancerDto?.skills ?? [],
          },
          budget: p.job?.budget ?? 0,
          status: p.phase ?? p.status ?? "IN_PROGRESS",
          progress: typeof p.progress === "number" ? p.progress : 50,
          startDate: new Date(p.job?.projectStartTime),
          deadline: new Date(p.job?.projectEndTime),
          files: p.job?.file ? [p.job.file] : [],
          bidAttachment: p.proposal?.attachment ?? p.bidAttachment ?? null,
          clientAttachment: p.job?.file ?? p.clientAttachment ?? null,
        }));
        setProjects(formatted);
        console.log(formatted);
        setSelectedProject((prev) => prev ?? formatted[0] ?? null);
      } catch (err) {
        console.error(err);
        setError("Failed to load project data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [userRole]);

  // Fetch milestones when project is selected
  useEffect(() => {
    if (selectedProject?.contractId) {
      fetchMilestones(selectedProject.contractId);
    }
  }, [selectedProject]);

  const fetchMilestones = async (contractId) => {
    try {
      setLoadingMilestones(true);
      const res = await apiClient.get(`/api/get-milestone/${contractId}`);
      setMilestones(res.data || []);
    } catch (err) {
      console.error("Error fetching milestones:", err);
      setMilestones([]);
    } finally {
      setLoadingMilestones(false);
    }
  };

  const calculateProgress = () => {
    if (!milestones || milestones.length === 0) {
      return 0;
    }
    const completedMilestones = milestones.filter(
      (m) =>
        m.status === "COMPLETED" ||
        m.status === "APPROVED" ||
        m.verificationStatus === "VERIFIED",
    ).length;
    return Math.round((completedMilestones / milestones.length) * 100);
  };

  const getMilestoneStatusColor = (milestone) => {
    if (!milestone) return "outline";

    // Check verification status first
    if (milestone.verificationStatus === "VERIFIED") return "default";
    if (milestone.verificationStatus === "REJECTED") return "destructive";

    // Then check milestone status
    const status = milestone.status;
    if (status === "COMPLETED" || status === "APPROVED") return "default";
    if (status === "IN_PROGRESS" || status === "SUBMITTED") return "secondary";
    if (status === "REVISION_REQUESTED") return "destructive";
    if (status === "PENDING") return "outline";

    return "outline";
  };

  const handleChatInitiation = async () => {
    try {
      const response = await apiClient.post(
        `/api/chat-history/create/${selectedProject.client.id}/${selectedProject.freelancer.id}`,
        {},
      );
      if (response.status === 200) {
        navigate("/dashboard/messages");
      }
    } catch (error) {
      console.error("Error initiating chat:", error);
    }
  };

  const getMilestoneStatusText = (milestone) => {
    if (!milestone) return "PENDING";

    // Priority order for status display
    if (milestone.verificationStatus === "VERIFIED") return "COMPLETED";
    if (milestone.verificationStatus === "REJECTED") return "REJECTED";
    if (milestone.status === "APPROVED") return "APPROVED - PENDING PAYMENT";
    if (milestone.paymentStatus === "PAID") return "PAYMENT COMPLETED";

    return milestone.status || "PENDING";
  };

  const canAddMoreMilestones = () => {
    return milestones.length < 3;
  };

  const getRemainingDays = () => {
    if (!selectedProject) return 0;
    const today = new Date();
    const deadline = new Date(selectedProject.deadline);
    return differenceInDays(deadline, today);
  };

  const getUsedDays = () => {
    if (!milestones) return 0;
    return milestones
      .filter(
        (m) =>
          m.status !== "COMPLETED" &&
          m.status !== "APPROVED" &&
          m.verificationStatus !== "VERIFIED",
      )
      .reduce((total, m) => {
        const daysRequired = m.daysRequired || 0;
        return (
          total +
          (typeof daysRequired === "number"
            ? daysRequired
            : parseInt(daysRequired) || 0)
        );
      }, 0);
  };

  const handleAddMilestone = async () => {
    if (
      !newMilestone.name ||
      !newMilestone.description ||
      !newMilestone.daysRequired ||
      !newMilestone.amount
    ) {
      alert("Please fill in all fields");
      return;
    }

    const daysRequired = parseInt(newMilestone.daysRequired);
    const amount = parseFloat(newMilestone.amount);
    const remainingDays = getRemainingDays();
    const usedDays = getUsedDays();
    const availableDays = remainingDays - usedDays;

    if (daysRequired > availableDays) {
      alert(
        `Cannot add milestone. Only ${availableDays} days available before deadline.`,
      );
      return;
    }

    if (amount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysRequired);

      const milestoneData = {
        title: newMilestone.name,
        description: newMilestone.description,
        amount: amount,
        dueDate: dueDate.toISOString(),
        status: "PENDING",
        paymentStatus: "NOT_PAID",
        verificationStatus: "PENDING_REVIEW",
        milestoneNumber: (milestones?.length || 0) + 1,
        daysRequired: daysRequired,
        createdAt: new Date().toISOString(),
        contract: {
          id: selectedProject.contractId,
        },
      };

      const response = await apiClient.post(
        `/api/create-milestone?clientId=${selectedProject.client.id}&freelancerId=${selectedProject.freelancer.id}`,
        milestoneData,
      );

      await fetchMilestones(selectedProject.contractId);

      setNewMilestone({
        name: "",
        description: "",
        daysRequired: "",
        amount: "",
      });
      setIsAddMilestoneOpen(false);
      alert("Milestone created successfully! Awaiting client approval.");
    } catch (err) {
      console.error("Error adding milestone:", err);
      alert(err.response?.data?.message || "Failed to add milestone");
    }
  };

  const handleMilestoneApproval = async (milestoneId, approve) => {
    try {
      if (approve) {
        // Open payment dialog instead of direct approval
        const milestone = milestones.find((m) => m.id === milestoneId);
        setSelectedMilestoneForPayment(milestone);
        setIsPaymentDialogOpen(true);
      } else {
        const feedback = prompt(
          "Please provide feedback for the freelancer on why this milestone was rejected:",
        );

        if (!feedback) {
          return;
        }

        const milestoneData = {
          id: milestoneId,
          clientFeedback: feedback,
          verificationStatus: "REJECTED",
        };

        await apiClient.post(
          `/api/client-feedback?clientId=${selectedProject.client.id}`,
          milestoneData,
        );

        await fetchMilestones(selectedProject.contractId);
        alert("Milestone rejected. Freelancer can update and resubmit.");
      }
    } catch (err) {
      console.error("Error processing milestone approval:", err);
      alert(err.response?.data?.message || "Failed to process milestone");
    }
  };

  const handleMilestonePayment = async () => {
    if (!selectedMilestoneForPayment) return;

    try {
      // Call milestone approval endpoint which should handle payment
      await apiClient.post(
        `/api/milestone-approval?milestoneId=${selectedMilestoneForPayment.id}&clientId=${selectedProject.client.id}`,
      );

      await fetchMilestones(selectedProject.contractId);
      setIsPaymentDialogOpen(false);
      setSelectedMilestoneForPayment(null);
      alert(
        "Milestone approved and payment processed! Freelancer can now start work.",
      );
    } catch (err) {
      console.error("Error processing payment:", err);
      alert(err.response?.data?.message || "Failed to process payment");
    }
  };

  const handleUpdateMilestone = async (milestoneId) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    const newTitle = prompt("Update milestone title:", milestone.title);
    if (!newTitle) return;

    const newDescription = prompt(
      "Update milestone description:",
      milestone.description,
    );
    if (!newDescription) return;

    const newAmount = prompt("Update milestone amount:", milestone.amount);
    if (!newAmount) return;

    const newDays = prompt(
      "Update days required:",
      milestone.daysRequired || "",
    );
    if (!newDays) return;

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parseInt(newDays));

      const milestoneData = {
        id: milestoneId,
        title: newTitle,
        description: newDescription,
        amount: parseFloat(newAmount),
        daysRequired: parseInt(newDays),
        dueDate: dueDate.toISOString(),
        status: "PENDING",
        verificationStatus: "PENDING_REVIEW",
      };

      await apiClient.post(
        `/api/update-milestone?freelancerId=${selectedProject.freelancer.id}`,
        milestoneData,
      );

      await fetchMilestones(selectedProject.contractId);
      alert("Milestone updated successfully! Awaiting client re-approval.");
    } catch (err) {
      console.error("Error updating milestone:", err);
      alert(err.response?.data?.message || "Failed to update milestone");
    }
  };

  const handleFileUpload = async (milestoneId, file) => {
    if (!file) return;

    setUploadingMilestoneId(milestoneId);

    try {
      const formData = new FormData();

      const submissionData = {
        notes: "Document submission for milestone review",
        status: "PENDING_REVIEW",
      };

      formData.append(
        "submission",
        new Blob([JSON.stringify(submissionData)], {
          type: "application/json",
        }),
      );
      formData.append("file", file);

      const milestone = milestones.find((m) => m.id === milestoneId);
      const endpoint = milestone?.submission?.id
        ? `/api/update-submission?milestoneId=${milestoneId}&freelancerId=${selectedProject.freelancer.id}`
        : `/api/create-submission?milestoneId=${milestoneId}&freelancerId=${selectedProject.freelancer.id}`;

      await apiClient.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchMilestones(selectedProject.contractId);
      alert("Document submitted successfully! Awaiting client review.");
    } catch (err) {
      console.error("Error uploading file:", err);
      alert(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploadingMilestoneId(null);
    }
  };

  const handleUrlSubmission = async (milestoneId) => {
    if (!submissionUrl.trim()) {
      alert("Please enter a valid URL");
      return;
    }

    setUploadingMilestoneId(milestoneId);

    try {
      const submissionData = {
        fileUrl: submissionUrl,
        notes: "URL submission for milestone review",
        status: "PENDING_REVIEW",
      };

      const milestone = milestones.find((m) => m.id === milestoneId);
      const endpoint = milestone?.submission?.id
        ? `/api/update-submission?milestoneId=${milestoneId}&freelancerId=${selectedProject.freelancer.id}`
        : `/api/create-submission?milestoneId=${milestoneId}&freelancerId=${selectedProject.freelancer.id}`;

      await apiClient.post(endpoint, submissionData);

      await fetchMilestones(selectedProject.contractId);
      setSubmissionUrl("");
      alert("URL submitted successfully! Awaiting client review.");
    } catch (err) {
      console.error("Error submitting URL:", err);
      alert(err.response?.data?.message || "Failed to submit URL");
    } finally {
      setUploadingMilestoneId(null);
    }
  };

  const handleSubmissionReview = async (milestoneId, accept) => {
    try {
      const milestone = milestones.find((m) => m.id === milestoneId);

      if (!milestone?.submission?.id) {
        alert("No submission found for this milestone");
        return;
      }

      if (accept) {
        await apiClient.post(
          `/api/submission-approval?submissionId=${milestone.submission.id}&clientId=${selectedProject.client.id}`,
        );

        await fetchMilestones(selectedProject.contractId);
        alert("Submission accepted! Milestone completed successfully.");
      } else {
        const clientRemark = prompt(
          "Please provide feedback for the freelancer:",
        );

        if (!clientRemark) {
          return;
        }

        const submissionData = {
          id: milestone.submission.id,
          clientRemark: clientRemark,
          status: "REJECTED",
        };

        await apiClient.post(
          `/api/client-remark?clientId=${selectedProject.client.id}`,
          submissionData,
        );

        await fetchMilestones(selectedProject.contractId);
        alert("Submission rejected. Freelancer can resubmit their work.");
      }
    } catch (err) {
      console.error("Error reviewing submission:", err);
      alert(err.response?.data?.message || "Failed to review submission");
    }
  };

  if (loading)
    return <p className="p-6 text-muted-foreground">Loading projects...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!projects.length)
    return (
      <p className="p-6 text-muted-foreground">No active projects found.</p>
    );

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setShowFullDesc(false);
    setShowMobileDetails(true);
  };

  const handleBackToList = () => {
    setShowMobileDetails(false);
  };

  const currentProgress = calculateProgress();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Active Projects
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {userRole === userRoles.FREELANCER
            ? "Manage your ongoing freelance projects"
            : "Track and manage your hired projects"}
        </p>
      </div>

      <div className="flex gap-6 lg:flex-row flex-col">
        {isProjectsPaneCollapsed ? (
          <div className="hidden lg:flex items-start pt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsProjectsPaneCollapsed(false)}
              aria-label="Expand projects pane"
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Card
            className={`lg:w-80 lg:flex-shrink-0 ${showMobileDetails ? "hidden lg:block" : ""}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Projects</CardTitle>
                  <CardDescription>Your active projects</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex h-8 w-8"
                  onClick={() => setIsProjectsPaneCollapsed(true)}
                  aria-label="Collapse projects pane"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.map((project) => {
                return (
                  <div
                    key={project.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectProject(project)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSelectProject(project)
                    }
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProject?.id === project.id
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <h4 className="font-medium text-sm mb-1">
                      {project.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 truncate">
                      {userRole === userRoles.FREELANCER
                        ? project.client.name
                        : project.freelancer.name}
                    </p>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <Badge
                        variant={
                          project.status?.toLowerCase?.() === "completed"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {project.status}
                      </Badge>
                      <span className="text-muted-foreground font-medium">
                        {currentProgress}%
                      </span>
                    </div>
                    <Progress value={currentProgress} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card
          className={`flex-1 ${!showMobileDetails ? "hidden lg:block" : ""}`}
        >
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2 lg:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Projects
                  </Button>
                </div>
                <CardTitle className="text-xl flex items-center gap-2 flex-wrap">
                  <h1>{selectedProject?.title}</h1>
                  <Badge
                    variant={
                      selectedProject?.status?.toLowerCase?.() === "completed"
                        ? "default"
                        : "secondary"
                    }
                    className={"self-start"}
                  >
                    {selectedProject?.status}
                  </Badge>
                </CardTitle>

                <div className="mt-1">
                  <p
                    className={`text-sm text-muted-foreground ${showFullDesc ? "" : "line-clamp-3"}`}
                  >
                    {selectedProject?.description}
                  </p>

                  {selectedProject?.description &&
                    selectedProject.description.length > 200 && (
                      <Button
                        aria-expanded={showFullDesc}
                        onClick={() => setShowFullDesc((s) => !s)}
                        variant={"link"}
                        className={"p-0 text-sm h-auto"}
                      >
                        {showFullDesc ? "Show less" : "Show more"}
                        {showFullDesc ? (
                          <ChevronUp className={"w-4 h-4 ml-1"} />
                        ) : (
                          <ChevronDown className={"w-4 h-4 ml-1"} />
                        )}
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="milestones">
                  Milestones
                  {milestones?.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 min-w-5 px-1"
                    >
                      {milestones.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="escrow">Escrow</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Project Progress
                      </p>
                      <p className="text-3xl font-bold">{currentProgress}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">
                        Milestones
                      </p>
                      <p className="text-2xl font-bold">
                        {milestones?.filter(
                          (m) =>
                            m.status === "COMPLETED" ||
                            m.status === "APPROVED" ||
                            m.verificationStatus === "VERIFIED",
                        ).length || 0}
                        <span className="text-lg text-muted-foreground">
                          /{milestones?.length || 0}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Progress value={currentProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentProgress === 100
                      ? "Project completed! 🎉"
                      : `${100 - currentProgress}% remaining to completion`}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/30 border p-3 rounded-md space-y-1">
                    <div className="text-sm font-medium">Budget</div>
                    <div className="text-lg font-bold">
                      ${selectedProject?.budget?.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-muted/30 border p-3 rounded-md space-y-1">
                    <div className="text-sm font-medium">Start Date</div>
                    <div className="text-lg font-bold">
                      {format(selectedProject?.startDate, "PP")}
                    </div>
                  </div>

                  <div className="bg-muted/30 border p-3 rounded-md space-y-1">
                    <div className="text-sm font-medium">Deadline</div>
                    <div className="text-lg font-bold">
                      {format(selectedProject?.deadline, "PP")}
                    </div>
                  </div>

                  <div className="bg-muted/30 border p-3 rounded-md space-y-1">
                    <div className="text-sm font-medium">Days Remaining</div>
                    <div className="text-lg font-bold flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getRemainingDays()}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Project Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userRole === userRoles.FREELANCER &&
                      selectedProject?.clientAttachment && (
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium">Client's Attachment</p>
                              <p className="text-sm text-muted-foreground">
                                Project requirements document
                              </p>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={selectedProject.clientAttachment}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                    {userRole === userRoles.CLIENT &&
                      selectedProject?.bidAttachment && (
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium">
                                Freelancer's Bid Attachment
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Proposal document
                              </p>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={selectedProject.bidAttachment}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {userRole === userRoles.FREELANCER
                        ? "Client"
                        : "Freelancer"}{" "}
                      Details
                    </h3>
                    <Button size={"sm"} onClick={handleChatInitiation}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Start Chat
                    </Button>
                  </div>

                  {userRole === userRoles.FREELANCER ? (
                    <div className="p-4 bg-muted/50 border rounded-lg flex gap-4">
                      <Avatar className="h-12 w-12">
                        {selectedProject?.client?.imageData ? (
                          <AvatarImage
                            src={`data:image/jpeg;base64,${selectedProject.client.imageData}`}
                          />
                        ) : (
                          <AvatarFallback>
                            {(selectedProject?.client?.name || "C").charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1">
                        <div className="font-medium">
                          {selectedProject?.client?.companyName ||
                            selectedProject?.client?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedProject?.client?.email}
                        </div>
                        {selectedProject?.client?.phone && (
                          <div className="text-sm text-muted-foreground">
                            Phone: {selectedProject.client.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg flex gap-4 border bg-muted/50">
                      <Avatar className="h-12 w-12">
                        {selectedProject?.freelancer?.imageData ? (
                          <AvatarImage
                            src={`data:image/jpeg;base64,${selectedProject.freelancer.imageData}`}
                          />
                        ) : (
                          <AvatarFallback>
                            {(selectedProject?.freelancer?.name || "F").charAt(
                              0,
                            )}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1">
                        <div className="font-medium">
                          {selectedProject?.freelancer?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedProject?.freelancer?.email}
                        </div>
                        {selectedProject?.freelancer?.designation && (
                          <div className="text-sm text-muted-foreground">
                            Role: {selectedProject.freelancer.designation}
                          </div>
                        )}
                        {selectedProject?.freelancer?.portfolioUrl && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto"
                              asChild
                            >
                              <a
                                href={selectedProject.freelancer.portfolioUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink className="mr-1 h-4 w-4" />
                                Visit Portfolio
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <Target className="mr-2 h-4 w-4" /> Add Note
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Project Milestones
                    </h3>
                    {userRole === userRoles.FREELANCER &&
                      canAddMoreMilestones() && (
                        <Dialog
                          open={isAddMilestoneOpen}
                          onOpenChange={setIsAddMilestoneOpen}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Milestone
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Add New Milestone</DialogTitle>
                              <DialogDescription>
                                Create a milestone for this project. You can add
                                up to 3 milestones.
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                  <AlertCircle className="h-4 w-4" />
                                  <span>
                                    Available days:{" "}
                                    {getRemainingDays() - getUsedDays()}
                                  </span>
                                </div>
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="milestone-name">
                                  Milestone Name *
                                </Label>
                                <Input
                                  id="milestone-name"
                                  placeholder="e.g., Initial Design Phase"
                                  value={newMilestone.name}
                                  onChange={(e) =>
                                    setNewMilestone({
                                      ...newMilestone,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="milestone-description">
                                  Description *
                                </Label>
                                <Textarea
                                  id="milestone-description"
                                  placeholder="Describe what will be delivered in this milestone"
                                  value={newMilestone.description}
                                  onChange={(e) =>
                                    setNewMilestone({
                                      ...newMilestone,
                                      description: e.target.value,
                                    })
                                  }
                                  rows={3}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="milestone-days">
                                    Days Required *
                                  </Label>
                                  <Input
                                    id="milestone-days"
                                    type="number"
                                    min="1"
                                    placeholder="Days needed"
                                    value={newMilestone.daysRequired}
                                    onChange={(e) =>
                                      setNewMilestone({
                                        ...newMilestone,
                                        daysRequired: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="milestone-amount">
                                    Amount ($) *
                                  </Label>
                                  <Input
                                    id="milestone-amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={newMilestone.amount}
                                    onChange={(e) =>
                                      setNewMilestone({
                                        ...newMilestone,
                                        amount: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsAddMilestoneOpen(false);
                                  setNewMilestone({
                                    name: "",
                                    description: "",
                                    daysRequired: "",
                                    amount: "",
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleAddMilestone}>
                                Create Milestone
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                  </div>

                  {userRole === userRoles.FREELANCER && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                          <p className="font-medium mb-1">
                            Milestone Guidelines
                          </p>
                          <ul className="space-y-1 text-xs">
                            <li>
                              • Create milestones with specific deliverables and
                              amounts
                            </li>
                            <li>
                              • Client must approve and pay before you can start
                              work
                            </li>
                            <li>
                              • Submit work (file or URL) once milestone is paid
                            </li>
                            <li>• Maximum 3 milestones per project</li>
                            <li>
                              • Client reviews submissions and releases payment
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {userRole === userRoles.CLIENT && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex gap-2">
                        <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-purple-900 dark:text-purple-100">
                          <p className="font-medium mb-1">
                            Milestone Review Process
                          </p>
                          <ul className="space-y-1 text-xs">
                            <li>
                              • Review and approve freelancer's milestone
                              proposals
                            </li>
                            <li>
                              • Pay for approved milestones to release funds
                              from escrow
                            </li>
                            <li>
                              • Freelancer submits work once payment is
                              confirmed
                            </li>
                            <li>
                              • Review submissions and approve or request
                              revisions
                            </li>
                            <li>
                              • Payment released automatically upon acceptance
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {loadingMilestones ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                      <p className="mt-2">Loading milestones...</p>
                    </div>
                  ) : milestones?.length > 0 ? (
                    <div className="space-y-3">
                      {milestones.map((milestone, idx) => (
                        <div
                          key={milestone.id || idx}
                          className="p-4 border rounded-lg bg-muted/30 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-medium">
                                  {milestone.title || `Milestone ${idx + 1}`}
                                </h4>
                                <Badge
                                  variant={getMilestoneStatusColor(milestone)}
                                >
                                  {getMilestoneStatusText(milestone)}
                                </Badge>
                                {milestone.paymentStatus === "PAID" && (
                                  <Badge
                                    variant="default"
                                    className="bg-green-600"
                                  >
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    Paid
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {milestone.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />$
                                  {milestone.amount?.toFixed(2) || "0.00"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {milestone.daysRequired || 0} days
                                </span>
                                {milestone.dueDate && (
                                  <span>
                                    Due:{" "}
                                    {format(new Date(milestone.dueDate), "PP")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Client Feedback Display */}
                          {milestone.clientFeedback && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded text-sm">
                              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                                Client Feedback:
                              </p>
                              <p className="text-amber-800 dark:text-amber-200">
                                {milestone.clientFeedback}
                              </p>
                            </div>
                          )}

                          {/* Freelancer Actions */}
                          {userRole === userRoles.FREELANCER && (
                            <div className="space-y-2">
                              {/* Update milestone if rejected by client */}
                              {milestone.verificationStatus ===
                                "CHANGES_REQUESTED" && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateMilestone(milestone.id)
                                    }
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update Milestone
                                  </Button>
                                </div>
                              )}

                              {/* Submit work if milestone is approved and paid */}
                              {milestone.status === "IN_PROGRESS" &&
                                milestone.paymentStatus === "NOT_PAID" &&
                                !milestone.submission && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                      ✓ Milestone approved and paid. You can now
                                      submit your work.
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant={
                                          submissionType === "file"
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                          setSubmissionType("file")
                                        }
                                      >
                                        File Upload
                                      </Button>
                                      <Button
                                        variant={
                                          submissionType === "url"
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        onClick={() => setSubmissionType("url")}
                                      >
                                        URL Submission
                                      </Button>
                                    </div>

                                    {submissionType === "file" && (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="file"
                                          id={`file-${milestone.id}`}
                                          onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                              handleFileUpload(
                                                milestone.id,
                                                file,
                                              );
                                            }
                                          }}
                                          className="hidden"
                                        />
                                        <Label
                                          htmlFor={`file-${milestone.id}`}
                                          className="cursor-pointer flex-1"
                                        >
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="w-full"
                                            disabled={
                                              uploadingMilestoneId ===
                                              milestone.id
                                            }
                                          >
                                            <span>
                                              <Upload className="h-4 w-4 mr-2" />
                                              {uploadingMilestoneId ===
                                              milestone.id
                                                ? "Uploading..."
                                                : "Choose File"}
                                            </span>
                                          </Button>
                                        </Label>
                                      </div>
                                    )}

                                    {submissionType === "url" && (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="url"
                                          placeholder="https://..."
                                          value={submissionUrl}
                                          onChange={(e) =>
                                            setSubmissionUrl(e.target.value)
                                          }
                                        />
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleUrlSubmission(milestone.id)
                                          }
                                          disabled={
                                            uploadingMilestoneId ===
                                            milestone.id
                                          }
                                        >
                                          {uploadingMilestoneId === milestone.id
                                            ? "Submitting..."
                                            : "Submit"}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}

                              {/* Resubmit if submission was rejected */}
                              {milestone.submission?.status === "REJECTED" && (
                                <div className="space-y-2">
                                  <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                                    <p className="font-medium text-red-900 dark:text-red-100 text-sm mb-1">
                                      Submission Rejected - Client Feedback:
                                    </p>
                                    <p className="text-red-800 dark:text-red-200 text-sm">
                                      {milestone.submission.clientRemark}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant={
                                        submissionType === "file"
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => setSubmissionType("file")}
                                    >
                                      File Upload
                                    </Button>
                                    <Button
                                      variant={
                                        submissionType === "url"
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => setSubmissionType("url")}
                                    >
                                      URL Submission
                                    </Button>
                                  </div>

                                  {submissionType === "file" && (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="file"
                                        id={`resubmit-file-${milestone.id}`}
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            handleFileUpload(
                                              milestone.id,
                                              file,
                                            );
                                          }
                                        }}
                                        className="hidden"
                                      />
                                      <Label
                                        htmlFor={`resubmit-file-${milestone.id}`}
                                        className="cursor-pointer flex-1"
                                      >
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          asChild
                                          className="w-full"
                                          disabled={
                                            uploadingMilestoneId ===
                                            milestone.id
                                          }
                                        >
                                          <span>
                                            <Upload className="h-4 w-4 mr-2" />
                                            {uploadingMilestoneId ===
                                            milestone.id
                                              ? "Uploading..."
                                              : "Resubmit File"}
                                          </span>
                                        </Button>
                                      </Label>
                                    </div>
                                  )}

                                  {submissionType === "url" && (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="url"
                                        placeholder="https://..."
                                        value={submissionUrl}
                                        onChange={(e) =>
                                          setSubmissionUrl(e.target.value)
                                        }
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleUrlSubmission(milestone.id)
                                        }
                                        disabled={
                                          uploadingMilestoneId === milestone.id
                                        }
                                      >
                                        {uploadingMilestoneId === milestone.id
                                          ? "Submitting..."
                                          : "Resubmit"}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Show submission status */}
                              {milestone.submission &&
                                milestone.submission.status !== "REJECTED" && (
                                  <div className="p-3 bg-background border rounded">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">
                                          Submission{" "}
                                          {milestone.submission.status ===
                                          "APPROVED"
                                            ? "Accepted"
                                            : "Pending Review"}
                                        </p>
                                        {milestone.submission.fileUrl && (
                                          <p className="text-xs text-muted-foreground">
                                            {milestone.submission.fileUrl.startsWith(
                                              "http",
                                            )
                                              ? milestone.submission.fileUrl
                                              : "File uploaded"}
                                          </p>
                                        )}
                                      </div>
                                      {milestone.submission.status ===
                                        "APPROVED" && (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}

                          {/* Client Actions */}
                          {userRole === userRoles.CLIENT && (
                            <div className="space-y-3">
                              {/* Milestone Approval - Pending Review */}
                              {milestone.verificationStatus ===
                                "PENDING_REVIEW" &&
                                milestone.status === "IN_PROGRESS" && ( // ! Please change "IN_PROGRESS" to "PENDING" later
                                  <div className={"flex justify-end"}>
                                    <div className="space-y-2">
                                      {/*<p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        Review milestone proposal
                                      </p>*/}
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="default"
                                          className="flex-1"
                                          onClick={() =>
                                            handleMilestoneApproval(
                                              milestone.id,
                                              true,
                                            )
                                          }
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve & Pay
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="flex-1"
                                          onClick={() =>
                                            handleMilestoneApproval(
                                              milestone.id,
                                              false,
                                            )
                                          }
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {/* Submission Review */}
                              {milestone.submission &&
                                milestone.submission.status ===
                                  "PENDING_REVIEW" && (
                                  <div className="space-y-3">
                                    <div className="p-3 bg-background border rounded">
                                      <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">
                                            Work Submitted for Review
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {milestone.submission.notes ||
                                              "Review the submission"}
                                          </p>
                                        </div>
                                        {milestone.submission.fileUrl && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                          >
                                            <a
                                              href={
                                                milestone.submission.fileUrl
                                              }
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              <Download className="h-4 w-4 mr-2" />
                                              View
                                            </a>
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="default"
                                        className="flex-1"
                                        onClick={() =>
                                          handleSubmissionReview(
                                            milestone.id,
                                            true,
                                          )
                                        }
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Accept & Complete
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() =>
                                          handleSubmissionReview(
                                            milestone.id,
                                            false,
                                          )
                                        }
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Request Revision
                                      </Button>
                                    </div>
                                  </div>
                                )}

                              {/* Completed Status */}
                              {milestone.verificationStatus === "VERIFIED" && (
                                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                                  <div className="flex items-center gap-2 text-sm text-green-900 dark:text-green-100">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="font-medium">
                                      Milestone completed and payment released
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Awaiting Work */}
                              {milestone.status === "APPROVED" &&
                                milestone.paymentStatus === "PAID" &&
                                !milestone.submission && (
                                  <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                      Payment processed. Waiting for freelancer
                                      to submit work.
                                    </p>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="font-medium">No milestones defined yet</p>
                      <p className="text-sm mt-1">
                        {userRole === userRoles.FREELANCER
                          ? "Create milestones to track your project progress"
                          : "Freelancer will create milestones for project tracking"}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="escrow" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Escrow Management</h3>

                  <div className="grid gap-4">
                    <div className="p-6 border rounded-lg bg-muted/30">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-sm font-medium">
                            Total Budget
                          </span>
                          <span className="text-2xl font-bold">
                            ${selectedProject?.budget?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Funds in Escrow
                          </span>
                          <span className="text-xl font-bold text-green-600">
                            $
                            {(
                              selectedProject?.budget -
                              (milestones
                                ?.filter((m) => m.paymentStatus === "PAID")
                                .reduce((sum, m) => sum + (m.amount || 0), 0) ||
                                0)
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Released to Milestones
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            $
                            {milestones
                              ?.filter((m) => m.paymentStatus === "PAID")
                              .reduce((sum, m) => sum + (m.amount || 0), 0)
                              ?.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Completed & Paid Out
                          </span>
                          <span className="text-xl font-bold text-purple-600">
                            $
                            {milestones
                              ?.filter(
                                (m) => m.verificationStatus === "VERIFIED",
                              )
                              .reduce((sum, m) => sum + (m.amount || 0), 0)
                              ?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {milestones?.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Milestone Breakdown
                        </h4>
                        {milestones.map((milestone, idx) => (
                          <div
                            key={milestone.id}
                            className="flex items-center justify-between p-3 border rounded bg-background"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {milestone.title || `Milestone ${idx + 1}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {getMilestoneStatusText(milestone)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">
                                ${milestone.amount?.toFixed(2) || "0.00"}
                              </p>
                              <Badge
                                variant={
                                  milestone.paymentStatus === "PAID"
                                    ? "default"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {milestone.paymentStatus === "PAID"
                                  ? "Paid"
                                  : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No milestone payments yet</p>
                        <p className="text-sm mt-1">
                          Funds are securely held until milestone completion
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Process Milestone Payment</DialogTitle>
            <DialogDescription>
              Approve and pay for this milestone to allow the freelancer to
              start work.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Milestone:</span>
                <span className="text-sm">
                  {selectedMilestoneForPayment?.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Amount:</span>
                <span className="text-lg font-bold">
                  ${selectedMilestoneForPayment?.amount?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Duration:</span>
                <span className="text-sm">
                  {Math.ceil(
                    Math.abs(
                      new Date(selectedMilestoneForPayment?.createdAt) -
                        new Date(selectedMilestoneForPayment?.dueDate),
                    ) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  days
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> The amount will be released from escrow
                and held until the freelancer completes and you approve the
                work.
              </p>
            </div>
          </div>
          <DialogFooter className={"gap-2"}>
            <Button
              variant="outline"
              size={"sm"}
              onClick={() => {
                setIsPaymentDialogOpen(false);
                setSelectedMilestoneForPayment(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleMilestonePayment} size={"sm"}>
              <DollarSign className="h-4 w-4" />
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { apiClient } from "@/api/AxiosServiceApi";
import FullScreenLoader from "@/components/FullScreenLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { userRoles } from "@/utils/constants";
import { format, formatISO, isBefore, startOfToday } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarIcon,
  Clock,
  FileText,
  IndianRupee,
  Plus,
  Send,
  Settings,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const jobCategories = [
  "Web Development",
  "Mobile Development",
  "Design & Creative",
  "Writing & Translation",
  "Digital Marketing",
  "Data Science",
  "DevOps & Cloud",
  "AI & Machine Learning",
];

const skillSuggestions = [
  "React",
  "Node.js",
  "Python",
  "JavaScript",
  "TypeScript",
  "PHP",
  "Java",
  "Figma",
  "Adobe Creative Suite",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "SEO",
  "Social Media Marketing",
  "Google Ads",
  "Data Analysis",
  "Machine Learning",
  "SQL",
  "AWS",
  "Docker",
];

export default function PostJobContent({ userRole }) {
  const [currentTab, setCurrentTab] = useState("basics");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const navigate = useNavigate();

  const [jobData, setJobData] = useState({
    jobTitle: "",
    category: "",
    experienceLevel: "",
    jobDescription: "",
    requirement: "",
    timeline: "",
    budgetType: "fixed",
    budget: "",
    hourlyRateMin: "",
    hourlyRateMax: "",
    projectSize: "",
    screeningQuestions: [""],
    visibility: "public",
    featuredListing: false,
    projectStartTime: null,
    projectEndTime: null,
  });

  if (userRole === userRoles.FREELANCER) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Switch to Client Role</CardTitle>
            <CardDescription>
              You need to be in client mode to post jobs. Switch your role to
              access this feature.
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

  // Skill Management
  const addSkill = (skill) => {
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };
  const removeSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };
  const addCustomSkill = () => {
    if (customSkill.trim()) {
      addSkill(customSkill.trim());
      setCustomSkill("");
    }
  };

  // Screening Questions
  const addScreeningQuestion = () => {
    setJobData({
      ...jobData,
      screeningQuestions: [...jobData.screeningQuestions, ""],
    });
  };
  const updateScreeningQuestion = (index, value) => {
    const updated = [...jobData.screeningQuestions];
    updated[index] = value;
    setJobData({ ...jobData, screeningQuestions: updated });
  };
  const removeScreeningQuestion = (index) => {
    const updated = jobData.screeningQuestions.filter((_, i) => i !== index);
    setJobData({ ...jobData, screeningQuestions: updated });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 500 * 1024; // 500 KB in bytes
      if (file.size > maxSize) {
        toast.warning(
          "File size exceeds 500 KB. Please select a smaller file.",
        );
        return;
      }
      setAttachment(file);
      toast.success("File uploaded successfully!");
    } else {
      toast.warning("File upload failed. Please try again.");
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    // Reset the file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.value = "";
    }
    toast.info("File removed");
  };

  // Validation
  const validateFields = () => {
    // Basic info validation
    if (!jobData.jobTitle.trim()) {
      toast.error("Job title is required");
      setCurrentTab("basics");
      return false;
    }
    if (jobData.jobTitle.trim().length < 10) {
      toast.error("Job title must be at least 10 characters long");
      setCurrentTab("basics");
      return false;
    }
    if (!jobData.category) {
      toast.error("Category is required");
      setCurrentTab("basics");
      return false;
    }
    if (!jobData.experienceLevel) {
      toast.error("Experience level is required");
      setCurrentTab("basics");
      return false;
    }
    if (selectedSkills.length === 0) {
      toast.error("At least one skill is required");
      setCurrentTab("basics");
      return false;
    }
    if (selectedSkills.length > 15) {
      toast.error("Maximum 15 skills allowed");
      setCurrentTab("basics");
      return false;
    }

    // Details validation
    if (!jobData.jobDescription.trim()) {
      toast.error("Job description is required");
      setCurrentTab("details");
      return false;
    }
    if (jobData.jobDescription.trim().length < 50) {
      toast.error("Job description must be at least 50 characters long");
      setCurrentTab("details");
      return false;
    }
    if (!jobData.requirement.trim()) {
      toast.error("Job requirements are required");
      setCurrentTab("details");
      return false;
    }
    if (jobData.requirement.trim().length < 20) {
      toast.error("Requirements must be at least 20 characters long");
      setCurrentTab("details");
      return false;
    }

    // Budget validation
    if (!jobData.budget) {
      toast.error("Project budget is required");
      setCurrentTab("details");
      return false;
    }
    if (parseFloat(jobData.budget) <= 0) {
      toast.error("Budget must be greater than 0");
      setCurrentTab("details");
      return false;
    }
    if (parseFloat(jobData.budget) > 10000000) {
      toast.error("Budget cannot exceed 10,000,000");
      setCurrentTab("details");
      return false;
    }

    // Date validation
    if (!jobData.projectStartTime) {
      toast.error("Project start date is required");
      setCurrentTab("details");
      return false;
    }
    if (!jobData.projectEndTime) {
      toast.error("Project end date is required");
      setCurrentTab("details");
      return false;
    }

    const today = startOfToday();
    if (isBefore(new Date(jobData.projectStartTime), today)) {
      toast.error("Project start date cannot be in the past");
      setCurrentTab("details");
      return false;
    }
    if (isBefore(new Date(jobData.projectEndTime), today)) {
      toast.error("Project end date cannot be in the past");
      setCurrentTab("details");
      return false;
    }
    if (
      isBefore(
        new Date(jobData.projectEndTime),
        new Date(jobData.projectStartTime),
      )
    ) {
      toast.error("End date cannot be before start date");
      setCurrentTab("details");
      return false;
    }

    // Screening questions validation
    const nonEmptyQuestions = jobData.screeningQuestions.filter((q) =>
      q.trim(),
    );
    if (
      nonEmptyQuestions.length > 0 &&
      nonEmptyQuestions.length !== jobData.screeningQuestions.length
    ) {
      toast.error("Please remove empty screening questions or fill them in");
      setCurrentTab("details");
      return false;
    }

    return true;
  };

  const handlePostJob = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      // Create FormData object
      const formData = new FormData();

      // Filter out empty screening questions
      const filteredScreeningQuestions = jobData.screeningQuestions.filter(
        (q) => q.trim(),
      );

      // Create the job DTO object
      const jobDto = {
        jobTitle: jobData.jobTitle.trim(),
        category: jobData.category,
        experienceLevel: jobData.experienceLevel,
        jobDescription: jobData.jobDescription.trim(),
        requirement: jobData.requirement.trim(),
        timeline: jobData.timeline,
        budgetType: jobData.budgetType,
        budget: parseFloat(jobData.budget),
        hourlyRateMin: jobData.hourlyRateMin
          ? parseFloat(jobData.hourlyRateMin)
          : null,
        hourlyRateMax: jobData.hourlyRateMax
          ? parseFloat(jobData.hourlyRateMax)
          : null,
        projectSize: jobData.projectSize,
        screeningQuestions: filteredScreeningQuestions,
        visibility: jobData.visibility,
        featuredListing: jobData.featuredListing,
        projectStartTime: jobData.projectStartTime,
        projectEndTime: jobData.projectEndTime,
        requiredSkills: selectedSkills,
      };

      // Append job data as JSON blob
      formData.append(
        "job",
        new Blob([JSON.stringify(jobDto)], { type: "application/json" }),
      );

      // Append file if exists
      if (attachment) {
        formData.append("file", attachment);
      }

      const response = await apiClient.post(
        "/api/dashboard/create-post",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200) {
        toast.success("Job posted successfully!");
        navigate("/dashboard/job-posts");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      if (error.response?.data?.message) {
        console.error(error.response.data.message);
      } else {
        console.error("Something went wrong while posting the job");
      }
    } finally {
      setLoading(false);
    }
  };

  const isTabComplete = (tab) => {
    switch (tab) {
      case "basics":
        return (
          jobData.jobTitle &&
          jobData.category &&
          jobData.experienceLevel &&
          selectedSkills.length > 0
        );
      case "details":
        return (
          jobData.jobDescription &&
          jobData.requirement &&
          jobData.budget &&
          jobData.projectStartTime &&
          jobData.projectEndTime
        );
      case "attachment":
        return true; // Optional tab
      case "review":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <FullScreenLoader show={loading} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Post a New Job
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Find the perfect freelancer for your project
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Job Details</CardTitle>
          <CardDescription>
            Provide comprehensive information to attract the right freelancers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="basics"
                className="flex items-center space-x-2"
              >
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Basics</span>
                {isTabComplete("basics") && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Details</span>
                {isTabComplete("details") && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="attachment"
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Attachment</span>
                {attachment && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="review"
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Review</span>
              </TabsTrigger>
            </TabsList>

            {/* BASICS TAB */}
            <TabsContent value="basics" className="space-y-6 mt-6">
              {/* Job Title */}
              <div>
                <Label htmlFor="job-title">Job Title *</Label>
                <Input
                  id="job-title"
                  placeholder="e.g. Build a responsive e-commerce website"
                  value={jobData.jobTitle}
                  onChange={(e) =>
                    setJobData({ ...jobData, jobTitle: e.target.value })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {jobData.jobTitle.length}/100 characters (minimum 10)
                </p>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={jobData.category}
                  onValueChange={(value) =>
                    setJobData({ ...jobData, category: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level */}
              <div>
                <Label htmlFor="experience-level">Experience Level *</Label>
                <Select
                  value={jobData.experienceLevel}
                  onValueChange={(value) =>
                    setJobData({ ...jobData, experienceLevel: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRY_LEVEL">Entry Level</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skills */}
              <div>
                <Label>Required Skills *</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedSkills.length}/15 skills selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skillSuggestions
                      .filter((skill) => !selectedSkills.includes(skill))
                      .slice(0, 10)
                      .map((skill) => (
                        <Button
                          key={skill}
                          variant="outline"
                          size="sm"
                          onClick={() => addSkill(skill)}
                          className="text-xs bg-transparent hover:bg-primary hover:text-background"
                          disabled={selectedSkills.length >= 15}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          {skill}
                        </Button>
                      ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add custom skill"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomSkill()}
                      disabled={selectedSkills.length >= 15}
                    />
                    <Button
                      onClick={addCustomSkill}
                      variant="default"
                      disabled={selectedSkills.length >= 15}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project in detail..."
                    value={jobData.jobDescription}
                    onChange={(e) =>
                      setJobData({ ...jobData, jobDescription: e.target.value })
                    }
                    className="mt-1 min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {jobData.jobDescription.length}/5000 characters (minimum 50)
                  </p>
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List specific requirements..."
                    value={jobData.requirement}
                    onChange={(e) =>
                      setJobData({ ...jobData, requirement: e.target.value })
                    }
                    className="mt-1 min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {jobData.requirement.length}/2000 characters (minimum 20)
                  </p>
                </div>

                <div>
                  <Label htmlFor="budget-amount">Project Budget *</Label>
                  <div className="relative mt-1">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="budget-amount"
                      type="number"
                      placeholder="5000"
                      value={jobData.budget}
                      onChange={(e) =>
                        setJobData({ ...jobData, budget: e.target.value })
                      }
                      className="pl-10"
                      min="1"
                      max="10000000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter amount between ₹1 and ₹10,000,000
                  </p>
                </div>

                {/* Dates */}
                <div className="grid gap-2">
                  <Label htmlFor="projectStartTime">Project Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal mt-1 ${
                          !jobData.projectStartTime && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {jobData.projectStartTime
                          ? format(new Date(jobData.projectStartTime), "PPP")
                          : "Pick a start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={
                          jobData.projectStartTime
                            ? new Date(jobData.projectStartTime)
                            : undefined
                        }
                        onSelect={(date) =>
                          setJobData({
                            ...jobData,
                            projectStartTime: date ? formatISO(date) : null,
                          })
                        }
                        disabled={(date) => isBefore(date, startOfToday())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="projectEndTime">Project End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal mt-1 ${
                          !jobData.projectEndTime && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {jobData.projectEndTime
                          ? format(new Date(jobData.projectEndTime), "PPP")
                          : "Pick an end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={
                          jobData.projectEndTime
                            ? new Date(jobData.projectEndTime)
                            : undefined
                        }
                        onSelect={(date) =>
                          setJobData({
                            ...jobData,
                            projectEndTime: date ? formatISO(date) : null,
                          })
                        }
                        disabled={(date) => {
                          const today = startOfToday();
                          const startDate = jobData.projectStartTime
                            ? new Date(jobData.projectStartTime)
                            : today;
                          return (
                            isBefore(date, today) || isBefore(date, startDate)
                          );
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Screening Questions */}
                <div>
                  <Label>Screening Questions (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Ask specific questions to filter applicants
                  </p>
                  <div className="mt-2 space-y-3">
                    {jobData.screeningQuestions.map((question, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          placeholder={`Question ${index + 1}`}
                          value={question}
                          onChange={(e) =>
                            updateScreeningQuestion(index, e.target.value)
                          }
                        />
                        {jobData.screeningQuestions.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeScreeningQuestion(index)}
                            className="bg-transparent"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {jobData.screeningQuestions.length < 5 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addScreeningQuestion}
                        className="bg-transparent"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {jobData.screeningQuestions.length}/5 questions
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ATTACHMENT TAB */}
            <TabsContent value="attachment" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label>Project Attachment (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upload relevant documents, requirements, or reference
                    materials
                  </p>
                </div>

                {!attachment ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop a file here, or click to browse
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                      className="bg-transparent"
                    >
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max
                      500KB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Attached File</h4>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(attachment.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeAttachment}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* REVIEW TAB */}
            <TabsContent value="review" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Preview</CardTitle>
                  <CardDescription>
                    Review your job posting before publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-xl">
                      {jobData.jobTitle || "Job Title"}
                    </h3>
                    <p className="text-muted-foreground">
                      {jobData.category || "Category"} -{" "}
                      {jobData.experienceLevel
                        ? jobData.experienceLevel
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (l) => l.toUpperCase())
                        : "Experience Level"}
                    </p>
                  </div>

                  {selectedSkills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {jobData.jobDescription ||
                        "Project description will appear here..."}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Requirements</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {jobData.requirement ||
                        "Project requirements will appear here..."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <IndianRupee className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-semibold">
                          ₹
                          {jobData.budget
                            ? parseFloat(jobData.budget).toLocaleString("en-IN")
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Timeline
                        </p>
                        <p className="font-semibold text-sm">
                          {jobData.projectStartTime && jobData.projectEndTime
                            ? `${format(
                                new Date(jobData.projectStartTime),
                                "MMM dd, yyyy",
                              )} - ${format(
                                new Date(jobData.projectEndTime),
                                "MMM dd, yyyy",
                              )}`
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {jobData.screeningQuestions.filter((q) => q.trim()).length >
                    0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2 text-sm">
                        Screening Questions
                      </h4>
                      <ul className="space-y-2">
                        {jobData.screeningQuestions
                          .filter((q) => q.trim())
                          .map((question, index) => (
                            <li
                              key={index}
                              className="text-sm text-muted-foreground flex items-start"
                            >
                              <span className="mr-2">{index + 1}.</span>
                              <span>{question}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {attachment && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2 text-sm">Attachment</h4>
                      <div className="flex items-center space-x-2 p-2 border rounded bg-muted/20">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{attachment.name}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      Before You Post
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Verify all information is accurate and complete</li>
                      <li>• Ensure budget and timeline are realistic</li>
                      <li>• Review screening questions for clarity</li>
                      <li>• Check that skills match your requirements</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentTab("details")}
                  className="bg-transparent"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Edit
                </Button>
                <Button
                  onClick={handlePostJob}
                  disabled={
                    !isTabComplete("basics") || !isTabComplete("details")
                  }
                  size="lg"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Post Job
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

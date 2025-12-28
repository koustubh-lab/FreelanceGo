import { apiClient } from "@/api/AxiosServiceApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { userRoles } from "@/utils/constants";
import {
  Bell,
  CirclePower,
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FullScreenLoader from "../FullScreenLoader";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import DashboardSidebarContent from "./dashboard-sidebar-content";

const notifications = [
  {
    title: "New message from Sarah",
    description: "2 minutes ago",
    type: "message",
  },
  {
    title: "New project assigned",
    description: "1 hour ago",
    type: "project",
  },
  {
    title: "Your payment has been processed",
    description: "2 hours ago",
    type: "payment",
  },
  {
    title: "New comment on your post",
    description: "3 hours ago",
    type: "comment",
  },
];

export default function DashboardHeader(props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [userExistingProfiles, setUserExistingProfiles] = useState({});

  const { logoutUser, userRole, setUserId } = useAuth();
  const navigate = useNavigate();

  const fetchProfileDetails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/me");
      const { status, data } = response;
      setUserId(data?.id);
      if (status === 200) {
        setUserData(data);
        toast.success("Profile details fetched successfully");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingProfiles = async () => {
    setLoading(false);
    try {
      const response = await apiClient.get("/api/check-role");
      const { status, data } = response;
      if (status === 200) {
        setUserExistingProfiles(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/", { replace: true });
    setLogoutDialogOpen(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.body.classList.toggle("dark", storedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        setTheme("dark");
        document.body.classList.add("dark");
      }
    }
    fetchProfileDetails();
    fetchExistingProfiles();
  }, []);

  const handleRoleSwitch = async () => {
    setLoading(true);
    const targetRole =
      userRole === userRoles.FREELANCER
        ? userRoles.CLIENT
        : userRoles.FREELANCER;

    try {
      const response = await apiClient.post(
        "/api/update-role",
        {},
        {
          params: {
            role: targetRole,
          },
        },
      );
      const { status, data } = response;
      if (status === 200) {
        localStorage.setItem("token", data);
        navigate("/dashboard", { replace: true });
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <FullScreenLoader show={loading} />
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <DashboardSidebarContent
                  userRole={userRole}
                  onItemClick={() => setSidebarOpen(false)}
                  {...props}
                />
              </SheetContent>
            </Sheet>

            <a href="/dashboard" className="flex items-center space-x-2">
              <img
                src={"/freelance-go-transparent.svg"}
                className={"h-5"}
                alt={"Logo"}
              />
              <span className="font-bold text-lg md:text-xl">FreelanceGo</span>
            </a>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 md:h-10 md:w-10"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 md:h-10 md:w-10"
                >
                  <Bell className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel className="text-lg">
                  Notification Center
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification, idx) => (
                  <DropdownMenuItem key={idx}>
                    <div className="flex gap-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="text-sm font-medium leading-tight">
                          {notification.title}
                        </p>
                        <p className="text-xs leading-snug text-muted-foreground">
                          {notification.description}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 md:h-10 md:w-10 rounded-full"
                >
                  <Avatar className="h-9 w-9 md:h-10 md:w-10">
                    <AvatarImage
                      src={`data:image/png;base64,${userData?.imageData}`}
                      alt="Profile"
                    />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <div className="grid gap-1">
                      <div
                        className={`flex justify-center rounded-sm text-sm font-semibold ${
                          userRole === userRoles.FREELANCER
                            ? "text-primary"
                            : "text-green-500"
                        }`}
                      >
                        <span>
                          {userRole === userRoles.FREELANCER
                            ? "Freelancer"
                            : "Client"}
                        </span>
                      </div>

                      <DropdownMenuSeparator />
                      <section className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userData?.username}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userData?.email}
                        </p>
                      </section>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile" className="flex items-center">
                    <User2 className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>

                {/* ✅ Conditionally show Switch Role item */}
                {(userRole === userRoles.FREELANCER &&
                  userExistingProfiles?.client) ||
                (userRole === userRoles.CLIENT &&
                  userExistingProfiles?.freelancer) ? (
                  <DropdownMenuItem onClick={handleRoleSwitch}>
                    <CirclePower className="mr-2 h-4 w-4" />
                    <span>
                      Switch to{" "}
                      {userRole === userRoles.FREELANCER
                        ? "Client"
                        : "Freelancer"}
                    </span>
                  </DropdownMenuItem>
                ) : null}

                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    setMenuOpen(false);
                    setLogoutDialogOpen(true);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action will log you out of your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleLogout} variant="destructive">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { Button } from "@/components/ui/button";
import { Github, Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-3 shadow-sm">
      <div className="container flex h-14 max-w-screen-2xl items-center relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none opacity-50"></div>

        <Link
          to="/"
          className="mr-6 flex items-center space-x-2 group relative z-10"
        >
          <div className="relative">
            <img src="/freelance-go-transparent.svg" alt="" className="h-5" />
            <div className="absolute inset-0 bg-primary/20 blur-md group-hover:bg-primary/30 transition-all rounded-full"></div>
          </div>
          <span className="font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
            FreelanceGo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium relative z-10">
          <Link
            to="/how-it-works"
            className="relative transition-colors hover:text-primary group py-1"
          >
            <span className="relative z-10">How It Works</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            to="/about-us"
            className="relative transition-colors hover:text-primary group py-1"
          >
            <span className="relative z-10">About Us</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4 relative z-10">
          <a
            href="https://github.com/amanesoft"
            target="_blank"
            rel="noreferrer"
          >
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </a>
          <a href="https://freelancegobackend.onrender.com/oauth2/authorization/google">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:shadow-md"
            >
              Login
            </Button>
          </a>
          <a href="https://freelancegobackend.onrender.com/oauth2/authorization/google">
            <Button
              size="sm"
              className="text-white bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-1">
                Join FreelanceGo
                <Sparkles className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto hover:bg-primary/10 transition-all duration-300 hover:scale-110 relative z-10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu
            className={`h-4 w-4 transition-transform duration-300 ${
              isMenuOpen ? "rotate-90" : ""
            }`}
          />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-gradient-to-b from-background/95 to-background/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-300">
          <nav className="py-4 space-y-4 w-full">
            <Link
              to="/how-it-works"
              className="block text-sm font-medium transition-all hover:text-primary hover:translate-x-1 duration-300"
            >
              How It Works
            </Link>
            <Link
              to="/about-us"
              className="block text-sm font-medium transition-all hover:text-primary hover:translate-x-1 duration-300"
            >
              About Us
            </Link>
            <div className="flex flex-col space-y-2 pt-4 border-t">
              <a href="https://freelancegobackend.onrender.com/oauth2/authorization/google">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-primary/10 hover:border-primary transition-all duration-300 hover:shadow-md"
                >
                  Login
                </Button>
              </a>
              <a href="https://freelancegobackend.onrender.com/oauth2/authorization/google">
                <Button
                  size="sm"
                  className="w-full text-white bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Join FreelanceGo
                </Button>
              </a>
            </div>
            <a
              href="https://github.com/koustubh-lab/FreelanceGo"
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:translate-x-1"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Briefcase,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative container flex min-h-[calc(100vh-3.5rem)] max-w-screen-2xl flex-col items-center justify-center space-y-8 text-center px-4 overflow-hidden">
      {/* Badge */}
      <div
        className={`transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <Badge
          variant="outline"
          className="px-4 py-2 text-sm border-primary/50 bg-primary/5 backdrop-blur-sm hover:bg-primary/10 transition-all duration-300 hover:scale-105"
        >
          <Sparkles className="w-4 h-4 mr-2 text-primary animate-pulse" />
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-semibold">
            #1 Freelance Platform of 2024
          </span>
          <TrendingUp className="w-4 h-4 ml-2 text-primary" />
        </Badge>
      </div>

      {/* Main content */}
      <div
        className={`space-y-6 transition-all duration-1000 delay-200 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h1 className="relative">
          <span className="block bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-transparent leading-tight">
            Find Your Perfect
          </span>
          <span className="block mt-2 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-transparent animate-gradient">
            Freelance Match
          </span>
          {/* Decorative elements */}
          <div className="absolute -top-8 -right-8 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div
            className="absolute -bottom-8 -left-8 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </h1>

        <p className="mx-auto max-w-[42rem] leading-relaxed text-muted-foreground text-base sm:text-lg md:text-xl sm:leading-8 font-medium">
          Connect talented freelancers with amazing projects.{" "}
          <span className="text-foreground font-semibold">
            Whether you're looking to hire skilled professionals
          </span>{" "}
          or find your next gig, FreelanceGo makes it{" "}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-semibold">
            simple and secure
          </span>
          .
        </p>
      </div>

      {/* CTA Buttons */}
      <div
        className={`flex flex-col sm:flex-row gap-4 w-full sm:w-auto transition-all duration-1000 delay-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Button
          size={"lg"}
          className="text-white bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-1">
            Hire Freelancers
            <Sparkles className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto bg-transparent backdrop-blur-sm border-2 hover:bg-primary/10 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-lg group"
        >
          Find Work
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes scroll {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(12px);
            opacity: 0;
          }
        }

        @keyframes spin-slow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </section>
  );
}

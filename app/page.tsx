"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { signIn } from "next-auth/react";
import { Footer } from "@/components/Footer";
import { ContributionGrid } from "@/app/components/contribution-grid/ContributionGrid";
import { YearSelector } from "@/app/components/contribution-grid/YearSelector";
import { MessageInput } from "@/app/components/contribution-grid/MessageInput";
import { GRID_ROWS, renderTextOnGrid } from "@/app/lib/grid-utils";
import { toast } from "sonner";

export default function Home() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [offset, setOffset] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [repoUrl, setRepoUrl] = useState<string>("");

  // --- Fetch GitHub account creation year ---
  useEffect(() => {
    async function fetchYears() {
      if (!session?.user?.name && !session?.user?.login) return;
      const username = session.user.login || session.user.name;
      try {
        const res = await fetch(`https://api.github.com/users/${username}`);
        if (!res.ok) return;
        const data = await res.json();
        const createdYear = new Date(data.created_at).getFullYear();
        const thisYear = new Date().getFullYear();
        const years = [];
        for (let y = thisYear; y >= createdYear; y--) years.push(y);
        setAvailableYears(years);
        setSelectedYear(null); // default to rolling year
      } catch (e) {
        // fallback: just show current year
        setAvailableYears([new Date().getFullYear()]);
      }
    }
    fetchYears();
  }, [session]);

  // --- Update URL on year select ---
  useEffect(() => {
    if (selectedYear) {
      const from = `${selectedYear}-01-01`;
      const to = `${selectedYear}-12-31`;
      const params = new URLSearchParams({ tab: "overview", from, to });
      window.history.replaceState({}, '', `?${params.toString()}`);
    } else {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [selectedYear]);

  // --- Date range for grid ---
  let startDate: Date, endDate: Date;
  if (selectedYear) {
    startDate = new Date(selectedYear, 0, 1); // Jan 1
    endDate = new Date(selectedYear, 11, 31); // Dec 31
  } else {
    endDate = new Date();
    startDate = new Date(endDate);
    startDate.setFullYear(endDate.getFullYear() - 1);
    startDate.setDate(startDate.getDate() + 1);
    startDate.setDate(startDate.getDate() - startDate.getDay());
  }
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalCols = Math.ceil(totalDays / GRID_ROWS);

  const handleGenerate = async () => {
    if (!message.trim()) {
      toast.error("No text entered", {
        description: "Please enter some text before generating.",
      });
      return;
    }

    setGenerating(true);
    setError(null);
    setStatusMessage("Initializing repository...");
    try {
      const grid = renderTextOnGrid(message.trim(), offset);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          grid,
          message: message.trim(), 
          offset,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unknown error");
      } else {
        setStatusMessage("Pushing changes...");
        // Simulate a delay to show the "Pushing changes" message
        await new Promise(resolve => setTimeout(resolve, 2000));
        setRepoUrl(data.repoUrl);
        setStatusMessage("Repository created successfully!");
      }
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setGenerating(false);
    }
  };

  // Only reset repoUrl when message or offset changes
  useEffect(() => {
    setRepoUrl("");
  }, [message, offset]);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center px-2 sm:px-4 py-6 sm:py-12">
        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-center gap-6 md:gap-8">
          <div className="flex flex-col gap-4 w-full md:w-2/3 lg:w-1/2 mx-auto">
            <MessageInput
              message={message}
              offset={offset}
              onMessageChange={setMessage}
              onOffsetChange={setOffset}
            />
            <div className="overflow-x-auto w-full">
              <ContributionGrid
                message={message}
                offset={offset}
                startDate={startDate}
                endDate={endDate}
                selectedYear={selectedYear}
                totalCols={totalCols}
              />
            </div>
            <div className="w-full">
              {session ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full"
                >
                  {repoUrl ? (
                    <Button 
                      className="w-full font-press-start text-xs sm:text-sm py-2 sm:py-3" 
                      onClick={() => window.open(repoUrl, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Check Repo
                    </Button>
                  ) : (
                    <Button 
                      className="w-full font-press-start text-xs sm:text-sm py-2 sm:py-3" 
                      onClick={handleGenerate} 
                      disabled={generating}
                    >
                      {generating ? (
                        <div className="flex items-center">
                          <span className="mr-2">{statusMessage}</span>
                          {statusMessage === "Pushing changes..." && (
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          )}
                        </div>
                      ) : "Generate"}
                    </Button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full"
                >
                  <Button className="w-full text-xs sm:text-sm py-2 sm:py-3" onClick={() => signIn("github", { callbackUrl: "/" })}>
                    <Github className="mr-2 h-4 w-4" />
                    Sign in with GitHub
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
          {/* Year selector on the right, vertically centered on desktop, below on mobile */}
          <div className="flex-shrink-0 flex flex-col items-center mt-6 md:mt-0 md:ml-4">
            <YearSelector
              availableYears={availableYears}
              selectedYear={selectedYear}
              onYearSelect={setSelectedYear}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
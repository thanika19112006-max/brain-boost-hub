import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import BrainMaze from "./pages/games/BrainMaze";
import MemoryFlip from "./pages/games/MemoryFlip";
import ThinkFast from "./pages/games/ThinkFast";
import ReflexIQ from "./pages/games/ReflexIQ";
import WordBend from "./pages/games/WordBend";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/games/brain-maze" element={<BrainMaze />} />
          <Route path="/games/memory-flip" element={<MemoryFlip />} />
          <Route path="/games/think-fast" element={<ThinkFast />} />
          <Route path="/games/reflex-iq" element={<ReflexIQ />} />
          <Route path="/games/word-bend" element={<WordBend />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

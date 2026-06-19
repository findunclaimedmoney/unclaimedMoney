import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StudioProvider } from "@/studio/StudioContext";
import StudioPage from "@/pages/StudioPage";
import BoothStripPage from "@/pages/BoothStripPage";
import CreateGlimr from "@/pages/CreateGlimr";
import SoonPage from "@/pages/SoonPage";
import TeleprompterPage from "@/pages/TeleprompterPage";
import MagicRecapPage from "@/pages/features/MagicRecapPage";
import TimeLockPage from "@/pages/features/TimeLockPage";
import CelebrityDropInsPage from "@/pages/features/CelebrityDropInsPage";
import CartoonModePage from "@/pages/features/CartoonModePage";
import SMSDeliveryPage from "@/pages/features/SMSDeliveryPage";
import BoothPremiumPage from "@/pages/features/BoothPremiumPage";
import NotFound from "@/pages/not-found";

import VideoTemplate from "@/components/video/VideoTemplate";

const queryClient = new QueryClient();

const NAV_LINKS = [
  { href: "/", label: "Studio" },
  { href: "/reel", label: "Reel" },
  { href: "/teleprompter", label: "Teleprompter" },
  { href: "/booth", label: "Booth" },
  { href: "/create", label: "Create" },
];

const FEATURE_LINKS = [
  { href: "/features/magic-recap", label: "Magic Recap" },
  { href: "/features/time-lock", label: "Time-Lock" },
  { href: "/features/drop-ins", label: "Drop-Ins" },
  { href: "/features/filter-mode", label: "Filter Mode" },
  { href: "/features/sms-delivery", label: "SMS Delivery" },
  { href: "/features/booth-premium", label: "Booth Premium" },
];

function NavBar() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/95 backdrop-blur border-b border-[#1c1c1c] px-6 py-0 flex items-stretch">
      {/* Brand */}
      <Link href="/" className="text-orange-500 font-extrabold tracking-[3px] text-xs uppercase flex items-center pr-6 border-r border-[#1c1c1c] mr-2">
        Glimr
      </Link>

      {/* Primary nav */}
      <div className="flex items-stretch">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center px-4 text-xs font-medium transition-colors border-b-2 ${
              location === href
                ? "border-orange-500 text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
            style={{ paddingTop: 14, paddingBottom: 14 }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px bg-[#1c1c1c] mx-3 self-stretch" />

      {/* Features */}
      <div className="flex items-stretch">
        {FEATURE_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center px-3 text-[11px] font-medium transition-colors border-b-2 ${
              location === href
                ? "border-orange-500 text-white"
                : "border-transparent text-gray-600 hover:text-gray-400"
            }`}
            style={{ paddingTop: 14, paddingBottom: 14 }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right — coming soon */}
      <div className="ml-auto flex items-center">
        <Link href="/soon" className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors px-4">
          Roadmap
        </Link>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <NavBar />
      <div className="pt-[49px]">
        <Switch>
          <Route path="/" component={StudioPage} />
          <Route path="/reel" component={VideoTemplate} />
          <Route path="/teleprompter" component={TeleprompterPage} />
          <Route path="/booth" component={BoothStripPage} />
          <Route path="/create" component={CreateGlimr} />
          <Route path="/soon" component={SoonPage} />
          <Route path="/features/magic-recap" component={MagicRecapPage} />
          <Route path="/features/time-lock" component={TimeLockPage} />
          <Route path="/features/drop-ins" component={CelebrityDropInsPage} />
          <Route path="/features/filter-mode" component={CartoonModePage} />
          <Route path="/features/sms-delivery" component={SMSDeliveryPage} />
          <Route path="/features/booth-premium" component={BoothPremiumPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StudioProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </StudioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

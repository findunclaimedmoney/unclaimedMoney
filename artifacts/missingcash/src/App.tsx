import { Router, Route, Switch } from "wouter";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import MiaChat from "@/components/MiaChat";
import Home from "@/pages/Home";
import Finance from "@/pages/Finance";
import Contact from "@/pages/Contact";
import Crypto from "@/pages/Crypto";
import Guides from "@/pages/Guides";
import FindMyMoney from "@/pages/FindMyMoney";
import ThankYou from "@/pages/ThankYou";
import DeceasedEstate from "@/pages/DeceasedEstate";
import LotteryChecker from "@/pages/LotteryChecker";
import Privacy from "@/pages/Privacy";
import AustraliaMap from "@/pages/AustraliaMap";
import NotFound from "@/pages/not-found";

const BASE = import.meta.env.BASE_URL;

export default function App() {
  return (
    <Router base={BASE.replace(/\/$/, "")}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <NavBar />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/finance" component={Finance} />
            <Route path="/contact" component={Contact} />
            <Route path="/crypto" component={Crypto} />
            <Route path="/guides" component={Guides} />
            <Route path="/find-my-money" component={FindMyMoney} />
            <Route path="/thank-you/:guide" component={ThankYou} />
            <Route path="/deceased-estate" component={DeceasedEstate} />
            <Route path="/lottery-checker" component={LotteryChecker} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/map" component={AustraliaMap} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
        <MiaChat />
      </div>
    </Router>
  );
}

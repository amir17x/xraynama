import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ContentPage from "@/pages/content-page";
import CategoryPage from "@/pages/category-page";
import SearchPage from "@/pages/search-page";
import ProfilePage from "@/pages/profile-page";
import ContactPage from "@/pages/contact-page";
import ReportPage from "@/pages/report-page";
import RequestPage from "@/pages/request-page";
import TermsPage from "@/pages/terms-page";
import FAQPage from "@/pages/faq-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/content/:id" component={ContentPage} />
      <Route path="/category/:type" component={CategoryPage} />
      <Route path="/search" component={SearchPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      
      {/* Support pages */}
      <Route path="/contact" component={ContactPage} />
      <Route path="/report" component={ReportPage} />
      <Route path="/request" component={RequestPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/faq" component={FAQPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

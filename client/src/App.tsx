import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";

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
import TopIMDBPage from "@/pages/top-imdb-page";
import ForgotPasswordPage from "@/pages/forgot-password";
import VerifyCodePage from "@/pages/verify-code";
import ResetPasswordPage from "@/pages/reset-password";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminContent from "@/pages/admin/content";
import AdminComments from "@/pages/admin/comments";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/content/:id" component={ContentPage} />
      <Route path="/category/:type" component={CategoryPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/top-imdb" component={TopIMDBPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      
      {/* Password reset pages */}
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/verify-code" component={VerifyCodePage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      
      {/* Support pages */}
      <Route path="/contact" component={ContactPage} />
      <Route path="/report" component={ReportPage} />
      <Route path="/request" component={RequestPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/faq" component={FAQPage} />
      
      {/* Admin pages - protected with AdminRoute */}
      <AdminRoute path="/admin/dashboard" component={AdminDashboard} />
      <AdminRoute path="/admin/users" component={AdminUsers} />
      <AdminRoute path="/admin/content" component={AdminContent} />
      <AdminRoute path="/admin/comments" component={AdminComments} />
      
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

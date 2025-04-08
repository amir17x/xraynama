import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";
import { LoadingProvider } from "@/contexts/LoadingContext";
import BlueSphereBackground from "@/components/common/BlueSphereBackground";

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
import TestReviews from "@/pages/TestReviews";

// New categorized pages
import IndexPage from "@/pages/index-page";
import MoviesPage from "@/pages/movies-page";
import SeriesPage from "@/pages/series-page";
import AnimationsPage from "@/pages/animations-page";
import DocumentariesPage from "@/pages/documentaries-page";
import AllContentPage from "@/pages/all-content-page";
import AdvancedSearchPage from "@/pages/advanced-search-page";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminContent from "@/pages/admin/Content";
import AdminComments from "@/pages/admin/Comments";
import AdminCategories from "@/pages/admin/Categories";
import AdminStatistics from "@/pages/admin/Statistics";
import LoadingTestPage from "@/pages/loading-test-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/content/:slug" component={ContentPage} />
      <Route path="/category/:type" component={CategoryPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/top-imdb" component={TopIMDBPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/test-reviews" component={TestReviews} />
      
      {/* New categorized pages */}
      <Route path="/index" component={IndexPage} />
      <Route path="/movies" component={MoviesPage} />
      <Route path="/series" component={SeriesPage} />
      <Route path="/animations" component={AnimationsPage} />
      <Route path="/documentaries" component={DocumentariesPage} />
      <Route path="/all-content" component={AllContentPage} />
      <Route path="/advanced-search" component={AdvancedSearchPage} />
      
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
      <Route path="/loading-test" component={LoadingTestPage} />
      
      {/* Admin pages - protected with AdminRoute */}
      <AdminRoute path="/admin/dashboard" component={AdminDashboard} />
      <AdminRoute path="/admin/users" component={AdminUsers} />
      <AdminRoute path="/admin/content" component={AdminContent} />
      <AdminRoute path="/admin/comments" component={AdminComments} />
      <AdminRoute path="/admin/categories" component={AdminCategories} />
      <AdminRoute path="/admin/statistics" component={AdminStatistics} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoadingProvider>
          <BlueSphereBackground />
          <Router />
          <Toaster />
        </LoadingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

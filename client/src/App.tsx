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
import AllContentPage from "@/pages/all-content-page";
import AdvancedSearchPage from "@/pages/advanced-search-page";
import CategoriesPage from "@/pages/categories/CategoriesPage";

// New glassmorphism pages
import NewMoviesPage from "@/pages/movies/MoviesPage";
import NewSeriesPage from "@/pages/series/SeriesPage";
import NewAnimationsPage from "@/pages/animations/AnimationsPage";
import NewDocumentariesPage from "@/pages/documentaries/DocumentariesPage";
import ArtistsPage from "@/pages/artists/ArtistsPage";
import AppPage from "@/pages/app/AppPage";

// Legacy categorized pages (will be replaced)
import MoviesPage from "@/pages/movies-page";
import SeriesPage from "@/pages/series-page";
import AnimationsPage from "@/pages/animations-page";
import DocumentariesPage from "@/pages/documentaries-page";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminContent from "@/pages/admin/Content";
import AdminComments from "@/pages/admin/Comments";
import AdminCategories from "@/pages/admin/Categories";
import AdminStatistics from "@/pages/admin/Statistics";
import LoadingTestPage from "@/pages/loading-test-page";
import ToastTestPage from "@/pages/toast-test-page";
import APITestPage from "@/pages/api-test-page";

function Router() {
  return (
    <Switch>
      {/* Main pages */}
      <Route path="/" component={HomePage} />
      <Route path="/browse" component={AllContentPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/search/advanced" component={AdvancedSearchPage} />
      
      {/* Media content pages */}
      <Route path="/movies" component={NewMoviesPage} />
      <Route path="/movies/popular" component={NewMoviesPage} />
      <Route path="/movies/top-rated" component={NewMoviesPage} />
      <Route path="/movies/latest" component={NewMoviesPage} />
      <Route path="/movies/genre/:genre-slug" component={NewMoviesPage} />
      <Route path="/movies/:movie-slug" component={ContentPage} />
      
      <Route path="/series" component={NewSeriesPage} />
      <Route path="/series/popular" component={NewSeriesPage} />
      <Route path="/series/top-rated" component={NewSeriesPage} />
      <Route path="/series/latest" component={NewSeriesPage} />
      <Route path="/series/genre/:genre-slug" component={NewSeriesPage} />
      <Route path="/series/:series-slug" component={ContentPage} />
      <Route path="/series/:series-slug/season/:season-number" component={ContentPage} />
      <Route path="/series/:series-slug/season/:season-number/episode/:episode-number" component={ContentPage} />
      
      <Route path="/animations" component={NewAnimationsPage} />
      <Route path="/animations/popular" component={NewAnimationsPage} />
      <Route path="/animations/top-rated" component={NewAnimationsPage} />
      <Route path="/animations/latest" component={NewAnimationsPage} />
      <Route path="/animations/genre/:genre-slug" component={NewAnimationsPage} />
      <Route path="/animations/:animation-slug" component={ContentPage} />
      
      <Route path="/documentaries" component={NewDocumentariesPage} />
      <Route path="/documentaries/popular" component={NewDocumentariesPage} />
      <Route path="/documentaries/top-rated" component={NewDocumentariesPage} />
      <Route path="/documentaries/latest" component={NewDocumentariesPage} />
      <Route path="/documentaries/genre/:genre-slug" component={NewDocumentariesPage} />
      <Route path="/documentaries/:documentary-slug" component={ContentPage} />
      
      {/* People pages */}
      <Route path="/people" component={ArtistsPage} />
      <Route path="/people/actors" component={ArtistsPage} />
      <Route path="/people/directors" component={ArtistsPage} />
      <Route path="/people/:person-slug" component={ArtistsPage} />
      
      {/* Genres and categories */}
      <Route path="/genres" component={CategoriesPage} />
      <Route path="/genres/:genre-slug" component={CategoriesPage} />
      
      {/* Account pages - protected */}
      <ProtectedRoute path="/account" component={ProfilePage} />
      <ProtectedRoute path="/account/watchlist" component={ProfilePage} />
      <ProtectedRoute path="/account/favorites" component={ProfilePage} />
      <ProtectedRoute path="/account/history" component={ProfilePage} />
      <ProtectedRoute path="/account/playlists" component={ProfilePage} />
      <ProtectedRoute path="/account/reviews" component={ProfilePage} />
      <ProtectedRoute path="/account/settings" component={ProfilePage} />
      
      {/* Authentication pages */}
      <Route path="/auth/login" component={AuthPage} />
      <Route path="/auth/register" component={AuthPage} />
      <Route path="/auth/forgot-password" component={ForgotPasswordPage} />
      <Route path="/auth/verify-code" component={VerifyCodePage} />
      <Route path="/auth/reset-password" component={ResetPasswordPage} />
      
      {/* Support pages */}
      <Route path="/support" component={ContactPage} />
      <Route path="/support/contact" component={ContactPage} />
      <Route path="/support/report" component={ReportPage} />
      <Route path="/support/request" component={RequestPage} />
      <Route path="/support/faq" component={FAQPage} />
      
      {/* Legal pages */}
      <Route path="/legal/terms" component={TermsPage} />
      <Route path="/legal/privacy" component={TermsPage} />
      
      {/* Utility pages */}
      <Route path="/api-test" component={APITestPage} />
      <Route path="/loading-test" component={LoadingTestPage} />
      <Route path="/toast-test" component={ToastTestPage} />
      <Route path="/test-reviews" component={TestReviews} />
      
      {/* Legacy routes maintained for backward compatibility */}
      <Route path="/content/:slug" component={ContentPage} />
      <Route path="/category/:type" component={CategoryPage} />
      <Route path="/top-imdb" component={TopIMDBPage} />
      <Route path="/profile" component={ProfilePage} />
      
      {/* Admin pages - protected with AdminRoute */}
      <AdminRoute path="/admin" component={AdminDashboard} />
      <AdminRoute path="/admin/dashboard" component={AdminDashboard} />
      <AdminRoute path="/admin/users" component={AdminUsers} />
      <AdminRoute path="/admin/content" component={AdminContent} />
      <AdminRoute path="/admin/comments" component={AdminComments} />
      <AdminRoute path="/admin/categories" component={AdminCategories} />
      <AdminRoute path="/admin/statistics" component={AdminStatistics} />
      
      {/* Catch all route for 404 */}
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

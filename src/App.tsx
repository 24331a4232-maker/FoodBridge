import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingButtons } from '@/components/FloatingButtons';
import { LoadingScreen } from '@/components/LoadingScreen';
import { PageTransition } from '@/components/PageTransition';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Home — eager (landing page, must load instantly)
import { HomePage } from '@/pages/HomePage';

// Section hub + inner pages — lazy-loaded for smaller initial bundle
const AboutSectionPage = lazy(() => import('@/pages/sections/AboutSectionPage').then(m => ({ default: m.AboutSectionPage })));
const GlobalImpactSectionPage = lazy(() => import('@/pages/sections/GlobalImpactSectionPage').then(m => ({ default: m.GlobalImpactSectionPage })));
const CommunitySectionPage = lazy(() => import('@/pages/sections/CommunitySectionPage').then(m => ({ default: m.CommunitySectionPage })));
const AnalyticsSectionPage = lazy(() => import('@/pages/sections/AnalyticsSectionPage').then(m => ({ default: m.AnalyticsSectionPage })));
const ServicesSectionPage = lazy(() => import('@/pages/sections/ServicesSectionPage').then(m => ({ default: m.ServicesSectionPage })));
const DashboardSectionPage = lazy(() => import('@/pages/sections/DashboardSectionPage').then(m => ({ default: m.DashboardSectionPage })));
const ResourcesSectionPage = lazy(() => import('@/pages/sections/ResourcesSectionPage').then(m => ({ default: m.ResourcesSectionPage })));

const AvailableFoodPage = lazy(() => import('@/pages/AvailableFoodPage').then(m => ({ default: m.AvailableFoodPage })));
const DonateFoodPage = lazy(() => import('@/pages/DonateFoodPage').then(m => ({ default: m.DonateFoodPage })));
const FoodQualityPage = lazy(() => import('@/pages/FoodQualityPage').then(m => ({ default: m.FoodQualityPage })));
const VolunteerDashboardPage = lazy(() => import('@/pages/VolunteerDashboardPage').then(m => ({ default: m.VolunteerDashboardPage })));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const DonorDashboardPage = lazy(() => import('@/pages/DonorDashboardPage').then(m => ({ default: m.DonorDashboardPage })));
const RestaurantDashboardPage = lazy(() => import('@/pages/RestaurantDashboardPage').then(m => ({ default: m.RestaurantDashboardPage })));
const NgoDashboardPage = lazy(() => import('@/pages/NgoDashboardPage').then(m => ({ default: m.NgoDashboardPage })));
const AccessDeniedPage = lazy(() => import('@/pages/AccessDeniedPage').then(m => ({ default: m.AccessDeniedPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const HelpCenterPage = lazy(() => import('@/pages/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })));
const CertificatePage = lazy(() => import('@/pages/CertificatePage').then(m => ({ default: m.CertificatePage })));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const CertificateHistoryPage = lazy(() => import('@/pages/CertificateHistoryPage').then(m => ({ default: m.CertificateHistoryPage })));
const VerifyCertificatePage = lazy(() => import('@/pages/VerifyCertificatePage').then(m => ({ default: m.VerifyCertificatePage })));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('@/pages/TermsPage').then(m => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const DonationTrackingPage = lazy(() => import('@/pages/DonationTrackingPage').then(m => ({ default: m.DonationTrackingPage })));
const CurrentLocationPage = lazy(() => import('@/pages/CurrentLocationPage').then(m => ({ default: m.CurrentLocationPage })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-primary-300 border-t-primary-600 animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Home */}
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />

          {/* About section */}
          <Route path="/about" element={<PageTransition><AboutSectionPage /></PageTransition>} />

          {/* Global Impact section */}
          <Route path="/global-impact" element={<PageTransition><GlobalImpactSectionPage /></PageTransition>} />
          <Route path="/challenges" element={<Navigate to="/global-impact" replace />} />

          {/* Community section */}
          <Route path="/community" element={<PageTransition><CommunitySectionPage /></PageTransition>} />
          <Route path="/achievements" element={<PageTransition><AchievementsPage /></PageTransition>} />

          {/* Analytics section */}
          <Route path="/analytics" element={<PageTransition><AnalyticsSectionPage /></PageTransition>} />

          {/* Services section */}
          <Route path="/services" element={<PageTransition><ServicesSectionPage /></PageTransition>} />
          <Route path="/services/donate-food" element={<PageTransition><DonateFoodPage /></PageTransition>} />
          <Route path="/services/available-food" element={<PageTransition><AvailableFoodPage /></PageTransition>} />
          <Route path="/services/food-quality" element={<PageTransition><FoodQualityPage /></PageTransition>} />
          <Route path="/services/tracking" element={<ProtectedRoute><PageTransition><DonationTrackingPage /></PageTransition></ProtectedRoute>} />
          <Route path="/services/verify-certificate" element={<PageTransition><VerifyCertificatePage /></PageTransition>} />
          <Route path="/services/verify-certificate/:certificateId" element={<PageTransition><VerifyCertificatePage /></PageTransition>} />
          <Route path="/services/certificates" element={<ProtectedRoute><PageTransition><CertificatePage /></PageTransition></ProtectedRoute>} />
          <Route path="/services/certificate-history" element={<ProtectedRoute><PageTransition><CertificateHistoryPage /></PageTransition></ProtectedRoute>} />

          {/* Dashboard section */}
          <Route path="/dashboard" element={<PageTransition><DashboardSectionPage /></PageTransition>} />
          <Route path="/dashboard/volunteer" element={<ProtectedRoute roles={['volunteer']}><PageTransition><VolunteerDashboardPage /></PageTransition></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute roles={['admin']}><PageTransition><AdminDashboardPage /></PageTransition></ProtectedRoute>} />
          <Route path="/dashboard/donor" element={<ProtectedRoute roles={['donor']}><PageTransition><DonorDashboardPage /></PageTransition></ProtectedRoute>} />
          <Route path="/dashboard/restaurant" element={<ProtectedRoute roles={['restaurant']}><PageTransition><RestaurantDashboardPage /></PageTransition></ProtectedRoute>} />
          <Route path="/dashboard/ngo" element={<ProtectedRoute roles={['ngo']}><PageTransition><NgoDashboardPage /></PageTransition></ProtectedRoute>} />
          <Route path="/access-denied" element={<PageTransition><AccessDeniedPage /></PageTransition>} />

          {/* Resources section */}
          <Route path="/resources" element={<PageTransition><ResourcesSectionPage /></PageTransition>} />
          <Route path="/resources/help" element={<PageTransition><HelpCenterPage /></PageTransition>} />
          <Route path="/resources/contact" element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path="/resources/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
          <Route path="/resources/terms" element={<PageTransition><TermsPage /></PageTransition>} />

          {/* Location (utility page) */}
          <Route path="/location" element={<PageTransition><CurrentLocationPage /></PageTransition>} />

          {/* Auth */}
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />

          {/* Profile */}
          <Route path="/profile" element={<ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute>} />

          {/* Legacy redirects — keep old routes working */}
          <Route path="/donate-food" element={<Navigate to="/services/donate-food" replace />} />
          <Route path="/available-food" element={<Navigate to="/services/available-food" replace />} />
          <Route path="/food-quality" element={<Navigate to="/services/food-quality" replace />} />
          <Route path="/tracking" element={<Navigate to="/services/tracking" replace />} />
          <Route path="/verify-certificate" element={<Navigate to="/services/verify-certificate" replace />} />
          <Route path="/verify-certificate/:certificateId" element={<Navigate to="/services/verify-certificate/:certificateId" replace />} />
          <Route path="/certificate" element={<Navigate to="/services/certificates" replace />} />
          <Route path="/my-certificates" element={<Navigate to="/services/certificate-history" replace />} />
          <Route path="/volunteer" element={<Navigate to="/dashboard/volunteer" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="/contact" element={<Navigate to="/resources/contact" replace />} />
          <Route path="/help" element={<Navigate to="/resources/help" replace />} />
          <Route path="/privacy" element={<Navigate to="/resources/privacy" replace />} />
          <Route path="/terms" element={<Navigate to="/resources/terms" replace />} />

          {/* 404 */}
          <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <AnimatedRoutes />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('foodbridge-loaded'));

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('foodbridge-loaded', 'true');
        setLoading(false);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              {loading && <LoadingScreen />}
              <AppShell />
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

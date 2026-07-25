import { useEffect, useState } from 'react';
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

// Home
import { HomePage } from '@/pages/HomePage';

// Section hub pages
import { AboutSectionPage } from '@/pages/sections/AboutSectionPage';
import { GlobalImpactSectionPage } from '@/pages/sections/GlobalImpactSectionPage';
import { CommunitySectionPage } from '@/pages/sections/CommunitySectionPage';
import { AnalyticsSectionPage } from '@/pages/sections/AnalyticsSectionPage';
import { ServicesSectionPage } from '@/pages/sections/ServicesSectionPage';
import { DashboardSectionPage } from '@/pages/sections/DashboardSectionPage';
import { ResourcesSectionPage } from '@/pages/sections/ResourcesSectionPage';

// Existing pages (preserved under their section routes)
import { AvailableFoodPage } from '@/pages/AvailableFoodPage';
import { DonateFoodPage } from '@/pages/DonateFoodPage';
import { FoodQualityPage } from '@/pages/FoodQualityPage';
import { VolunteerDashboardPage } from '@/pages/VolunteerDashboardPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ContactPage } from '@/pages/ContactPage';
import { HelpCenterPage } from '@/pages/HelpCenterPage';
import { CertificatePage } from '@/pages/CertificatePage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { CertificateHistoryPage } from '@/pages/CertificateHistoryPage';
import { VerifyCertificatePage } from '@/pages/VerifyCertificatePage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DonationTrackingPage } from '@/pages/DonationTrackingPage';
import { CurrentLocationPage } from '@/pages/CurrentLocationPage';
import { RealChallengesPage } from '@/pages/RealChallengesPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
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
        <Route path="/dashboard/volunteer" element={<ProtectedRoute><PageTransition><VolunteerDashboardPage /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute roles={['admin']}><PageTransition><AdminDashboardPage /></PageTransition></ProtectedRoute>} />

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

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingButtons } from '@/components/FloatingButtons';
import { LoadingScreen } from '@/components/LoadingScreen';
import { PageTransition } from '@/components/PageTransition';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { AvailableFoodPage } from '@/pages/AvailableFoodPage';
import { DonateFoodPage } from '@/pages/DonateFoodPage';
import { FoodQualityPage } from '@/pages/FoodQualityPage';
import { VolunteerDashboardPage } from '@/pages/VolunteerDashboardPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ContactPage } from '@/pages/ContactPage';
import { CertificatePage } from '@/pages/CertificatePage';
import { CertificateHistoryPage } from '@/pages/CertificateHistoryPage';
import { VerifyCertificatePage } from '@/pages/VerifyCertificatePage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

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
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/available-food" element={<PageTransition><AvailableFoodPage /></PageTransition>} />
        <Route path="/donate-food" element={<PageTransition><DonateFoodPage /></PageTransition>} />
        <Route path="/food-quality" element={<PageTransition><FoodQualityPage /></PageTransition>} />
        <Route path="/volunteer" element={<ProtectedRoute><PageTransition><VolunteerDashboardPage /></PageTransition></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><PageTransition><AdminDashboardPage /></PageTransition></ProtectedRoute>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/profile" element={<ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/certificate" element={<ProtectedRoute><PageTransition><CertificatePage /></PageTransition></ProtectedRoute>} />
        <Route path="/my-certificates" element={<ProtectedRoute><PageTransition><CertificateHistoryPage /></PageTransition></ProtectedRoute>} />
        <Route path="/verify-certificate" element={<PageTransition><VerifyCertificatePage /></PageTransition>} />
        <Route path="/verify-certificate/:certificateId" element={<PageTransition><VerifyCertificatePage /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />
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
          <BrowserRouter>
            {loading && <LoadingScreen />}
            <AppShell />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

import {
  Radio, Users, Package, Truck, Store, Building2, ShieldCheck, QrCode,
  Award, BarChart3, FileText, Bell, Settings, MapPin, LogIn,
} from 'lucide-react';
import { DashboardLayout, type NavItem } from '@/components/dashboard/DashboardLayout';
import {
  AdminOverviewSection,
  AdminUserManagementSection,
  AdminDonationManagementSection,
  AdminVolunteerManagementSection,
  AdminVolunteerTrackingSection,
  AdminRestaurantManagementSection,
  AdminNgoManagementSection,
  AdminFoodQualitySection,
  AdminQrVerificationSection,
  AdminCertificateManagementSection,
  AdminAnalyticsSection,
  AdminReportsSection,
  AdminNotificationsSection,
  AdminSettingsSection,
  AdminLoginActivitySection,
} from '@/components/dashboard/sections/AdminSections';

export function AdminDashboardPage() {
  const navItems: NavItem[] = [
    { key: 'overview', label: 'Dashboard Overview', icon: Radio, content: <AdminOverviewSection /> },
    { key: 'users', label: 'User Management', icon: Users, content: <AdminUserManagementSection /> },
    { key: 'donations', label: 'Donation Management', icon: Package, content: <AdminDonationManagementSection /> },
    { key: 'volunteers', label: 'Volunteer Management', icon: Truck, content: <AdminVolunteerManagementSection /> },
    { key: 'volunteer-tracking', label: 'Volunteer Tracking', icon: MapPin, content: <AdminVolunteerTrackingSection /> },
    { key: 'restaurants', label: 'Restaurant Management', icon: Store, content: <AdminRestaurantManagementSection /> },
    { key: 'ngos', label: 'NGO Management', icon: Building2, content: <AdminNgoManagementSection /> },
    { key: 'quality', label: 'Food Quality Monitoring', icon: ShieldCheck, content: <AdminFoodQualitySection /> },
    { key: 'qr', label: 'QR Verification', icon: QrCode, content: <AdminQrVerificationSection /> },
    { key: 'certificates', label: 'Certificate Management', icon: Award, content: <AdminCertificateManagementSection /> },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, content: <AdminAnalyticsSection /> },
    { key: 'reports', label: 'Reports', icon: FileText, content: <AdminReportsSection /> },
    { key: 'notifications', label: 'Notifications', icon: Bell, content: <AdminNotificationsSection /> },
    { key: 'settings', label: 'Settings', icon: Settings, content: <AdminSettingsSection /> },
    { key: 'login-activity', label: 'Login Activity', icon: LogIn, content: <AdminLoginActivitySection /> },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Admin"
      subtitle="Platform control"
      roles={['admin']}
      accent="rose"
    />
  );
}

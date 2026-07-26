import {
  Plus, MapPin, Award, ShieldCheck, Bell, User as UserIcon,
} from 'lucide-react';
import { DashboardLayout, type NavItem } from '@/components/dashboard/DashboardLayout';
import {
  UserDonateFoodSection,
  UserTrackDonationSection,
  UserCertificatesSection,
  UserQrVerificationSection,
  UserNotificationsSection,
  UserProfileSection,
} from '@/components/dashboard/sections/UserSections';
import { useAuth } from '@/context/AuthContext';

export function UserDashboardPage() {
  const { profile } = useAuth();
  const roleLabel = profile?.role === 'restaurant' ? 'Restaurant' : profile?.role === 'ngo' ? 'NGO' : 'Donor';

  const navItems: NavItem[] = [
    { key: 'donate', label: 'Donate Food', icon: Plus, content: <UserDonateFoodSection /> },
    { key: 'track', label: 'Track Donation', icon: MapPin, content: <UserTrackDonationSection /> },
    { key: 'certificates', label: 'My Certificates', icon: Award, content: <UserCertificatesSection /> },
    { key: 'qr', label: 'QR Verification', icon: ShieldCheck, content: <UserQrVerificationSection /> },
    { key: 'notifications', label: 'Notifications', icon: Bell, content: <UserNotificationsSection /> },
    { key: 'profile', label: 'Profile', icon: UserIcon, content: <UserProfileSection /> },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title={roleLabel}
      subtitle="Your dashboard"
      roles={['donor', 'restaurant', 'ngo']}
      accent="primary"
    />
  );
}

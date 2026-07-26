import { Plus, MapPin, User as UserIcon } from 'lucide-react';
import { DashboardLayout, type NavItem } from '@/components/dashboard/DashboardLayout';
import {
  UserDonateFoodSection,
  UserTrackDonationSection,
  UserProfileSection,
} from '@/components/dashboard/sections/UserSections';
import { useAuth } from '@/context/AuthContext';

export function UserDashboardPage() {
  const { profile } = useAuth();
  const roleLabel = profile?.role === 'restaurant' ? 'Restaurant' : profile?.role === 'ngo' ? 'NGO' : 'Donor';

  const navItems: NavItem[] = [
    { key: 'donate', label: 'Donate Food', icon: Plus, content: <UserDonateFoodSection /> },
    { key: 'track', label: 'My Food', icon: MapPin, content: <UserTrackDonationSection /> },
    { key: 'profile', label: 'My Profile', icon: UserIcon, content: <UserProfileSection /> },
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

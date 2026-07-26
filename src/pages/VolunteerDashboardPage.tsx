import {
  Package, MapPin, CheckCircle2, ShieldCheck, Truck, User as UserIcon,
} from 'lucide-react';
import { DashboardLayout, type NavItem } from '@/components/dashboard/DashboardLayout';
import {
  VolunteerAssignedSection,
  VolunteerLiveTrackingSection,
  VolunteerDeliveryHistorySection,
  VolunteerFoodQualitySection,
  VolunteerAvailabilitySection,
  VolunteerProfileSection,
} from '@/components/dashboard/sections/VolunteerSections';

export function VolunteerDashboardPage() {
  const navItems: NavItem[] = [
    { key: 'assigned', label: 'Assigned Donations', icon: Package, content: <VolunteerAssignedSection /> },
    { key: 'live', label: 'Live Tracking', icon: MapPin, content: <VolunteerLiveTrackingSection /> },
    { key: 'history', label: 'Delivery History', icon: CheckCircle2, content: <VolunteerDeliveryHistorySection /> },
    { key: 'quality', label: 'Food Quality Update', icon: ShieldCheck, content: <VolunteerFoodQualitySection /> },
    { key: 'availability', label: 'Availability', icon: Truck, content: <VolunteerAvailabilitySection /> },
    { key: 'profile', label: 'Profile', icon: UserIcon, content: <VolunteerProfileSection /> },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Volunteer"
      subtitle="Delivery dashboard"
      roles={['volunteer']}
      accent="blue"
    />
  );
}

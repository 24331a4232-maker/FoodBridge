import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import type { FoodDonation, QrPayload, DonationHandover } from '@/types';

export function buildQrPayload(donation: FoodDonation, donorName: string): QrPayload {
  return {
    donationId: donation.id,
    donorId: donation.donor_id ?? '',
    donorName,
    foodName: donation.food_name,
    foodCategory: donation.category,
    quantity: `${donation.quantity} ${donation.quantity_unit}`,
    pickupAddress: `${donation.address ?? ''}${donation.city ? ', ' + donation.city : ''}`,
    createdAt: donation.created_at,
    status: donation.status,
  };
}

export function encodeQrPayload(payload: QrPayload): string {
  return JSON.stringify(payload);
}

export function decodeQrPayload(raw: string): QrPayload | null {
  try {
    const obj = JSON.parse(raw);
    if (typeof obj.donationId !== 'string' || typeof obj.donorId !== 'string') return null;
    return obj as QrPayload;
  } catch {
    return null;
  }
}

export async function renderQrDataUrl(payload: QrPayload): Promise<string> {
  return QRCode.toDataURL(encodeQrPayload(payload), {
    width: 320,
    margin: 2,
    color: { dark: '#1B4332', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  });
}

export async function createHandoverForDonation(
  donation: FoodDonation,
  donorName: string,
): Promise<DonationHandover | null> {
  const payload = buildQrPayload(donation, donorName);
  const qrCode = encodeQrPayload(payload);
  const qrCodeUrl = await renderQrDataUrl(payload);

  const { data, error } = await supabase
    .from('donation_handovers')
    .insert({
      donation_id: donation.id,
      qr_code: qrCode,
      qr_code_url: qrCodeUrl,
      donor_id: donation.donor_id ?? null,
      handover_status: 'waiting_volunteer',
    })
    .select('*')
    .maybeSingle();

  if (error || !data) return null;
  await supabase
    .from('food_donations')
    .update({ handover_status: 'waiting_volunteer' })
    .eq('id', donation.id);
  return data as DonationHandover;
}

export async function fetchHandover(donationId: string): Promise<DonationHandover | null> {
  const { data } = await supabase
    .from('donation_handovers')
    .select('*')
    .eq('donation_id', donationId)
    .maybeSingle();
  return (data as DonationHandover) ?? null;
}

export async function assignVolunteerToHandover(
  donationId: string,
  volunteerId: string,
): Promise<DonationHandover | null> {
  const { data, error } = await supabase
    .from('donation_handovers')
    .update({
      volunteer_id: volunteerId,
      handover_status: 'volunteer_assigned',
    })
    .eq('donation_id', donationId)
    .select('*')
    .maybeSingle();
  if (error || !data) return null;
  await supabase
    .from('food_donations')
    .update({ handover_status: 'volunteer_assigned' })
    .eq('id', donationId);
  return data as DonationHandover;
}

export async function verifyQrForHandover(
  donationId: string,
  volunteerId: string,
): Promise<DonationHandover | null> {
  const { data, error } = await supabase
    .from('donation_handovers')
    .update({
      qr_verified: true,
      qr_verified_at: new Date().toISOString(),
      handover_status: 'qr_verified',
      volunteer_id: volunteerId,
    })
    .eq('donation_id', donationId)
    .select('*')
    .maybeSingle();
  if (error || !data) return null;
  await supabase
    .from('food_donations')
    .update({ handover_status: 'qr_verified', qr_verified: true })
    .eq('id', donationId);
  return data as DonationHandover;
}

export interface QualityReportInput {
  checklist: Record<string, boolean>;
  freshness: string;
  packaging: string;
  temperature: string;
  rating: number;
  approval: 'approved' | 'rejected';
  rejectionReason: string;
  notes: string;
}

export async function submitQualityReport(
  donationId: string,
  report: QualityReportInput,
  photoUrl: string,
): Promise<DonationHandover | null> {
  const approved = report.approval === 'approved';
  const { data, error } = await supabase
    .from('donation_handovers')
    .update({
      quality_report: report as unknown as Record<string, unknown>,
      inspection_rating: report.rating,
      pickup_photo_url: photoUrl,
      handover_status: approved ? 'quality_approved' : 'quality_rejected',
    })
    .eq('donation_id', donationId)
    .select('*')
    .maybeSingle();
  if (error || !data) return null;
  await supabase
    .from('food_donations')
    .update({ handover_status: approved ? 'quality_approved' : 'quality_rejected' })
    .eq('id', donationId);
  return data as DonationHandover;
}

export async function confirmPickup(
  donationId: string,
): Promise<DonationHandover | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('donation_handovers')
    .update({
      pickup_confirmed: true,
      pickup_confirmed_at: now,
      handover_status: 'picked_up',
    })
    .eq('donation_id', donationId)
    .select('*')
    .maybeSingle();
  if (error || !data) return null;
  await supabase
    .from('food_donations')
    .update({
      handover_status: 'picked_up',
      status: 'picked_up',
      pickup_confirmed_at: now,
    })
    .eq('id', donationId);
  return data as DonationHandover;
}

export interface DistributionInput {
  photoUrl: string;
  peopleServed: number;
  location: string;
  notes: string;
}

export async function submitDistribution(
  donationId: string,
  dist: DistributionInput,
): Promise<DonationHandover | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('donation_handovers')
    .update({
      distribution_photo_url: dist.photoUrl,
      distribution_people_served: dist.peopleServed,
      distribution_location: dist.location,
      distribution_notes: dist.notes,
      distribution_at: now,
      handover_status: 'distributed',
    })
    .eq('donation_id', donationId)
    .select('*')
    .maybeSingle();
  if (error || !data) return null;
  await supabase
    .from('food_donations')
    .update({
      handover_status: 'distributed',
      distribution_photo_url: dist.photoUrl,
      distribution_people_served: dist.peopleServed,
      distribution_location: dist.location,
      distribution_notes: dist.notes,
      distribution_at: now,
    })
    .eq('id', donationId);
  return data as DonationHandover;
}

export async function adminVerifyDonation(
  donationId: string,
  approved: boolean,
  rejectionReason: string,
): Promise<DonationHandover | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('donation_handovers')
    .update({
      admin_verified: approved,
      admin_verified_at: approved ? now : null,
      admin_rejection_reason: approved ? null : rejectionReason,
      handover_status: approved ? 'admin_approved' : 'admin_rejected',
    })
    .eq('donation_id', donationId)
    .select('*')
    .maybeSingle();
  if (error || !data) return null;
  await supabase
    .from('food_donations')
    .update({
      handover_status: approved ? 'admin_approved' : 'admin_rejected',
      admin_verified: approved,
      admin_verified_at: approved ? now : null,
      admin_rejection_reason: approved ? null : rejectionReason,
    })
    .eq('id', donationId);
  return data as DonationHandover;
}

export function canGenerateCertificate(handover: DonationHandover | null): boolean {
  if (!handover) return false;
  return (
    handover.qr_verified &&
    handover.pickup_confirmed &&
    handover.pickup_photo_url !== null &&
    handover.distribution_photo_url !== null &&
    handover.admin_verified === true &&
    !handover.certificate_generated
  );
}

export async function generateDonationCertificate(
  donation: FoodDonation,
  handover: DonationHandover,
  volunteerName: string,
  donorName: string,
): Promise<{ certificateNumber: string; qrCodeUrl: string } | null> {
  if (!canGenerateCertificate(handover)) return null;
  const certNumber = `FB-CERT-${donation.id.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const qrPayload = JSON.stringify({
    certNumber,
    donationId: donation.id,
    volunteerName,
    donorName,
    date: new Date().toISOString(),
  });
  const qrCodeUrl = await QRCode.toDataURL(qrPayload, {
    width: 200,
    margin: 1,
    color: { dark: '#1B4332', light: '#ffffff' },
  });
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('donation_certificates')
    .insert({
      donation_id: donation.id,
      volunteer_id: handover.volunteer_id,
      donor_id: donation.donor_id ?? null,
      certificate_number: certNumber,
      qr_code: qrPayload,
      qr_code_url: qrCodeUrl,
    })
    .select('*')
    .maybeSingle();
  if (error || !data) return null;
  await supabase
    .from('donation_handovers')
    .update({
      certificate_generated: true,
      certificate_generated_at: now,
      handover_status: 'certificate_generated',
    })
    .eq('donation_id', donation.id);
  await supabase
    .from('food_donations')
    .update({
      certificate_generated: true,
      certificate_generated_at: now,
      handover_status: 'certificate_generated',
      status: 'delivered',
      delivery_time: now,
    })
    .eq('id', donation.id);
  return { certificateNumber: certNumber, qrCodeUrl };
}

export async function applyVolunteerRewards(
  volunteerId: string,
  _donation: FoodDonation,
): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('reward_points, total_deliveries, total_hours, badges')
    .eq('id', volunteerId)
    .maybeSingle();
  if (!profile) return;
  const newPoints = (profile.reward_points ?? 0) + 20;
  const newDeliveries = (profile.total_deliveries ?? 0) + 1;
  const newHours = Number(profile.total_hours ?? 0) + 1;
  const badges = (profile.badges ?? []) as string[];
  const updatedBadges = [...badges];
  if (newDeliveries >= 1 && !updatedBadges.includes('First Delivery')) updatedBadges.push('First Delivery');
  if (newDeliveries >= 5 && !updatedBadges.includes('5 Deliveries')) updatedBadges.push('5 Deliveries');
  if (newDeliveries >= 10 && !updatedBadges.includes('10 Deliveries')) updatedBadges.push('10 Deliveries');
  if (newPoints >= 100 && !updatedBadges.includes('100 Points')) updatedBadges.push('100 Points');
  if (newPoints >= 500 && !updatedBadges.includes('500 Points')) updatedBadges.push('500 Points');
  await supabase
    .from('profiles')
    .update({
      reward_points: newPoints,
      total_deliveries: newDeliveries,
      total_hours: newHours,
      badges: updatedBadges,
    })
    .eq('id', volunteerId);
}

export function isQrValid(handover: DonationHandover | null): boolean {
  if (!handover) return false;
  return !handover.pickup_confirmed;
}

export const HANDOVER_STEP_LABELS: { key: string; label: string }[] = [
  { key: 'waiting_volunteer', label: 'Waiting for Volunteer' },
  { key: 'volunteer_assigned', label: 'Volunteer Assigned' },
  { key: 'qr_verified', label: 'QR Verified' },
  { key: 'quality_approved', label: 'Food Quality Approved' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'distributed', label: 'Distributed' },
  { key: 'admin_approved', label: 'Admin Approved' },
  { key: 'certificate_generated', label: 'Certificate Generated' },
];

export const REJECTION_REASONS: { value: string; label: string }[] = [
  { value: 'expired', label: 'Expired' },
  { value: 'damaged_packaging', label: 'Damaged Packaging' },
  { value: 'bad_smell', label: 'Bad Smell' },
  { value: 'contaminated', label: 'Contaminated' },
  { value: 'unsafe_temperature', label: 'Unsafe Temperature' },
];

export const QUALITY_CHECKLIST: { key: string; label: string }[] = [
  { key: 'packaging_good', label: 'Packaging Good' },
  { key: 'fresh_smell', label: 'Fresh Smell' },
  { key: 'safe_temperature', label: 'Safe Temperature' },
  { key: 'not_expired', label: 'Not Expired' },
  { key: 'no_contamination', label: 'No Visible Contamination' },
];

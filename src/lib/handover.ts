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
  { key: 'delivered', label: 'Delivered' },
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

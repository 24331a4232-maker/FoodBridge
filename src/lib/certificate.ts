import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { supabase } from './supabase';

const ORG_NAME = 'The Last Plate';
const PROJECT_NAME = 'The Last Plate – FoodBridge Initiative';

export interface CertificateData {
  certificateNumber: string;
  uniqueId: string;
  volunteerName: string;
  organizationName: string;
  issueDate: string;
  deliveriesCount: number;
  hoursServed: number;
  totalMeals: number;
  qrCodeUrl: string;
  verifyUrl: string;
}

function generateUniqueId(): string {
  return 'UID-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function generateQRCode(verifyUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#1B4332', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
  } catch {
    return '';
  }
}

export async function createCertificateRecord(params: {
  volunteerId: string;
  volunteerName: string;
  organizationName?: string;
  deliveriesCount: number;
  hoursServed: number;
  totalMeals?: number;
}): Promise<CertificateData | null> {
  const { data: seqData } = await supabase.rpc('generate_certificate_number');
  const certificateNumber = (seqData as string) ?? `FB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const uniqueId = generateUniqueId();
  const verifyUrl = `${window.location.origin}/services/verify-certificate/${certificateNumber}`;
  const qrCodeUrl = await generateQRCode(verifyUrl);
  const issueDate = new Date().toISOString().split('T')[0];

  const { data: certData, error } = await supabase.from('certificates').insert({
    volunteer_id: params.volunteerId,
    certificate_number: certificateNumber,
    unique_id: uniqueId,
    volunteer_name: params.volunteerName,
    organization_name: params.organizationName ?? ORG_NAME,
    issue_date: issueDate,
    completion_date: issueDate,
    deliveries_count: params.deliveriesCount,
    hours_served: params.hoursServed,
    total_meals: params.totalMeals ?? params.deliveriesCount,
    qr_code_url: verifyUrl,
    is_valid: true,
  }).select('id').single();

  if (error || !certData) return null;

  await supabase.from('qr_verifications').insert({
    certificate_id: certData.id,
    qr_code: certificateNumber,
    verify_url: verifyUrl,
    is_verified: false,
  });

  return {
    certificateNumber,
    uniqueId,
    volunteerName: params.volunteerName,
    organizationName: params.organizationName ?? ORG_NAME,
    issueDate,
    deliveriesCount: params.deliveriesCount,
    hoursServed: params.hoursServed,
    totalMeals: params.totalMeals ?? params.deliveriesCount,
    qrCodeUrl,
    verifyUrl,
  };
}

async function loadImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(''); return; }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve('');
    img.src = src;
  });
}

export async function generateCertificatePDF(data: CertificateData, qrDataUrl: string): Promise<void> {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();  // 297
  const H = pdf.internal.pageSize.getHeight(); // 210

  // ── Parchment background ────────────────────────────────────────────────────
  pdf.setFillColor(245, 240, 228);
  pdf.rect(0, 0, W, H, 'F');

  // ── Outer green border (double line) ───────────────────────────────────────
  pdf.setDrawColor(27, 67, 50);
  pdf.setLineWidth(2);
  pdf.rect(6, 6, W - 12, H - 12);
  pdf.setLineWidth(0.6);
  pdf.rect(9, 9, W - 18, H - 18);

  // ── Art Deco corner ornaments (4 corners, L-shapes + small squares) ─────────
  const corners = [
    { x: 6, y: 6, sx: 1, sy: 1 },
    { x: W - 6, y: 6, sx: -1, sy: 1 },
    { x: 6, y: H - 6, sx: 1, sy: -1 },
    { x: W - 6, y: H - 6, sx: -1, sy: -1 },
  ];
  pdf.setFillColor(27, 67, 50);
  pdf.setDrawColor(27, 67, 50);
  corners.forEach(({ x, y, sx, sy }) => {
    // Filled L-bracket
    pdf.rect(x, y, sx * 18, sy * 3, 'F');
    pdf.rect(x, y, sx * 3, sy * 18, 'F');
    // Small accent square inset
    pdf.setFillColor(201, 166, 107);
    pdf.rect(x + sx * 4, y + sy * 4, sx * 4, sy * 4, 'F');
    pdf.setFillColor(27, 67, 50);
  });

  // ── Medallion seal (top centre, overlapping border) ─────────────────────────
  const medallionDataUrl = await loadImageAsDataUrl('/images/Gemini_Generated_Image_k3ckhuk3ckhuk3ck.png');
  const medalW = 36, medalH = 36;
  if (medallionDataUrl) {
    pdf.addImage(medallionDataUrl, 'PNG', W / 2 - medalW / 2, 2, medalW, medalH);
  }

  // ── Top-right metadata block ────────────────────────────────────────────────
  const issueDateStr = new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 40, 20);
  const metaX = W - 14;
  const metaLines: [string, string][] = [
    ['Certificate No:', data.certificateNumber],
    ['Unique ID:', data.uniqueId],
    ['Issued:', issueDateStr],
  ];
  metaLines.forEach(([label, val], i) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, metaX - 32, 16 + i * 5.5, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.text(val, metaX - 30, 16 + i * 5.5);
  });

  // ── Main title ──────────────────────────────────────────────────────────────
  pdf.setTextColor(45, 25, 10);
  pdf.setFontSize(26);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICATE OF APPRECIATION', W / 2, 48, { align: 'center' });

  // Gold rule under title
  pdf.setDrawColor(201, 166, 107);
  pdf.setLineWidth(0.8);
  pdf.line(W / 2 - 70, 51, W / 2 + 70, 51);

  // ── "Presented to" line ─────────────────────────────────────────────────────
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(80, 60, 40);
  pdf.text('This certificate is proudly presented to', W / 2, 58, { align: 'center' });

  // ── Volunteer name ──────────────────────────────────────────────────────────
  pdf.setFontSize(34);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(27, 15, 5);
  pdf.text(data.volunteerName || 'Volunteer', W / 2, 72, { align: 'center' });

  // Gold underline under name
  const nameW = Math.min(140, data.volunteerName.length * 8.5 + 20);
  pdf.setDrawColor(201, 166, 107);
  pdf.setLineWidth(0.7);
  pdf.line(W / 2 - nameW / 2, 75.5, W / 2 + nameW / 2, 75.5);

  // ── Body recognition text ───────────────────────────────────────────────────
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 40, 20);
  const bodyLines = [
    'in recognition of outstanding dedication and selfless service in redistributing surplus food',
    `from hotels and events to communities in need through ${PROJECT_NAME}.`,
    'Your commitment has helped reduce food waste and bring hope to those who need it most.',
  ];
  bodyLines.forEach((line, i) => pdf.text(line, W / 2, 84 + i * 5.5, { align: 'center' }));

  // ── Stats row ───────────────────────────────────────────────────────────────
  const statsY = 112;
  const stats = [
    { icon: '🚚', label: 'DELIVERIES COMPLETED', value: String(data.deliveriesCount), x: W / 2 - 55 },
    { icon: '⏱',  label: 'HOURS OF SERVICE',     value: String(Math.round(data.hoursServed)), x: W / 2 },
    { icon: '👥',  label: 'MEALS SAVED',           value: String(data.totalMeals), x: W / 2 + 55 },
  ];

  stats.forEach(({ label, value, x }) => {
    // Gold circle background
    pdf.setFillColor(201, 166, 107);
    pdf.circle(x, statsY - 4, 7, 'F');
    pdf.setFillColor(160, 120, 60);
    pdf.setLineWidth(0.4);
    pdf.setDrawColor(140, 100, 40);
    pdf.circle(x, statsY - 4, 7);
    // Stat number
    pdf.setTextColor(45, 25, 10);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, x + 12, statsY - 2, { align: 'left' });
    // Label
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 60, 40);
    pdf.text(label, x + 12, statsY + 3.5, { align: 'left' });
  });

  // ── Bottom three-column section ─────────────────────────────────────────────
  const botY = H - 30;

  // LEFT — Authorized signatory
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 40, 20);
  pdf.text('Authorized Signatory:', 20, botY);
  // Cursive-style signature line (italic large text)
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(30, 15, 5);
  pdf.text('The Last Plate Team', 20, botY + 9);
  pdf.setDrawColor(120, 80, 40);
  pdf.setLineWidth(0.5);
  pdf.line(20, botY + 11, 75, botY + 11);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 60, 40);
  pdf.text('The Last Plate Team', 20, botY + 15.5);
  pdf.text('Authorized Signatory', 20, botY + 20);
  pdf.text(`Date: ${issueDateStr}`, 20, botY + 24.5);

  // CENTRE — Motto quote
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(60, 40, 20);
  const motto1 = '"Because the last plate you don\'t need,';
  const motto2 = 'might be the only meal they get."';
  pdf.text(motto1, W / 2, botY + 8, { align: 'center' });
  pdf.text(motto2, W / 2, botY + 14, { align: 'center' });

  // RIGHT — QR code
  if (qrDataUrl) {
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 40, 20);
    pdf.text('Scan to Verify', W - 35, botY + 1);
    pdf.text('Authentic Certificate ->', W - 35, botY + 6);
    pdf.addImage(qrDataUrl, 'PNG', W - 40, botY + 8, 22, 22);
  }

  // ── Footer centre text ───────────────────────────────────────────────────────
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(27, 67, 50);
  pdf.text('Save Food  •  Share Food  •  Serve Humanity', W / 2, H - 10, { align: 'center' });

  pdf.save(`TheLastPlate-Certificate-${data.volunteerName.replace(/\s+/g, '-')}.pdf`);
}

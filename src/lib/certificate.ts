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
  const completionDate = issueDate;

  const { data: certData, error } = await supabase.from('certificates').insert({
    volunteer_id: params.volunteerId,
    certificate_number: certificateNumber,
    unique_id: uniqueId,
    volunteer_name: params.volunteerName,
    organization_name: params.organizationName ?? ORG_NAME,
    issue_date: issueDate,
    completion_date: completionDate,
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

/** Loads an image URL and returns a base64 data-URL (JPEG/PNG) for use in jsPDF */
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
  const W = pdf.internal.pageSize.getWidth();   // 297
  const H = pdf.internal.pageSize.getHeight();  // 210

  // ── Background ─────────────────────────────────────────────────────────────
  // Ivory base
  pdf.setFillColor(254, 252, 245);
  pdf.rect(0, 0, W, H, 'F');

  // Top colour band
  pdf.setFillColor(27, 67, 50);   // deep forest green
  pdf.rect(0, 0, W, 14, 'F');

  // Bottom colour band
  pdf.setFillColor(27, 67, 50);
  pdf.rect(0, H - 10, W, 10, 'F');

  // Gold accent stripe at bottom of header band
  pdf.setFillColor(201, 166, 107);
  pdf.rect(0, 14, W, 2.5, 'F');

  // Gold accent stripe above footer band
  pdf.setFillColor(201, 166, 107);
  pdf.rect(0, H - 12, W, 2, 'F');

  // Left decorative sidebar
  pdf.setFillColor(27, 67, 50);
  pdf.rect(0, 16.5, 8, H - 28.5, 'F');

  // Right decorative sidebar
  pdf.setFillColor(27, 67, 50);
  pdf.rect(W - 8, 16.5, 8, H - 28.5, 'F');

  // Gold thin inner border
  pdf.setDrawColor(201, 166, 107);
  pdf.setLineWidth(0.8);
  pdf.rect(12, 20, W - 24, H - 33, undefined);

  // ── Logo ───────────────────────────────────────────────────────────────────
  const logoDataUrl = await loadImageAsDataUrl('/images/WhatsApp_Image_2026-07-08_at_10.26.18_PM copy.jpeg');
  if (logoDataUrl) {
    // Logo placed in upper-left inside border
    pdf.addImage(logoDataUrl, 'JPEG', 16, 22, 32, 32);
  }

  // ── Header text (top band) ─────────────────────────────────────────────────
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('THE LAST PLATE  –  FOODBRIDGE INITIATIVE', W / 2, 9.5, { align: 'center' });

  // ── Title block ────────────────────────────────────────────────────────────
  const titleX = W / 2 + 14; // shift right to give logo room
  pdf.setTextColor(27, 67, 50);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Certificate of Appreciation', titleX, 34, { align: 'center' });

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(139, 94, 60);
  pdf.text('VOLUNTEER  ·  FOOD REDISTRIBUTION  ·  COMMUNITY SERVICE', titleX, 40, { align: 'center' });

  // Thin gold divider under subtitle
  pdf.setDrawColor(201, 166, 107);
  pdf.setLineWidth(0.6);
  pdf.line(titleX - 55, 43, titleX + 55, 43);

  // ── Presented to ───────────────────────────────────────────────────────────
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'italic');
  pdf.text('This certificate is proudly presented to', W / 2, 52, { align: 'center' });

  // Volunteer name
  pdf.setTextColor(27, 67, 50);
  pdf.setFontSize(30);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.volunteerName || 'Volunteer', W / 2, 65, { align: 'center' });

  // Gold underline proportional to name
  const nameLen = Math.min(130, (data.volunteerName || 'Volunteer').length * 7.5 + 20);
  pdf.setDrawColor(201, 166, 107);
  pdf.setLineWidth(0.7);
  pdf.line(W / 2 - nameLen / 2, 68.5, W / 2 + nameLen / 2, 68.5);

  // ── Body text ──────────────────────────────────────────────────────────────
  pdf.setTextColor(70, 70, 70);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const body = [
    'in recognition of outstanding dedication and selfless service in redistributing surplus food',
    `from hotels and events to communities in need through ${PROJECT_NAME}.`,
    'Your commitment has helped reduce food waste and bring hope to those who need it most.',
  ];
  body.forEach((line, i) => pdf.text(line, W / 2, 77 + i * 5.5, { align: 'center' }));

  // ── Stats row ──────────────────────────────────────────────────────────────
  const statsY = 101;
  const statCols = [
    { label: 'Deliveries Completed', value: String(data.deliveriesCount), x: W / 2 - 52 },
    { label: 'Hours of Service',     value: String(Math.round(data.hoursServed)), x: W / 2 },
    { label: 'Meals Saved',          value: String(data.totalMeals),  x: W / 2 + 52 },
  ];

  statCols.forEach(({ label, value, x }) => {
    // Pill background
    pdf.setFillColor(27, 67, 50);
    pdf.roundedRect(x - 20, statsY - 8, 40, 16, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, x, statsY + 1, { align: 'center' });
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(139, 94, 60);
    pdf.text(label.toUpperCase(), x, statsY + 11, { align: 'center' });
  });

  // ── Motto strip ────────────────────────────────────────────────────────────
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text('"Because the last plate you don\'t need, might be the only meal they get."', W / 2, 122, { align: 'center' });

  // ── Bottom section: signature | seal | QR ──────────────────────────────────
  const botY = H - 26;

  // Signature (left)
  pdf.setTextColor(30, 30, 30);
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(13);
  pdf.text('The Last Plate Team', 40, botY - 2);
  pdf.setDrawColor(150, 150, 150);
  pdf.setLineWidth(0.4);
  pdf.line(20, botY, 70, botY);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Authorized Signatory', 45, botY + 4.5, { align: 'center' });

  // Official seal (centre)
  const sX = W / 2, sY = botY - 4;
  pdf.setDrawColor(201, 166, 107);
  pdf.setLineWidth(1.5);
  pdf.circle(sX, sY, 11);
  pdf.setLineWidth(0.5);
  pdf.circle(sX, sY, 8.5);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(139, 94, 60);
  pdf.text('OFFICIAL', sX, sY - 2.5, { align: 'center' });
  pdf.text('SEAL', sX, sY + 1.5, { align: 'center' });
  pdf.setFontSize(5);
  pdf.text('THE LAST PLATE', sX, sY + 5.5, { align: 'center' });

  // QR code (right)
  if (qrDataUrl) {
    pdf.addImage(qrDataUrl, 'PNG', W - 40, botY - 14, 18, 18);
    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Scan to verify', W - 31, botY + 6, { align: 'center' });
  }

  // ── Footer band text ────────────────────────────────────────────────────────
  pdf.setTextColor(220, 220, 220);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Certificate No: ${data.certificateNumber}   ·   Unique ID: ${data.uniqueId}`, 16, H - 4);
  pdf.text(`Issued: ${new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, W - 16, H - 4, { align: 'right' });

  pdf.save(`TheLastPlate-Certificate-${data.volunteerName.replace(/\s+/g, '-')}.pdf`);
}

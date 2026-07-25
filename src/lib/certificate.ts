import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { supabase } from './supabase';

const ORG_NAME = 'FoodBridge';
const PROJECT_NAME = 'FoodBridge';
const SIGNATORY = 'Arjun Sharma';
const SIGNATORY_TITLE = 'Founder, FoodBridge';

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

  const { error } = await supabase.from('certificates').insert({
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
  });

  if (error) return null;

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

export async function generateCertificatePDF(data: CertificateData, qrDataUrl: string): Promise<void> {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // White background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, w, h, 'F');

  // Outer border — teal
  pdf.setDrawColor(27, 67, 50);
  pdf.setLineWidth(2.5);
  pdf.rect(6, 6, w - 12, h - 12);
  // Inner border — copper
  pdf.setDrawColor(139, 94, 60);
  pdf.setLineWidth(1);
  pdf.rect(10, 10, w - 20, h - 20);
  // Thin decorative line
  pdf.setDrawColor(27, 67, 50);
  pdf.setLineWidth(0.3);
  pdf.rect(13, 13, w - 26, h - 26);

  // Corner ornaments
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    pdf.setDrawColor(139, 94, 60);
    pdf.setLineWidth(1.5);
    pdf.line(x, y, x + dx, y);
    pdf.line(x, y, x, y + dy);
  };
  drawCorner(16, 16, 12, 12);
  drawCorner(w - 16, 16, -12, 12);
  drawCorner(16, h - 16, 12, -12);
  drawCorner(w - 16, h - 16, -12, -12);

  // Watermark — light FoodBridge text
  pdf.setTextColor(27, 67, 50);
  pdf.setFontSize(60);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(27, 67, 50, 18);
  pdf.text('FoodBridge', w / 2, h / 2 + 5, { align: 'center' });

  // Logo circle with "FB"
  pdf.setFillColor(27, 67, 50);
  pdf.circle(w / 2, 32, 11, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FB', w / 2, 35.5, { align: 'center' });

  // Title block
  pdf.setTextColor(27, 67, 50);
  pdf.setFontSize(26);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Volunteer Appreciation Certificate', w / 2, 55, { align: 'center' });

  pdf.setTextColor(120, 120, 120);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(PROJECT_NAME, w / 2, 62, { align: 'center' });

  // Divider
  pdf.setDrawColor(201, 166, 107);
  pdf.setLineWidth(0.8);
  pdf.line(w / 2 - 30, 66, w / 2 + 30, 66);

  // "Presented to"
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'italic');
  pdf.text('This certificate is proudly presented to', w / 2, 76, { align: 'center' });

  // Volunteer name
  pdf.setTextColor(20, 20, 20);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.volunteerName || 'Volunteer', w / 2, 88, { align: 'center' });

  // Underline under name
  pdf.setDrawColor(201, 166, 107);
  pdf.setLineWidth(0.5);
  const nameWidth = Math.min(120, (data.volunteerName || 'Volunteer').length * 6);
  pdf.line(w / 2 - nameWidth / 2, 91, w / 2 + nameWidth / 2, 91);

  // Body text
  pdf.setTextColor(80, 80, 80);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const bodyY = 100;
  const bodyLines = [
    'in recognition of outstanding dedication and valuable service in redistributing surplus food',
    'from hotels and events to people in need through the FoodBridge initiative.',
  ];
  bodyLines.forEach((line, i) => {
    pdf.text(line, w / 2, bodyY + i * 5.5, { align: 'center' });
  });
  pdf.text('Your contribution has helped reduce food waste and support communities.', w / 2, bodyY + 12, { align: 'center' });
  pdf.text('Thank you for making a meaningful difference.', w / 2, bodyY + 17.5, { align: 'center' });

  // Stats row
  pdf.setTextColor(27, 67, 50);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.deliveriesCount} Deliveries`, w / 2 - 40, 128, { align: 'center' });
  pdf.text(`${Math.round(data.hoursServed)} Hours`, w / 2, 128, { align: 'center' });
  pdf.text(`${data.totalMeals} Meals Saved`, w / 2 + 40, 128, { align: 'center' });

  // Bottom section: signature, seal, QR
  const bottomY = h - 35;

  // Signature
  pdf.setTextColor(40, 40, 40);
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(14);
  pdf.text(SIGNATORY, 45, bottomY);
  pdf.setDrawColor(150, 150, 150);
  pdf.setLineWidth(0.4);
  pdf.line(28, bottomY + 2, 75, bottomY + 2);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(SIGNATORY_TITLE, 45, bottomY + 6, { align: 'center' });

  // Official seal (circle with text)
  const sealX = w / 2;
  const sealY = bottomY - 2;
  pdf.setDrawColor(201, 166, 107);
  pdf.setLineWidth(1.5);
  pdf.circle(sealX, sealY, 13);
  pdf.setLineWidth(0.5);
  pdf.circle(sealX, sealY, 10.5);
  pdf.setFontSize(7);
  pdf.setTextColor(139, 94, 60);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OFFICIAL', sealX, sealY - 3, { align: 'center' });
  pdf.text('SEAL', sealX, sealY + 1, { align: 'center' });
  pdf.setFontSize(5);
  pdf.text('FOODBRIDGE', sealX, sealY + 5, { align: 'center' });

  // QR code
  if (qrDataUrl) {
    pdf.addImage(qrDataUrl, 'PNG', w - 42, bottomY - 12, 18, 18);
    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Scan to verify', w - 33, bottomY + 9, { align: 'center' });
  }

  // Certificate ID and issue date (bottom corners)
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Certificate ID: ${data.certificateNumber}`, 16, h - 16);
  pdf.text(`Issue Date: ${new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, w - 16, h - 16, { align: 'right' });
  pdf.text(`Unique ID: ${data.uniqueId}`, 16, h - 12);

  pdf.save(`FoodBridge-Certificate-${data.volunteerName.replace(/\s+/g, '-')}.pdf`);
}

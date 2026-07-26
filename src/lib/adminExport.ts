import type { AdminDonation, AdminUser } from '@/lib/adminData';

export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? '');
          return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function donationsToCSV(donations: AdminDonation[]) {
  exportToCSV('foodbridge-donations.csv', donations.map((d) => ({
    DonationID: d.id,
    DonorName: d.donorName,
    FoodType: d.foodType,
    Quantity: d.quantity,
    PickupAddress: d.pickupAddress,
    AssignedVolunteer: d.assignedVolunteer,
    Status: d.status,
    QualityScore: d.qualityScore,
    DonationDate: d.donationDate,
    DeliveryTime: d.deliveryTime ?? '',
  })));
}

export function usersToCSV(users: AdminUser[]) {
  exportToCSV('foodbridge-users.csv', users.map((u) => ({
    UserID: u.id,
    Name: u.name,
    Email: u.email,
    Phone: u.phone,
    Role: u.role,
    City: u.city,
    RegisteredOn: u.registeredOn,
    Verification: u.verification,
    LastLogin: u.lastLogin,
    TotalDonations: u.totalDonations,
    TotalDeliveries: u.totalDeliveries,
  })));
}

export function exportToPDF(title: string, headers: string[], rows: string[][]) {
  const win = window.open('', '_blank');
  if (!win) return;
  const tableHtml = `
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <thead><tr>${headers.map((h) => `<th style="border:1px solid #ddd;padding:6px;text-align:left;background:#f5f5f5;">${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #ddd;padding:6px;">${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
  win.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      .meta { color: #888; font-size: 12px; margin-bottom: 20px; }
      @media print { body { padding: 0; } }
    </style>
    </head><body>
    <h1>${title}</h1>
    <p class="meta">FoodBridge NGO Platform — Generated ${new Date().toLocaleString()}</p>
    ${tableHtml}
    </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

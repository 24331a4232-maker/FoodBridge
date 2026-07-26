import { useEffect, useState } from 'react';
import { Download, Loader2, QrCode as QrIcon, ShieldCheck, XCircle } from 'lucide-react';
import QRCode from 'qrcode';
import type { FoodDonation, DonationHandover } from '@/types';
import { buildQrPayload, renderQrDataUrl, isQrValid } from '@/lib/handover';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { RippleButton } from '@/components/ui/RippleButton';

interface DonationQrCardProps {
  donation: FoodDonation;
  donorName: string;
  handover?: DonationHandover | null;
  onInvalid?: () => void;
}

export function DonationQrCard({ donation, donorName, handover, onInvalid }: DonationQrCardProps) {
  const { toast } = useToast();
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const payload = buildQrPayload(donation, donorName);
    renderQrDataUrl(payload)
      .then((url) => {
        setQrUrl(url);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [donation, donorName]);

  const valid = isQrValid(handover ?? null);

  const downloadQr = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `FoodBridge-QR-${donation.food_name.replace(/\s+/g, '-')}.png`;
    a.click();
    toast('QR code downloaded', 'success');
  };

  if (!valid) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
          <XCircle className="h-7 w-7 text-gray-400" />
        </div>
        <p className="font-medium text-gray-600 dark:text-gray-300">QR Code Invalid</p>
        <p className="text-xs text-gray-400 mt-1">This QR code was used for pickup and is no longer valid.</p>
        {onInvalid && (
          <RippleButton onClick={onInvalid} variant="ghost" className="text-xs mt-3">Close</RippleButton>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-4">
        <QrIcon className="h-5 w-5 text-primary-500" />
        <h3 className="font-display font-bold text-sm">Donation QR Code</h3>
      </div>
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-2xl blur-lg" />
        <div className="relative bg-white p-4 rounded-2xl shadow-lg ring-1 ring-black/5">
          {loading ? (
            <div className="w-44 h-44 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <img src={qrUrl} alt="Donation QR code" className="w-44 h-44" />
          )}
        </div>
      </div>
      <div className="mt-4 space-y-1 text-left w-full max-w-xs">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Food</span>
          <span className="font-medium truncate ml-2">{donation.food_name}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Quantity</span>
          <span className="font-medium">{donation.quantity} {donation.quantity_unit}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Status</span>
          <span className="font-medium capitalize">{handover?.handover_status?.replace(/_/g, ' ') ?? donation.status}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <RippleButton onClick={downloadQr} variant="primary" className="text-xs" disabled={loading}>
          <Download className="h-3.5 w-3.5" /> Download
        </RippleButton>
      </div>
      <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2 text-left">
        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Show this QR to the volunteer when they arrive. It becomes invalid after pickup is confirmed.</span>
      </div>
    </div>
  );
}

interface DonationQrModalProps {
  donation: FoodDonation | null;
  donorName: string;
  onClose: () => void;
}

export function DonationQrModal({ donation, donorName, onClose }: DonationQrModalProps) {
  const [handover, setHandover] = useState<DonationHandover | null>(null);

  useEffect(() => {
    if (!donation) return;
    supabase
      .from('donation_handovers')
      .select('*')
      .eq('donation_id', donation.id)
      .maybeSingle()
      .then(({ data }) => setHandover((data as DonationHandover) ?? null));
  }, [donation]);

  if (!donation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <DonationQrCard donation={donation} donorName={donorName} handover={handover} onInvalid={onClose} />
        <button onClick={onClose} className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Close</button>
      </div>
    </div>
  );
}

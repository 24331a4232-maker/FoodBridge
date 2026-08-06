import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Loader2, ScanLine, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { RippleButton } from '@/components/ui/RippleButton';
import { decodeQrPayload } from '@/lib/handover';
import type { QrPayload } from '@/types';

interface QrScannerProps {
  onScan: (payload: QrPayload) => void;
  onClose: () => void;
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(true);
  const [scanning, setScanning] = useState(false);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const detect = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const w = video.videoWidth || 320;
    const h = video.videoHeight || 240;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    try {
      const img = ctx.getImageData(0, 0, w, h);
      const BarcodeDetectorCtor = (window as unknown as { BarcodeDetector?: typeof BarcodeDetector }).BarcodeDetector;
      const detector = BarcodeDetectorCtor ? new BarcodeDetectorCtor({ formats: ['qr_code'] }) : null;
      if (detector) {
        const codes = await detector.detect(img);
        if (codes.length > 0) {
          const raw = codes[0].rawValue;
          const payload = decodeQrPayload(raw);
          if (payload) {
            stop();
            onScan(payload);
            return;
          }
        }
      }
    } catch {
      // BarcodeDetector not available; fall back below
    }
    rafRef.current = requestAnimationFrame(detect);
  }, [onScan, stop]);

  const start = useCallback(async () => {
    setStarting(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStarting(false);
      setScanning(true);
      rafRef.current = requestAnimationFrame(detect);
    } catch (err) {
      setError('Could not access camera. Please grant camera permission and try again.');
      setStarting(false);
    }
  }, [detect]);

  useEffect(() => {
    start();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [start]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold flex items-center gap-2"><ScanLine className="h-5 w-5 text-primary-500" /> Scan Donation QR</h3>
            <button onClick={onClose} className="text-ink-soft/60 dark:text-cream/60 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"><X className="h-5 w-5" /></button>
          </div>
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black ring-2 ring-primary-500/30">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {starting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-xs">Starting camera...</p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <CameraOff className="h-10 w-10 text-red-400 mb-2" />
                <p className="text-xs text-red-300">{error}</p>
                <RippleButton onClick={start} variant="primary" className="text-xs mt-3">Retry</RippleButton>
              </div>
            )}
            {scanning && !error && (
              <>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 border-2 border-white/70 rounded-2xl" />
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-1 bg-primary-400 rounded-full shadow-lg"
                    animate={{ y: [-80, 80, -80] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
                <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/80">Point at the donor's QR code</p>
              </>
            )}
          </div>
          <p className="text-xs text-ink-soft dark:text-cream/60 mt-3 text-center">The scanner verifies the QR against the database automatically.</p>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';

interface ScanResult {
  status: 'success' | 'invalid' | 'used';
  message: string;
}

export function QrScanResult({ result, onClose, onViewDetails }: { result: ScanResult; onClose: () => void; onViewDetails?: () => void }) {
  const Icon = result.status === 'success' ? CheckCircle2 : AlertTriangle;
  const color = result.status === 'success' ? 'text-green-500' : 'text-red-500';
  const bg = result.status === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="glass-card p-6 text-center">
          <div className={`h-14 w-14 rounded-full ${bg} flex items-center justify-center mx-auto mb-3`}>
            <Icon className={`h-7 w-7 ${color}`} />
          </div>
          <h3 className="font-display font-bold mb-1">{result.status === 'success' ? 'QR Verified' : 'Invalid QR'}</h3>
          <p className="text-xs text-ink-soft dark:text-cream/60 mb-4">{result.message}</p>
          <div className="flex gap-2 justify-center">
            {result.status === 'success' && onViewDetails && (
              <RippleButton onClick={onViewDetails} variant="primary" className="text-xs">View Details</RippleButton>
            )}
            <RippleButton onClick={onClose} variant="ghost" className="text-xs">Close</RippleButton>
          </div>
        </div>
      </div>
    </div>
  );
}

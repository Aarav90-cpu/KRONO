import React, { useState } from 'react';
import { X, Radio, MapPin, CheckCircle2, Lock, Unlock } from 'lucide-react';

interface DecryptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessClaim: (beaconId: string, yieldReward: string) => void;
  beaconDetails?: {
    beaconId: string;
    distance: string;
    peersNearby: number;
    coordinates: string;
  };
}

export const DecryptModal: React.FC<DecryptModalProps> = ({
  isOpen,
  onClose,
  onSuccessClaim,
  beaconDetails = {
    beaconId: 'BEACON_WH_18B',
    distance: '0.4 miles away',
    peersNearby: 19,
    coordinates: '40.7128° N, 74.0060° W',
  },
}) => {
  const [step, setStep] = useState<'initial' | 'scanning' | 'claimed'>('initial');

  if (!isOpen) return null;

  const handleStartHandshake = () => {
    setStep('scanning');
    setTimeout(() => {
      setStep('claimed');
      onSuccessClaim(beaconDetails.beaconId, '+$14.20');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-surface border border-border-glass-dark p-5 shadow-lg flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-glass-dark">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-bold text-on-surface">Local Drop Verification</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col items-center text-center gap-4 py-2">
          {step === 'initial' && (
            <>
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-on-surface">
                  {beaconDetails.beaconId}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs text-outline mt-1">
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                  <span>{beaconDetails.distance}</span>
                  <span>•</span>
                  <span>{beaconDetails.peersNearby} peers verifying</span>
                </div>
              </div>

              <div className="w-full p-3 rounded-lg bg-surface-container-low border border-border-glass-dark text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between text-outline">
                  <span>Coordinates</span>
                  <span className="text-on-surface font-mono">{beaconDetails.coordinates}</span>
                </div>
                <div className="flex items-center justify-between text-outline">
                  <span>Reward</span>
                  <span className="text-secondary font-semibold">+$14.20 Instant Drop</span>
                </div>
              </div>

              <button
                onClick={handleStartHandshake}
                className="w-full py-2.5 rounded-lg bg-secondary text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Verify Proximity & Unlock
              </button>
            </>
          )}

          {step === 'scanning' && (
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
              <span className="text-xs font-medium text-on-surface">
                Verifying local node proximity...
              </span>
              <span className="text-[11px] text-outline">
                Zero-knowledge proof handshake
              </span>
            </div>
          )}

          {step === 'claimed' && (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Unlock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-on-surface">Drop Unlocked</h3>
              <p className="text-xs text-on-surface-variant max-w-xs">
                +$14.20 has been credited to your creator balance.
              </p>
              <button
                onClick={onClose}
                className="w-full mt-2 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, DollarSign, ShieldCheck, ArrowRight } from 'lucide-react';

interface EscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => void;
  currentEscrow: number;
}

export const EscrowModal: React.FC<EscrowModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
  currentEscrow,
}) => {
  const [depositAmount, setDepositAmount] = useState('1000');

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) return;
    onDeposit(val);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-surface border border-border-glass-dark p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-glass-dark">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-on-surface">Deposit Ad Escrow</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-outline">Current Escrow Balance:</span>
            <span className="text-lg font-bold text-on-surface">
              ${currentEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
            </span>
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <label className="text-outline font-medium">Deposit Amount (USDC):</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline font-semibold">$</span>
              <input
                type="number"
                min="50"
                step="50"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-surface-container-low border border-border-glass-dark rounded-lg text-on-surface font-semibold text-sm focus:outline-none focus:border-primary/50"
                placeholder="1000"
              />
            </div>
            <div className="flex gap-2 pt-1">
              {['250', '500', '1000', '2500'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDepositAmount(preset)}
                  className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-surface-container-high text-xs text-on-surface transition-colors cursor-pointer"
                >
                  +${preset}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low border border-border-glass-dark text-xs text-outline flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
            <span>
              Funds are held in sovereign escrow and released only upon verified impression delivery.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Confirm Deposit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

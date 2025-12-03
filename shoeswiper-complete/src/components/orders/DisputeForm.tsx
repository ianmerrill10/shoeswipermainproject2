import React, { useState, useRef } from 'react';
import {
  DisputeReason,
  DISPUTE_REASONS,
  EscrowTransaction,
  canOpenDispute,
} from '../../lib/escrow';

interface DisputeFormProps {
  transaction: EscrowTransaction;
  onSubmit: (reason: DisputeReason, description: string, evidence: File[]) => Promise<boolean>;
  onCancel: () => void;
}

/**
 * Form for opening a dispute on an order
 */
export function DisputeForm({ transaction, onSubmit, onCancel }: DisputeFormProps) {
  const [reason, setReason] = useState<DisputeReason | ''>('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { canDispute, reason: cannotDisputeReason } = canOpenDispute(transaction);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Limit to 5 files, max 10MB each
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024).slice(0, 5 - evidence.length);
    setEvidence([...evidence, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason for the dispute');
      return;
    }
    if (description.length < 20) {
      setError('Please provide more details (at least 20 characters)');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const success = await onSubmit(reason, description, evidence);
      if (!success) {
        setError('Failed to submit dispute. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (!canDispute) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <div className="flex items-center gap-3 text-zinc-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium">Cannot Open Dispute</p>
            <p className="text-sm text-zinc-500">{cannotDisputeReason}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Open Dispute</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-zinc-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Reason Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Reason for Dispute *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(DISPUTE_REASONS) as [DisputeReason, typeof DISPUTE_REASONS[DisputeReason]][]).map(
            ([key, { label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setReason(key)}
                className={`
                  p-3 rounded-lg border text-left text-sm transition-colors
                  ${reason === key
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                  }
                `}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Describe the Issue *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please provide details about the issue..."
          rows={4}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
        />
        <p className="text-xs text-zinc-500 mt-1">
          {description.length}/500 characters (minimum 20)
        </p>
      </div>

      {/* Evidence Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Evidence (Optional)
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Upload photos or screenshots to support your claim (max 5 files, 10MB each)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-wrap gap-2">
          {evidence.map((file, index) => (
            <div
              key={index}
              className="relative bg-zinc-800 rounded-lg p-2 pr-8"
            >
              <span className="text-sm text-zinc-300 truncate max-w-[120px] block">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 text-zinc-500 hover:text-red-400"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {evidence.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Photo
            </button>
          )}
        </div>
      </div>

      {/* Warning */}
      <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-yellow-400">
          <strong>Important:</strong> Opening a dispute will pause the escrow release until the issue is resolved.
          False claims may result in account restrictions.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-lg font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !reason || description.length < 20}
          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Dispute'}
        </button>
      </div>
    </form>
  );
}

export default DisputeForm;

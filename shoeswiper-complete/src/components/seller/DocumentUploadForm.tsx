import React, { useState, useRef } from 'react';
import {
  DocumentType,
  VerificationDocument,
  VerificationStatus,
} from '../../lib/sellerVerification';

interface DocumentUploadFormProps {
  onUpload: (documentType: DocumentType, file: File) => Promise<VerificationDocument | null>;
  existingDocuments: VerificationDocument[];
  disabled?: boolean;
}

const DOCUMENT_TYPES: {
  type: DocumentType;
  label: string;
  description: string;
  acceptedFormats: string;
}[] = [
  {
    type: 'government_id',
    label: 'Government ID',
    description: 'Passport, driver\'s license, or national ID card',
    acceptedFormats: 'image/*,.pdf',
  },
  {
    type: 'proof_of_address',
    label: 'Proof of Address',
    description: 'Utility bill, bank statement, or official letter (within 3 months)',
    acceptedFormats: 'image/*,.pdf',
  },
  {
    type: 'bank_statement',
    label: 'Bank Statement',
    description: 'Recent bank statement showing your name and address',
    acceptedFormats: 'image/*,.pdf',
  },
  {
    type: 'social_media_verification',
    label: 'Social Media Verification',
    description: 'Screenshot of your verified social media profile',
    acceptedFormats: 'image/*',
  },
];

const STATUS_STYLES: Record<VerificationStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending Review' },
  approved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Approved' },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rejected' },
  expired: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Expired' },
};

/**
 * Form for uploading verification documents
 */
export function DocumentUploadForm({
  onUpload,
  existingDocuments,
  disabled = false,
}: DocumentUploadFormProps) {
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getExistingDocument = (type: DocumentType): VerificationDocument | undefined => {
    return existingDocuments.find(d => d.document_type === type);
  };

  const handleFileSelect = async (type: DocumentType, file: File) => {
    setError(null);
    setUploading(type);

    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const result = await onUpload(type, file);
      if (!result) {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleInputChange = (type: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(type, file);
    }
  };

  const triggerFileInput = (type: DocumentType) => {
    fileInputRefs.current[type]?.click();
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <h3 className="text-lg font-semibold text-white mb-2">
        Verification Documents
      </h3>
      <p className="text-sm text-zinc-400 mb-6">
        Upload documents to verify your identity and increase your trust level.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {DOCUMENT_TYPES.map(({ type, label, description, acceptedFormats }) => {
          const existing = getExistingDocument(type);
          const isUploading = uploading === type;
          const statusStyle = existing ? STATUS_STYLES[existing.status] : null;

          return (
            <div
              key={type}
              className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{label}</h4>
                    {statusStyle && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{description}</p>

                  {existing?.reviewer_notes && existing.status === 'rejected' && (
                    <p className="text-sm text-red-400 mt-2">
                      Reason: {existing.reviewer_notes}
                    </p>
                  )}
                </div>

                <div className="ml-4">
                  <input
                    ref={el => (fileInputRefs.current[type] = el)}
                    type="file"
                    accept={acceptedFormats}
                    className="hidden"
                    onChange={(e) => handleInputChange(type, e)}
                    disabled={disabled || isUploading}
                  />

                  {existing?.status === 'approved' ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm cursor-not-allowed"
                    >
                      Verified
                    </button>
                  ) : (
                    <button
                      onClick={() => triggerFileInput(type)}
                      disabled={disabled || isUploading}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isUploading
                          ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                          : existing
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {isUploading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Uploading...
                        </span>
                      ) : existing ? (
                        'Re-upload'
                      ) : (
                        'Upload'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Uploaded file info */}
              {existing && (
                <div className="mt-3 pt-3 border-t border-zinc-700 text-xs text-zinc-500">
                  Submitted: {new Date(existing.submitted_at).toLocaleDateString()}
                  {existing.expires_at && (
                    <span className="ml-3">
                      Expires: {new Date(existing.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        All documents are securely stored and reviewed within 24-48 hours.
        Your personal information is protected and never shared.
      </p>
    </div>
  );
}

export default DocumentUploadForm;

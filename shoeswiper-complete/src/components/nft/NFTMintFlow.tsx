import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNFTMarketplace } from "../../hooks/useNFTMarketplace";
import type { NFT, Rarity, NFTSneaker } from "../../lib/types";

// Use NFTSneaker for the closet items (minimal sneaker data)
type Sneaker = NFTSneaker;

interface NFTMintFlowProps {
  onMinted?: (nft: NFT) => void;
}

const steps = [
  "Select sneaker",
  "Upload proof",
  "Rarity tier",
  "Preview & mint",
];

const rarityOptions: { id: Rarity; label: string; description: string }[] = [
  {
    id: "common",
    label: "Common",
    description: "Everyday heat, still verified.",
  },
  {
    id: "rare",
    label: "Rare",
    description: "Limited release, strong story.",
  },
  {
    id: "legendary",
    label: "Legendary",
    description: "Hyped collab or major moment.",
  },
  {
    id: "grail",
    label: "Grail",
    description: "Once-in-a-lifetime sneaker energy.",
  },
];

const NFTMintFlow: React.FC<NFTMintFlowProps> = ({ onMinted }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [closet, setCloset] = useState<Sneaker[]>([]);
  const [loadingCloset, setLoadingCloset] = useState(false);

  const [selectedSneaker, setSelectedSneaker] = useState<Sneaker | null>(null);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [rarity, setRarity] = useState<Rarity>("common");
  const [mintPreviewOpen, setMintPreviewOpen] = useState(false);

  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mintNFT } = useNFTMarketplace();

  useEffect(() => {
    const loadCloset = async () => {
      setLoadingCloset(true);
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError) {
          if (import.meta.env.DEV) {
            console.error(userError);
          }
          return;
        }
        const user = data.user;
        if (!user) return;

        // Example schema: user_sneakers(user_id, sneaker_id) -> sneakers table
        const { data: closetRows, error: closetError } = await supabase
          .from("user_sneakers")
          .select(
            `
            sneaker:shoes (
              id,
              name,
              brand,
              image_url,
              amazon_url
            )
          `
          )
          .eq("user_id", user.id);

        if (closetError) {
          if (import.meta.env.DEV) {
            console.error(closetError);
          }
          return;
        }

        // Supabase returns nested relations as arrays, extract first item
        const sneakers =
          closetRows?.map((row: { sneaker: Sneaker[] | Sneaker }) => {
            const sneaker = Array.isArray(row.sneaker) ? row.sneaker[0] : row.sneaker;
            return sneaker;
          }).filter((s): s is Sneaker => s != null) ?? [];
        setCloset(sneakers);
      } finally {
        setLoadingCloset(false);
      }
    };

    void loadCloset();
  }, []);

  const canGoNext = () => {
    if (currentStep === 0) return !!selectedSneaker;
    if (currentStep === 1) return proofFiles.length > 0;
    if (currentStep === 2) return !!rarity;
    return true;
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setProofFiles(Array.from(e.target.files));
  };

  const handleMint = async () => {
    if (!selectedSneaker) return;
    setIsMinting(true);
    setError(null);
    try {
      const minted = await mintNFT(selectedSneaker.id, proofFiles, rarity);
      setMintPreviewOpen(true);
      onMinted?.(minted);
      // Reset flow
      setCurrentStep(0);
      setSelectedSneaker(null);
      setProofFiles([]);
      setRarity("common");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to mint NFT";
      setError(message);
    } finally {
      setIsMinting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-50">
            Create authenticity NFT
          </h2>
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-slate-400">
            Step {currentStep + 1} / {steps.length}
          </span>
        </div>

        <div className="relative mb-4 flex items-center justify-between">
          {steps.map((label, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div
                key={label}
                className="flex flex-1 items-center last:flex-none"
              >
                <div className="relative flex flex-col items-center gap-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition ${
                      isCompleted
                        ? "border-emerald-400 bg-emerald-400 text-slate-900 shadow-[0_0_16px_rgba(52,211,153,0.9)]"
                        : isActive
                        ? "border-violet-400 bg-slate-900 text-violet-200 shadow-[0_0_14px_rgba(139,92,246,0.7)]"
                        : "border-slate-600/80 bg-slate-900/80 text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {label}
                  </span>
                </div>
                {index !== steps.length - 1 && (
                  <div className="mx-2 h-px flex-1 rounded-full bg-gradient-to-r from-slate-700 via-violet-500/60 to-slate-700" />
                )}
              </div>
            );
          })}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent blur-[1px]" />
        </div>

        <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-900/80">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 shadow-[0_0_25px_rgba(129,140,248,0.9)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100">
          {error}
        </div>
      )}

      {currentStep === 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-50">
            Step 1 — Pick the pair
          </h3>
          {loadingCloset ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-32 animate-pulse rounded-2xl bg-slate-900/60"
                />
              ))}
            </div>
          ) : closet.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-600/70 bg-slate-900/60 px-4 py-6 text-center text-xs text-slate-300/80">
              No sneakers in your closet yet. Minting requires at least one
              sneaker in your ShoeSwiper closet.
            </div>
          ) : (
            <div className="grid max-h-80 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {closet.map((sneaker) => {
                const isSelected = selectedSneaker?.id === sneaker.id;
                return (
                  <button
                    key={sneaker.id}
                    type="button"
                    onClick={() => setSelectedSneaker(sneaker)}
                    className={`group flex flex-col rounded-2xl border p-2.5 text-left transition ${
                      isSelected
                        ? "border-violet-400/80 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/25 to-sky-500/30 shadow-[0_0_24px_rgba(168,85,247,0.8)]"
                        : "border-white/10 bg-slate-900/60 hover:border-violet-400/60 hover:bg-slate-900"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-slate-800/80">
                      <img
                        src={sneaker.image_url ?? "/placeholder-sneaker.png"}
                        alt={sneaker.name}
                        className="h-28 w-full object-cover transition group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-violet-400/40 via-fuchsia-500/30 to-sky-400/40 mix-blend-screen" />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="truncate text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        {sneaker.brand}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-50">
                        {sneaker.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-50">
            Step 2 — Upload authenticity proof
          </h3>
          <p className="text-xs text-slate-300/80">
            Upload a purchase receipt, box label, or detailed photos. Files are
            stored privately in Supabase Storage and linked to this NFT mint.
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-600/80 bg-slate-900/70 px-4 py-6 text-center text-xs text-slate-300/80 hover:border-violet-400/80 hover:bg-slate-900">
            <span className="rounded-full bg-slate-800/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">
              Drop files or click to upload
            </span>
            <span className="text-[11px] text-slate-400">
              Supported: photos (JPG/PNG) or PDFs. Max 10 files.
            </span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleProofChange}
            />
          </label>

          {proofFiles.length > 0 && (
            <div className="space-y-2 rounded-2xl bg-slate-900/80 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Selected files
              </p>
              <ul className="space-y-1 text-xs text-slate-200/90">
                {proofFiles.map((file) => (
                  <li
                    key={file.name + file.lastModified}
                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-800/80 px-3 py-1.5"
                  >
                    <span className="line-clamp-1">{file.name}</span>
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-50">
            Step 3 — Choose rarity tier
          </h3>
          <p className="text-xs text-slate-300/80">
            Rarity tiers help buyers understand how special this pair is. It
            doesn&apos;t affect authenticity — that&apos;s always on-chain.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rarityOptions.map((option) => {
              const isSelected = rarity === option.id;
              let gradient = "";
              if (option.id === "grail") {
                gradient =
                  "from-yellow-300 via-amber-400 to-rose-400 text-slate-900";
              } else if (option.id === "legendary") {
                gradient =
                  "from-fuchsia-400 via-purple-500 to-indigo-500 text-white";
              } else if (option.id === "rare") {
                gradient =
                  "from-sky-400 via-cyan-400 to-emerald-400 text-slate-900";
              } else {
                gradient =
                  "from-slate-200/90 via-slate-100/90 to-slate-200/90 text-slate-900";
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRarity(option.id)}
                  className={`relative flex flex-col rounded-2xl border p-[1px] text-left transition ${
                    isSelected
                      ? "border-violet-300/90 shadow-[0_0_24px_rgba(168,85,247,0.85)]"
                      : "border-transparent hover:border-violet-400/80"
                  }`}
                >
                  <div className="rounded-2xl bg-slate-900/95 p-3">
                    <div
                      className={`inline-flex items-center rounded-full bg-gradient-to-r px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${gradient}`}
                    >
                      {option.label}
                    </div>
                    <p className="mt-2 text-xs text-slate-300/90">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-50">
            Step 4 — Preview & mint
          </h3>
          {selectedSneaker ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1fr)]">
              <div className="relative overflow-hidden rounded-3xl border border-violet-400/60 bg-gradient-to-br from-violet-700/40 via-fuchsia-700/30 to-sky-700/40 p-4 shadow-[0_0_36px_rgba(139,92,246,0.85)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(248,250,252,0.4),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(244,114,182,0.3),transparent_40%),radial-gradient(circle_at_0%_100%,rgba(96,165,250,0.3),transparent_40%)] mix-blend-screen opacity-80" />
                <img
                  src={selectedSneaker.image_url ?? "/placeholder-sneaker.png"}
                  alt={selectedSneaker.name}
                  className="relative mx-auto h-40 w-full max-w-sm rounded-2xl object-cover shadow-[0_0_30px_rgba(15,23,42,0.95)]"
                />
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/30" />
                <div className="mt-4 flex items-center justify-between text-xs text-slate-100">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-200">
                      {selectedSneaker.brand}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {selectedSneaker.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-200">
                      Rarity
                    </p>
                    <p className="mt-1 text-sm font-semibold text-violet-50">
                      {rarityOptions.find((r) => r.id === rarity)?.label ??
                        "Common"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      Authenticity
                    </p>
                    <p className="mt-1 text-xs text-slate-200/90">
                      Proof files linked from Supabase Storage.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/70 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200 shadow-[0_0_16px_rgba(52,211,153,0.8)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                    Verification Ready
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-800/90 p-3 text-xs text-slate-200/90">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Proof files
                  </p>
                  {proofFiles.length === 0 ? (
                    <p className="mt-1 text-slate-400">
                      No files attached. You can still mint, but buyers may
                      prefer NFTs with receipts or detailed photos.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {proofFiles.slice(0, 3).map((file) => (
                        <li
                          key={file.name + file.lastModified}
                          className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/80 px-3 py-1.5"
                        >
                          <span className="line-clamp-1">{file.name}</span>
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </li>
                      ))}
                      {proofFiles.length > 3 && (
                        <li className="text-[11px] text-slate-400">
                          + {proofFiles.length - 3} more file
                          {proofFiles.length - 3 === 1 ? "" : "s"}
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-800/90 p-3 text-xs text-slate-200/90">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Network
                  </p>
                  <p className="mt-1 text-slate-200/80">
                    Mock chain only — this mints into Supabase. When ShoeSwiper
                    adds real Web3, this certificate will be ready to bridge.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-600/70 bg-slate-900/70 px-4 py-6 text-center text-xs text-slate-300/80">
              Go back to Step 1 and pick a sneaker from your closet to preview
              the mint.
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-col items-stretch justify-between gap-3 border-t border-slate-800/90 pt-4 sm:flex-row sm:items-center">
        <div className="text-[11px] text-slate-400">
          <span className="font-semibold text-violet-200">Tip:</span> Minting is
          free while we&apos;re in beta. Gas fees will only apply if/when we
          deploy NFTs on-chain.
        </div>
        <div className="flex justify-end gap-2">
          {currentStep > 0 && (
            <button
              type="button"
              disabled={isMinting}
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              className="rounded-full border border-slate-600/80 bg-slate-900/80 px-4 py-1.5 text-xs font-medium text-slate-100 hover:border-slate-400 hover:bg-slate-900 disabled:opacity-50"
            >
              Back
            </button>
          )}
          {currentStep < steps.length - 1 && (
            <button
              type="button"
              disabled={!canGoNext() || isMinting}
              onClick={() =>
                setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
              }
              className="rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 px-5 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_0_22px_rgba(129,140,248,0.85)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          )}
          {currentStep === steps.length - 1 && (
            <button
              type="button"
              onClick={handleMint}
              disabled={isMinting || !selectedSneaker}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 px-6 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_0_28px_rgba(139,92,246,0.9)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isMinting && (
                <span className="h-3 w-3 animate-spin rounded-full border border-slate-900 border-r-transparent" />
              )}
              {isMinting ? "Minting..." : "Mint NFT"}
            </button>
          )}
        </div>
      </div>

      {mintPreviewOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="w-full max-w-sm rounded-3xl border border-violet-400/80 bg-slate-950/95 p-5 shadow-[0_0_40px_rgba(139,92,246,0.9)]">
            <h4 className="text-sm font-semibold text-slate-50">
              NFT minted successfully 🎉
            </h4>
            <p className="mt-2 text-xs text-slate-300/85">
              Your authenticity certificate is live in the{" "}
              <span className="font-semibold">My NFTs</span> tab. You can now
              list it for sale or just flex it.
            </p>
            <button
              type="button"
              onClick={() => setMintPreviewOpen(false)}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_0_24px_rgba(129,140,248,0.9)]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTMintFlow;

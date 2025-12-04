import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { NFT, Profile } from "../../lib/types";

interface OwnershipHistoryItem {
  id: string;
  nft_id: string;
  from_user: Profile | null;
  to_user: Profile | null;
  price_eth: string | null;
  transferred_at: string;
}

interface NFTDetailModalProps {
  open: boolean;
  nft: NFT | null;
  onClose: () => void;
  onBuy?: (nftId: string) => Promise<void>;
}

const NFTDetailModal: React.FC<NFTDetailModalProps> = ({
  open,
  nft,
  onClose,
  onBuy,
}) => {
  const [history, setHistory] = useState<OwnershipHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      if (!open || !nft?.id) return;
      setLoadingHistory(true);
      try {
        const { data: rows, error } = await supabase
          .from("nft_ownership_history")
          .select(
            "id, nft_id, from_user, to_user, price_eth, transferred_at"
          )
          .eq("nft_id", nft.id)
          .order("transferred_at", { ascending: false });

        if (error) {
          if (import.meta.env.DEV) {
            console.error(error);
          }
          return;
        }

        const rawRows =
          (rows as {
            id: string;
            nft_id: string;
            from_user: string | null;
            to_user: string;
            price_eth: string | null;
            transferred_at: string;
          }[]) ?? [];

        const userIds = Array.from(
          new Set(
            rawRows
              .flatMap((row) => [row.from_user, row.to_user])
              .filter(Boolean) as string[]
          )
        );

        let profilesById: Record<string, Profile> = {};
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", userIds);

          if (profilesError) {
            if (import.meta.env.DEV) {
              console.error(profilesError);
            }
          } else {
            profilesById =
              (profiles as Profile[]).reduce<Record<string, Profile>>(
                (acc, profile) => {
                  acc[profile.id] = profile;
                  return acc;
                },
                {}
              );
          }
        }

        const mapped: OwnershipHistoryItem[] = rawRows.map((row) => ({
          id: row.id,
          nft_id: row.nft_id,
          from_user: row.from_user ? profilesById[row.from_user] ?? null : null,
          to_user: profilesById[row.to_user] ?? null,
          price_eth: row.price_eth,
          transferred_at: row.transferred_at,
        }));

        setHistory(mapped);
      } finally {
        setLoadingHistory(false);
      }
    };

    void loadHistory();
  }, [open, nft?.id]);

  if (!open || !nft) return null;

  const handleBuyClick = async () => {
    if (!onBuy) return;
    setIsBuying(true);
    try {
      await onBuy(nft.id);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error(e);
      }
    } finally {
      setIsBuying(false);
    }
  };

  const formatEth = (value?: string | null) => {
    if (!value) return "—";
    const num = Number(value);
    if (Number.isNaN(num)) return `${value} ETH`;
    return `${num.toFixed(3)} ETH`;
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-xl">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div
        className="relative z-10 w-full max-w-5xl rounded-[32px] border border-violet-400/60 bg-slate-950/95 p-4 text-slate-50 shadow-[0_0_60px_rgba(139,92,246,0.9)] sm:p-6 lg:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -inset-px rounded-[32px] bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-sky-500/30 opacity-40 blur-xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.15fr),minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(248,250,252,0.4),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(244,114,182,0.3),transparent_40%),radial-gradient(circle_at_0%_100%,rgba(96,165,250,0.3),transparent_40%)] mix-blend-screen opacity-80" />
              <div className="pointer-events-none absolute -inset-1 rounded-[30px] border border-white/20" />
              <div className="relative rounded-[24px] bg-slate-900/80 p-4">
                <div className="relative overflow-hidden rounded-[22px] bg-slate-800/80">
                  <img
                    src={nft.sneaker?.image_url ?? "/placeholder-sneaker.png"}
                    alt={nft.sneaker?.name ?? "Sneaker NFT"}
                    className="h-72 w-full object-cover sm:h-80"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(244,114,182,0.3),transparent_40%),linear-gradient(225deg,rgba(56,189,248,0.35),transparent_50%),linear-gradient(45deg,rgba(190,242,100,0.25),transparent_40%)] mix-blend-screen opacity-80" />
                  <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(15,23,42,0.1)_0,rgba(15,23,42,0.1)_1px,transparent_1px,transparent_3px)] opacity-60" />
                  <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-white/40" />

                  <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-100 shadow-[0_0_22px_rgba(15,23,42,0.95)] backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                    Authentic NFT
                  </div>

                  {nft.rarity && (
                    <div className="absolute bottom-4 right-4">
                      <div className="rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                        {nft.rarity.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      {nft.sneaker?.brand ?? "Unknown Brand"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-50">
                      {nft.sneaker?.name ?? "Sneaker NFT"}
                    </p>
                    {nft.token_id && (
                      <p className="mt-1 font-mono text-[11px] text-slate-400">
                        Token ID:{" "}
                        <span className="text-slate-100">{nft.token_id}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/70 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200 shadow-[0_0_16px_rgba(52,211,153,0.8)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                      Verified authenticity
                    </div>
                    {nft.minted_at && (
                      <span className="text-[11px] text-slate-400">
                        Minted{" "}
                        {new Date(nft.minted_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {nft.sneaker?.amazon_url && (
              <a
                href={nft.sneaker.amazon_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs text-sky-300 hover:text-sky-200"
              >
                View deadstock pairs on Amazon
                <span className="text-[10px] text-sky-200/80">
                  (affiliate: shoeswiper-20)
                </span>
              </a>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Current listing
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-sky-300">
                  {nft.for_sale ? formatEth(nft.price_eth) : "Not for sale"}
                </p>
                {nft.for_sale && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Instant settlement in your ShoeSwiper account. No gas fees
                    (mock chain).
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl bg-slate-900/80 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Actions
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={!nft.for_sale || isBuying || !onBuy}
                  onClick={handleBuyClick}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_0_26px_rgba(139,92,246,0.9)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isBuying && (
                    <span className="h-3 w-3 animate-spin rounded-full border border-slate-900 border-r-transparent" />
                  )}
                  {nft.for_sale ? "Buy Now" : "Not for sale"}
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-600/80 bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-slate-100 hover:border-slate-400 hover:bg-slate-900"
                >
                  Place Bid
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                    Soon
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl bg-slate-900/80 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Owner
              </p>
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-violet-300/80 bg-slate-800">
                  {nft.owner?.avatar_url ? (
                    <img
                      src={nft.owner.avatar_url}
                      alt={nft.owner.username ?? "Owner"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-violet-200">
                      {nft.owner?.username?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-100">
                    {nft.owner?.username ?? "Unknown owner"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Current custodian of this NFT
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-2xl bg-slate-900/80 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Ownership history
              </p>
              {loadingHistory ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-10 animate-pulse rounded-xl bg-slate-800/80"
                    />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p className="text-[11px] text-slate-400">
                  No transfers yet. This NFT was just minted.
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/80 px-3 py-2 text-xs"
                    >
                      <div className="flex flex-1 items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="max-w-[110px] truncate text-slate-200">
                            {entry.from_user?.username ?? "Mint"}
                          </span>
                          <span className="text-[10px] text-slate-500">→</span>
                          <span className="max-w-[110px] truncate text-slate-50">
                            {entry.to_user?.username ?? "Unknown"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono text-[11px] text-sky-300">
                          {formatEth(entry.price_eth)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(
                            entry.transferred_at
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetailModal;

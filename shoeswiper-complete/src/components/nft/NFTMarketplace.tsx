import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import NFTMintFlow from "./NFTMintFlow";
import NFTDetailModal from "./NFTDetailModal";
import {
  useNFTMarketplace,
  type NFT,
  type NFTFilter,
} from "../../hooks/useNFTMarketplace";

type Tab = "explore" | "my" | "create";

const tabs: { id: Tab; label: string }[] = [
  { id: "explore", label: "Explore" },
  { id: "my", label: "My NFTs" },
  { id: "create", label: "Create" },
];

const filters: { id: NFTFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "for_sale", label: "For Sale" },
  { id: "auction", label: "Auction" },
  { id: "recent", label: "Recently Minted" },
];

const NFTMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("explore");
  const [activeFilter, setActiveFilter] = useState<NFTFilter>("all");
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  const { nfts, isLoading, error, listNFTs, buyNFT } = useNFTMarketplace();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error(userError);
        return;
      }
      setUserId(data.user?.id ?? null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (activeTab === "my" && !userId) return;

      await listNFTs({
        filter: activeFilter,
        ownerId: activeTab === "my" ? userId ?? undefined : undefined,
      });
    };

    void load();
  }, [activeTab, activeFilter, userId, listNFTs]);

  const handleMinted = (nft: NFT) => {
    setActiveTab("my");
    setActiveFilter("all");
    setSelectedNFT(nft);
  };

  const handleCardClick = (nft: NFT) => {
    setSelectedNFT(nft);
  };

  const handleBuy = async (nftId: string) => {
    try {
      await buyNFT(nftId);
      await listNFTs({
        filter: activeFilter,
        ownerId: activeTab === "my" ? userId ?? undefined : undefined,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatPrice = (nft: NFT) => {
    if (nft.for_sale && nft.price_eth) {
      const num = Number(nft.price_eth);
      if (Number.isNaN(num)) return `${nft.price_eth} ETH`;
      return `${num.toFixed(3)} ETH`;
    }
    return "Not for sale";
  };

  const rarityLabel = (rarity?: NFT["rarity"]) => {
    if (!rarity) return "";
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const rarityColorClasses = (rarity?: NFT["rarity"]) => {
    switch (rarity) {
      case "grail":
        return "from-yellow-400 via-amber-500 to-rose-500 text-slate-900";
      case "legendary":
        return "from-fuchsia-400 via-purple-500 to-indigo-500 text-white";
      case "rare":
        return "from-sky-400 via-cyan-500 to-emerald-500 text-slate-900";
      default:
        return "from-slate-200/80 via-slate-300/80 to-slate-200/80 text-slate-900";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050017] via-[#120826] to-black px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-sky-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              NFT Marketplace
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300/80">
              Mint, flex, and trade sneaker authenticity NFTs. Powered by
              Supabase — blockchain vibes, no wallet required (yet).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-white/5 px-4 py-2 text-xs text-slate-200/80 shadow-inner shadow-purple-500/40 backdrop-blur sm:flex sm:flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300/80">
                Affiliate
              </span>
              <span className="font-mono text-xs text-slate-100">
                shoeswiper-20
              </span>
            </div>
          </div>
        </header>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-full bg-white/5 p-1 shadow-lg shadow-purple-500/40 backdrop-blur">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? "text-slate-900"
                    : "text-slate-300/80 hover:text-white"
                }`}
              >
                {activeTab === tab.id && (
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 shadow-[0_0_25px_rgba(168,85,247,0.7)]" />
                )}
                <span className="relative">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab !== "create" && (
            <div className="flex flex-wrap items-center gap-2 rounded-full bg-white/5 p-1 shadow-inner shadow-purple-500/30 backdrop-blur">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    activeFilter === filter.id
                      ? "bg-gradient-to-r from-violet-500/80 via-fuchsia-500/80 to-sky-500/80 text-slate-900 shadow-[0_0_20px_rgba(139,92,246,0.8)]"
                      : "text-slate-300/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === "create" ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_0_40px_rgba(139,92,246,0.65)] backdrop-blur-xl sm:p-6">
            <NFTMintFlow onMinted={handleMinted} />
          </div>
        ) : (
          <section>
            {error && (
              <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/5"
                  >
                    <div className="h-40 rounded-t-3xl bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-sky-500/20" />
                    <div className="space-y-2 p-4">
                      <div className="h-3 w-2/3 rounded bg-white/10" />
                      <div className="h-3 w-1/3 rounded bg-white/10" />
                      <div className="mt-3 h-3 w-1/2 rounded bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : nfts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-600/60 bg-slate-900/30 px-6 py-16 text-center backdrop-blur">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-sky-500 text-2xl shadow-[0_0_30px_rgba(129,140,248,0.8)]">
                  💎
                </div>
                <h2 className="text-lg font-semibold text-slate-50">
                  No NFTs here yet
                </h2>
                <p className="mt-2 max-w-sm text-sm text-slate-300/75">
                  Mint your first pair in the <span className="font-medium">Create</span> tab, or
                  switch back to <span className="font-medium">Explore</span> to browse the global
                  feed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {nfts.map((nft) => (
                  <button
                    key={nft.id}
                    type="button"
                    onClick={() => handleCardClick(nft)}
                    className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-3 text-left shadow-[0_0_20px_rgba(15,23,42,0.9)] transition-transform transition-shadow hover:-translate-y-1 hover:border-violet-400/80 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(168,85,247,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/80"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-sky-500/30 p-3">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(248,250,252,0.35),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(244,114,182,0.25),transparent_40%),radial-gradient(circle_at_0%_100%,rgba(96,165,250,0.25),transparent_40%)] opacity-60 mix-blend-screen" />
                      <img
                        src={nft.sneaker?.image_url ?? "/placeholder-sneaker.png"}
                        alt={nft.sneaker?.name ?? "Sneaker NFT"}
                        className="relative h-40 w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/20" />

                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200 shadow-[0_0_20px_rgba(15,23,42,0.9)] backdrop-blur">
                        <span className="h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(190,242,100,0.9)]" />
                        NFT
                      </span>

                      {nft.rarity && (
                        <span
                          className={`absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${rarityColorClasses(
                            nft.rarity
                          )}`}
                        >
                          {rarityLabel(nft.rarity)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-1 flex-col gap-2">
                      <div>
                        <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {nft.sneaker?.brand ?? "Unknown Brand"}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-50">
                          {nft.sneaker?.name ?? "Untitled Sneaker NFT"}
                        </p>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-slate-400">Price</span>
                          <span className="font-mono text-sm text-sky-300">
                            {formatPrice(nft)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-violet-300/70 bg-slate-900/80">
                            {nft.owner?.avatar_url ? (
                              <img
                                src={nft.owner.avatar_url}
                                alt={nft.owner.username ?? "Owner"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-violet-200">
                                {nft.owner?.username?.[0]?.toUpperCase() ?? "?"}
                              </div>
                            )}
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] text-slate-400">Owner</span>
                            <span className="max-w-[120px] truncate text-xs text-slate-100/90">
                              {nft.owner?.username ?? "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {nft.minted_at && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          Minted{" "}
                          {new Date(nft.minted_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <NFTDetailModal
          open={!!selectedNFT}
          nft={selectedNFT}
          onClose={() => setSelectedNFT(null)}
          onBuy={handleBuy}
        />
      </div>
    </div>
  );
};

export default NFTMarketplace;

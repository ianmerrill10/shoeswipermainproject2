/**
 * NFT minting, buying, and listing functionality hook.
 * Manages NFT lifecycle including minting from owned sneakers,
 * listing for sale, and purchasing NFTs from other users.
 * 
 * @returns Object containing NFT state and marketplace methods
 * @example
 * const { nfts, mintNFT, buyNFT, listForSale } = useNFTMarketplace();
 * 
 * // Mint a new NFT from a shoe
 * const nft = await mintNFT(shoeId, proofImages, 'rare');
 * 
 * // List an NFT for sale
 * await listForSale(nftId, 0.5); // 0.5 ETH
 * 
 * // Buy an NFT
 * await buyNFT(nftId);
 */

import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { 
  Rarity, 
  NFTFilter, 
  NFT, 
  NFTSneaker, 
  NFTOwnerProfile,
  SupabaseNFTRow 
} from "@/lib/types";

// Re-export types for backward compatibility with components that import from this hook
export type { Rarity, NFTFilter, NFT, NFTSneaker as Sneaker, NFTOwnerProfile as Profile };

interface ListNFTsParams {
  filter?: NFTFilter;
  ownerId?: string;
}

// Helper to transform Supabase nested array response to proper NFT type
const transformNFTRow = (row: SupabaseNFTRow): NFT => {
  const sneaker = Array.isArray(row.sneaker) ? row.sneaker[0] : row.sneaker;
  const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
  
  return {
    id: row.id,
    sneaker_id: row.sneaker_id,
    owner_id: row.owner_id,
    token_id: row.token_id,
    rarity: row.rarity,
    minted_at: row.minted_at,
    for_sale: row.for_sale,
    price_eth: row.price_eth,
    auction_end: row.auction_end,
    sneaker: sneaker ?? null,
    owner: owner ?? null,
  };
};

const uuidv4 = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  const random = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${random()}${random()}-${random()}-${random()}-${random()}-${random()}${random()}${random()}`;
};

export const useNFTMarketplace = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listNFTs = useCallback(
    async (params: ListNFTsParams = {}) => {
      const { filter = "all", ownerId } = params;
      setIsLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("nfts")
          .select(
            `
          id,
          sneaker_id,
          owner_id,
          token_id,
          rarity,
          minted_at,
          for_sale,
          price_eth,
          auction_end,
          sneaker:shoes (
            id,
            name,
            brand,
            image_url,
            amazon_url
          ),
          owner:profiles (
            id,
            username,
            avatar_url
          )
        `
          )
          .order("minted_at", { ascending: false });

        if (ownerId) {
          query = query.eq("owner_id", ownerId);
        }

        if (filter === "for_sale") {
          query = query.eq("for_sale", true);
        } else if (filter === "auction") {
          query = query.not("auction_end", "is", null);
        } else if (filter === "recent") {
          const sevenDaysAgo = new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString();
          query = query.gte("minted_at", sevenDaysAgo);
        }

        const { data, error: queryError } = await query;

        if (queryError) {
          throw queryError;
        }

        const transformed = (data ?? []).map((row) => transformNFTRow(row as SupabaseNFTRow));
        setNfts(transformed);
        setIsLoading(false);
        return transformed;
      } catch (err: unknown) {
        setIsLoading(false);
        const message = err instanceof Error ? err.message : "Failed to load NFTs";
        setError(message);
        throw err;
      }
    },
    []
  );

  const mintNFT = useCallback(
    async (sneakerId: string, proofImages: (File | string)[], rarity: Rarity) => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("You must be logged in to mint an NFT.");

        // Upload authenticity proofs to Supabase Storage (optional metadata)
        const proofUrls: string[] = [];
        for (const [index, item] of proofImages.entries()) {
          if (typeof item === "string") {
            proofUrls.push(item);
          } else {
            const file = item;
            const ext = file.name.split(".").pop() || "jpg";
            const path = `${user.id}/nft-proof-${sneakerId}-${Date.now()}-${index}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from("nft-proofs")
              .upload(path, file, { upsert: true });

            if (uploadError) {
              console.warn("Failed to upload proof file", uploadError);
              continue;
            }

            const { data: publicData } = supabase.storage
              .from("nft-proofs")
              .getPublicUrl(path);
            if (publicData?.publicUrl) {
              proofUrls.push(publicData.publicUrl);
            }
          }
        }

        const tokenId = `SS-${Math.random()
          .toString(36)
          .slice(2, 10)
          .toUpperCase()}`;
        const now = new Date().toISOString();
        const newId = uuidv4();

        const { data: inserted, error: insertError } = await supabase
          .from("nfts")
          .insert({
            id: newId,
            sneaker_id: sneakerId,
            owner_id: user.id,
            token_id: tokenId,
            rarity,
            minted_at: now,
            for_sale: false,
            price_eth: null,
            auction_end: null,
          })
          .select(
            `
          id,
          sneaker_id,
          owner_id,
          token_id,
          rarity,
          minted_at,
          for_sale,
          price_eth,
          auction_end,
          sneaker:shoes (
            id,
            name,
            brand,
            image_url,
            amazon_url
          ),
          owner:profiles (
            id,
            username,
            avatar_url
          )
        `
          )
          .single();

        if (insertError) throw insertError;

        // Initial ownership record (mint)
        const { error: historyError } = await supabase
          .from("nft_ownership_history")
          .insert({
            id: uuidv4(),
            nft_id: newId,
            from_user: null,
            to_user: user.id,
            price_eth: 0,
          });

        if (historyError) {
          console.warn("Failed to insert ownership history", historyError);
        }

        // We don't persist proofUrls in schema here, but they exist in storage
        if (proofUrls.length > 0) {
          if (import.meta.env.DEV) console.warn("Stored proof URLs:", proofUrls);
        }

        const minted = transformNFTRow(inserted as SupabaseNFTRow);
        setNfts((prev) => [minted, ...prev]);
        setIsLoading(false);
        return minted;
      } catch (err: unknown) {
        setIsLoading(false);
        const message = err instanceof Error ? err.message : "Failed to mint NFT";
        setError(message);
        throw err;
      }
    },
    []
  );

  const buyNFT = useCallback(async (nftId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("You must be logged in to buy an NFT.");

      const { data: nftRow, error: fetchError } = await supabase
        .from("nfts")
        .select("*")
        .eq("id", nftId)
        .single();

      if (fetchError) throw fetchError;
      if (!nftRow.for_sale || !nftRow.price_eth) {
        throw new Error("NFT is not for sale.");
      }

      const oldOwnerId: string = nftRow.owner_id;

      const { error: historyError } = await supabase
        .from("nft_ownership_history")
        .insert({
          id: uuidv4(),
          nft_id: nftId,
          from_user: oldOwnerId,
          to_user: user.id,
          price_eth: nftRow.price_eth,
        });

      if (historyError) throw historyError;

      const { data: updated, error: updateError } = await supabase
        .from("nfts")
        .update({
          owner_id: user.id,
          for_sale: false,
          auction_end: null,
        })
        .eq("id", nftId)
        .select(
          `
        id,
        sneaker_id,
        owner_id,
        token_id,
        rarity,
        minted_at,
        for_sale,
        price_eth,
        auction_end,
        sneaker:shoes (
          id,
          name,
          brand,
          image_url,
          amazon_url
        ),
        owner:profiles (
          id,
          username,
          avatar_url
        )
      `
        )
        .single();

      if (updateError) throw updateError;

      const updatedNFT = transformNFTRow(updated as SupabaseNFTRow);
      setNfts((prev) =>
        prev.map((existing) => (existing.id === nftId ? updatedNFT : existing))
      );
      setIsLoading(false);
      return updatedNFT;
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : "Failed to buy NFT";
      setError(message);
      throw err;
    }
  }, []);

  const listForSale = useCallback(async (nftId: string, priceEth: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const priceString = priceEth.toFixed(8);

      const { data: updated, error: updateError } = await supabase
        .from("nfts")
        .update({
          for_sale: true,
          price_eth: priceString,
        })
        .eq("id", nftId)
        .select(
          `
        id,
        sneaker_id,
        owner_id,
        token_id,
        rarity,
        minted_at,
        for_sale,
        price_eth,
        auction_end,
        sneaker:shoes (
          id,
          name,
          brand,
          image_url,
          amazon_url
        ),
        owner:profiles (
          id,
          username,
          avatar_url
        )
      `
        )
        .single();

      if (updateError) throw updateError;

      const updatedNFT = transformNFTRow(updated as SupabaseNFTRow);
      setNfts((prev) =>
        prev.map((existing) => (existing.id === nftId ? updatedNFT : existing))
      );
      setIsLoading(false);
      return updatedNFT;
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : "Failed to list NFT for sale";
      setError(message);
      throw err;
    }
  }, []);

  return {
    nfts,
    isLoading,
    error,
    listNFTs,
    mintNFT,
    buyNFT,
    listForSale,
  };
};

export default useNFTMarketplace;

import { ethosClient } from './ethos-client';

const validatorCache = new Map<string, { isValidator: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a user with the given Ethos profile ID owns a validator NFT
 * The API returns an array of NFTs - non-empty means they are a validator
 */
export async function checkIsValidator(ethosProfileId: number | null): Promise<boolean> {
  if (!ethosProfileId) return false;

  const cacheKey = `validator:${ethosProfileId}`;
  const cached = validatorCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.isValidator;
  }

  const result = await ethosClient.checkOwnsValidator(`profileId:${ethosProfileId}`);
  // API returns an array of validator NFTs - non-empty means validator
  const isValidator = result.ok && Array.isArray(result.data) && result.data.length > 0;

  validatorCache.set(cacheKey, { isValidator, expiresAt: Date.now() + CACHE_TTL_MS });
  return isValidator;
}

/**
 * Check validator status for multiple profile IDs
 */
export async function checkValidatorsBatch(
  ethosProfileIds: number[]
): Promise<Record<number, boolean>> {
  const results: Record<number, boolean> = {};
  const uncachedIds: number[] = [];

  // Check cache first
  for (const profileId of ethosProfileIds) {
    const cacheKey = `validator:${profileId}`;
    const cached = validatorCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      results[profileId] = cached.isValidator;
    } else {
      uncachedIds.push(profileId);
    }
  }

  // Fetch uncached entries in parallel
  if (uncachedIds.length > 0) {
    const promises = uncachedIds.map(async (profileId) => {
      const result = await ethosClient.checkOwnsValidator(`profileId:${profileId}`);
      // API returns an array of validator NFTs - non-empty means validator
      const isValidator = result.ok && Array.isArray(result.data) && result.data.length > 0;

      validatorCache.set(`validator:${profileId}`, {
        isValidator,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return { profileId, isValidator };
    });

    const fetchedResults = await Promise.all(promises);
    for (const { profileId, isValidator } of fetchedResults) {
      results[profileId] = isValidator;
    }
  }

  return results;
}

import type { KbbiEntry } from "../contracts/types";
import { generateRandomId } from "../utils/generateRandomId";

/**
 * Fetch a word description from KBBI (https://kbbi.web.id)
 * @param word - The word to search for
 * @returns A promise that resolves to the word description (string)
 */
export async function getWordDescription(word: string): Promise<string> {
  const randomId = generateRandomId();
  const endpoint = `https://kbbi.web.id/${encodeURIComponent(word)}/ajax_submit${randomId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    // Read response body once as text
    const rawBody = await response.text();

    // Try parsing JSON array
    let data: KbbiEntry[] | null = null;
    try {
      data = JSON.parse(rawBody) as KbbiEntry[];
    } catch {
      // If not JSON, just ignore
    }

    // If valid array and contains descriptions
    if (Array.isArray(data) && data.length > 0) {
      // Combine all descriptions into one string
      return data.map(entry => entry.d).join('\n\n');
    }

    // Fallback: return raw text
    return rawBody.trim() || 'No description found.';
  } catch (error) {
    console.error('Error fetching word description:', error);
    return 'An error occurred while fetching the word description.';
  }
}

// -------------------------------------------------------------
// RPC-style KBBI word checker from the development server
// -------------------------------------------------------------
//
// This function dynamically imports the local server-side
// TypeScript module `checkWordInKBBI.ts` at runtime.
//
// Conceptually, this mimics a Remote Procedure Call (RPC):
//
// - The client does not need to know how the dictionary lookup works.
// - Logic for word validation is shared between server and client.
// - No separate REST or HTTP endpoint is required during development.
//
// This pattern allows you to call server-side logic directly
// while maintaining full TypeScript type safety.
// -------------------------------------------------------------

export const checkWordInKBBIFromServer = async (word: string) => {
  const remoteProcedureUrl =
    "http://localhost:5174/src/procedures/checkWordInKBBI.ts";

  try {
    // `@vite-ignore` prevents Vite from transforming this dynamic import.
    const { checkWordInKBBI } = await import(
      /* @vite-ignore */ remoteProcedureUrl
    );

    // Execute the imported function with the provided word.
    return checkWordInKBBI(word);
  } catch (err) {
    console.error(
      "[RPC Error] Failed to import or execute checkWordInKBBI:",
      err
    );
    // Explicitly return false as a fallback if import or execution fails.
    return false;
  }
};

export default checkWordInKBBIFromServer;

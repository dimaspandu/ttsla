// -------------------------------------------------------------
// RPC-style crossword data retriever from the development server
// -------------------------------------------------------------
//
// This function dynamically loads a TypeScript module from the server
// at runtime to fetch a random crossword puzzle. Conceptually, this
// mimics a Remote Procedure Call (RPC):
//
// - The client does not need to know how the data is generated.
// - It loads and executes a remote TypeScript function dynamically.
// - This allows reusing logic between client and server during
//   development without building a separate HTTP API.
//
export const getRandomCrosswordFromServer = async () => {
  const remoteProcedureUrl =
    "http://localhost:5174/src/procedures/getRandomCrossword.ts";

  // The `@vite-ignore` comment prevents Vite from transforming this path
  // during build, allowing dynamic runtime import instead.
  const { getRandomCrossword } = await import(
    /* @vite-ignore */ remoteProcedureUrl
  );

  // Execute the imported server-side function and return its result.
  return getRandomCrossword();
};

export default getRandomCrosswordFromServer;

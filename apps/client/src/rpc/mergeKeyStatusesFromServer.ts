// -----------------------------------------------------------------------------
// RPC-style function for merging crossword keyboard statuses
// -----------------------------------------------------------------------------
//
// This function dynamically imports the `mergeKeyStatuses` logic from the server
// at runtime. This mimics a Remote Procedure Call (RPC) pattern, allowing the
// client to use the same merging logic as the server without duplicating code.
//
// - Keeps client-side lightweight and consistent with server logic.
// - Simplifies synchronization during rapid prototyping.
//
export const mergeKeyStatusesFromServer = async () => {
  const remoteProcedureUrl =
    "http://localhost:5174/src/procedures/mergeKeyStatuses.ts";

  // Prevent Vite from trying to resolve or pre-bundle the import path
  const { mergeKeyStatuses } = await import(
    /* @vite-ignore */ remoteProcedureUrl
  );

  // Return the imported function for use on the client
  return mergeKeyStatuses;
};

export default mergeKeyStatusesFromServer;

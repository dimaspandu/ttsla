// -----------------------------------------------------------------------------
// RPC-style function for evaluating a crossword guess on the development server
// -----------------------------------------------------------------------------
//
// This function dynamically imports the TypeScript module from the server that
// implements the `evaluateGuess` logic. It mimics an RPC (Remote Procedure Call):
//
// - The client does not directly contain the evaluation logic.
// - Instead, it loads and executes the remote implementation at runtime.
// - This allows reusing TypeScript logic between client and server during
//   development without building a separate HTTP API.
//
export const evaluateGuessFromServer = async () => {
  const remoteProcedureUrl =
    "http://localhost:5174/src/procedures/evaluateGuess.ts";

  // The `@vite-ignore` comment ensures that Vite will not attempt
  // to statically transform or pre-bundle this path.
  const { evaluateGuess } = await import(/* @vite-ignore */ remoteProcedureUrl);

  // Return the imported server-side function so the caller can use it directly.
  return evaluateGuess;
};

export default evaluateGuessFromServer;

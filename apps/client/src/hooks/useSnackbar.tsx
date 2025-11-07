import { useState, useCallback } from "react";
import Snackbar, { type SnackbarVariant } from "~/components/Snackbar";

export function useSnackbar() {
  const [snack, setSnack] = useState<{
    message: string;
    variant: SnackbarVariant;
    key: number;
  } | null>(null);

  const showSnackbar = useCallback(
    (message: string, variant: SnackbarVariant = "info") => {
      setSnack({ message, variant, key: Date.now() });
    },
    []
  );

  const SnackbarContainer = snack ? (
    <Snackbar
      key={snack.key}
      message={snack.message}
      variant={snack.variant}
      onClose={() => setSnack(null)}
    />
  ) : null;

  return { showSnackbar, SnackbarContainer };
}

"use client";

import { useState } from "react";
import { useAdmin } from "./AdminProvider";
import { Button } from "./ui";

export function LoadErrorCard() {
    const { loadError, reload } = useAdmin();
    const [busy, setBusy] = useState(false);
    if (!loadError) return null;
    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            <span>Orders could not be loaded: {loadError}</span>
            <Button
                size="sm"
                loading={busy}
                onClick={async () => {
                    setBusy(true);
                    await reload();
                    setBusy(false);
                }}
            >
                Try again
            </Button>
        </div>
    );
}

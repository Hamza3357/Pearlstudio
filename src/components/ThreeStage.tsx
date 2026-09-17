import { lazy, Suspense, useEffect, useState } from "react";

const ArchitecturalScene = lazy(() => import("./ArchitecturalScene"));

export function ThreeStage({ compact = false }: { compact?: boolean }) {
  const [ready, setReady] = useState(false);
  const [smallScreen, setSmallScreen] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setSmallScreen(query.matches);
    update();
    query.addEventListener("change", update);
    const timer = window.setTimeout(() => setReady(true), 60);
    return () => {
      query.removeEventListener("change", update);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`three-stage ${compact ? "three-stage--compact" : ""}`} aria-hidden="true">
      <div className="three-stage__fallback">
        <span />
        <span />
        <span />
      </div>
      {ready && !smallScreen ? (
        <Suspense fallback={null}>
          <ArchitecturalScene />
        </Suspense>
      ) : null}
    </div>
  );
}
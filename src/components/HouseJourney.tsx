import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { PearlButton } from "@/components/PearlButton";

const HouseJourneyScene = lazy(() => import("./HouseJourneyScene"));

const stageFor = (p: number) => (p < 0.18 ? 0 : p < 0.55 ? 1 : p < 0.8 ? 2 : 3);

export function HouseJourney() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 767px)").matches);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const t = window.setTimeout(() => setReady(true), 60);
    const onScroll = () => {
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / span));
      progress.current = p;
      setStage((s) => (stageFor(p) === s ? s : stageFor(p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={section} className={`journey ${reduced ? "journey--static" : ""}`} data-stage={stage}>
      <div className="journey__sticky">
        <div className="journey__canvas" aria-hidden="true">
          {ready && !reduced ? (
            <Suspense fallback={null}>
              <HouseJourneyScene progress={progress} mobile={mobile} />
            </Suspense>
          ) : null}
        </div>
        <div className="journey__shade" aria-hidden="true" />

        <div className="journey__panel journey__panel--0">
          <span className="journey__eyebrow">Pearl Studio / Architecture / Construction / Design</span>
          <h1>We build<br /><em>what endures.</em></h1>
          <p>Architecture, construction and spaces designed with precision.</p>
          <div className="journey__ctas">
            <PearlButton to="/projects" tone="light">Explore our work</PearlButton>
            <PearlButton to="/contact" tone="outline">Start a project</PearlButton>
          </div>
        </div>

        <div className="journey__panel journey__panel--1" aria-hidden={stage !== 1}>
          <span className="journey__eyebrow">Threshold / 02</span>
          <h2>Enter<br /><em>the home.</em></h2>
        </div>

        <div className="journey__panel journey__panel--2" aria-hidden={stage !== 2}>
          <span className="journey__eyebrow">Interior / 03</span>
          <h2>Light, material,<br /><em>proportion.</em></h2>
        </div>

        <div className="journey__panel journey__panel--3" aria-hidden={stage !== 3}>
          <span className="journey__eyebrow">Interior Design</span>
          <h2>Spaces designed around<br /><em>the way you live.</em></h2>
          <PearlButton to="/services" tone="light">Explore interiors</PearlButton>
        </div>

        <div className="journey__progress" aria-hidden="true">
          {["Exterior", "Entrance", "Interior", "Living"].map((l, i) => (
            <span key={l} className={stage >= i ? "is-on" : ""}>0{i + 1} {l}</span>
          ))}
        </div>
        <div className="journey__hint" aria-hidden="true">Scroll to enter</div>
      </div>
    </section>
  );
}

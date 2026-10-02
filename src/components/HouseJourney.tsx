import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { InteriorReel } from "@/components/InteriorReel";
import { PearlButton } from "@/components/PearlButton";

const HouseJourneyScene = lazy(() => import("./HouseJourneyScene"));

// Stages: exterior, entrance (3D), then the render walkthrough: living, kitchen, bedroom, dressing.
const stageFor = (p: number) =>
  p < 0.1 ? 0 : p < 0.265 ? 1 : p < 0.53 ? 2 : p < 0.755 ? 3 : p < 0.895 ? 4 : 5;

export function HouseJourney() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const exterior = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [inside, setInside] = useState(false);

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
      setInside(p > 0.3);
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
        <div ref={exterior} className="journey__canvas" aria-hidden="true">
          {ready && !reduced ? (
            <Suspense fallback={null}>
              <HouseJourneyScene progress={progress} mobile={mobile} paused={inside} />
            </Suspense>
          ) : null}
        </div>
        {ready && !reduced ? <InteriorReel progress={progress} exterior={exterior} /> : null}
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
          <span className="journey__eyebrow">Living / 03</span>
          <h2>Light, material,<br /><em>proportion.</em></h2>
        </div>

        <div className="journey__panel journey__panel--3" aria-hidden={stage !== 3}>
          <span className="journey__eyebrow">Kitchen / 04</span>
          <h2>From bare shell<br /><em>to finished home.</em></h2>
        </div>

        <div className="journey__panel journey__panel--4" aria-hidden={stage !== 4}>
          <span className="journey__eyebrow">Bedroom / 05</span>
          <h2>Quiet, tailored<br /><em>retreats.</em></h2>
        </div>

        <div className="journey__panel journey__panel--5" aria-hidden={stage !== 5}>
          <span className="journey__eyebrow">Interior Design</span>
          <h2>Spaces designed around<br /><em>the way you live.</em></h2>
          <PearlButton to="/services" tone="light">Explore interiors</PearlButton>
        </div>

        <div className="journey__progress" aria-hidden="true">
          {["Exterior", "Entrance", "Living", "Kitchen", "Bedroom", "Dressing"].map((l, i) => (
            <span key={l} className={stage >= i ? "is-on" : ""}>0{i + 1} {l}</span>
          ))}
        </div>
        <div className="journey__hint" aria-hidden="true">Scroll to enter</div>
      </div>
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import monumentHouse from "@/assets/monument-house.jpg";
import courtyardVilla from "@/assets/courtyard-villa.jpg";
import { PearlButton } from "@/components/PearlButton";
import { SectionHeading } from "@/components/SectionHeading";
import { ThreeStage } from "@/components/ThreeStage";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About Pearl Studio — Built on Precision" },
    { name: "description", content: "Discover Pearl Studio’s philosophy: exacting architecture, reliable construction and long-term value shaped through one integrated practice." },
    { property: "og:title", content: "About Pearl Studio — Built on Precision" },
    { property: "og:description", content: "An integrated architecture and construction practice founded on precision, purpose and permanence." },
    { property: "og:type", content: "website" }, { property: "og:url", content: "/about" }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "/about" }] }),
  component: AboutPage,
});

function AboutPage() {
  return <>
    <section className="subpage-hero subpage-hero--visual">
      <div className="subpage-hero__copy"><span>About / 01</span><h1>Built on<br /><em>precision.</em></h1><p>We bring the logic of engineering and the sensitivity of design into one exacting practice.</p></div>
      <div className="subpage-hero__media"><img src={monumentHouse} alt="Monument House with concrete planes and bronze screens at dusk" width={1200} height={1504} /><div className="subpage-hero__scene"><ThreeStage compact /></div></div>
    </section>
    <section className="story-section">
      <SectionHeading index="01" eyebrow="Our story" title="The detail is the building." />
      <div className="story-section__body"><p>Pearl Studio was imagined as a practice without the usual divide between design intent and construction reality.</p><p>Architecture, engineering and execution are considered together. That continuity lets us protect the essential idea while resolving the thousand decisions that make a building endure.</p></div>
    </section>
    <section className="principles">
      {[["01","Precision","Every dimension, junction and material decision is examined with care."],["02","Purpose","Beauty follows clarity. Each space begins with how it must live and perform."],["03","Permanence","We choose systems and materials that gain character rather than simply age."]].map(([n,t,p]) => <article key={n}><span>{n}</span><h2>{t}</h2><p>{p}</p></article>)}
    </section>
    <section className="process-section">
      <SectionHeading index="02" eyebrow="Process" title="From question to built form." />
      <div className="process-track">{["Discover","Design","Engineer","Build","Deliver"].map((step,index) => <div key={step}><span>0{index+1}</span><h3>{step}</h3><p>{["Context, ambition and constraints.","Concept, space and material.","Systems, detail and certainty.","Craft, coordination and control.","Handover, review and continuity."][index]}</p></div>)}</div>
    </section>
    <section className="expertise-section"><div><span>Collective expertise</span><h2>Many disciplines.<br /><em>One standard.</em></h2><p>Our project teams bring together the right voices from the outset, creating fewer gaps between ambition and delivery.</p><PearlButton to="/contact" tone="light">Work with us</PearlButton></div><img src={courtyardVilla} alt="A serene travertine courtyard centered around a mature tree" width={1200} height={1504} loading="lazy" /><ul>{["Architects","Engineers","Project managers","Designers","Craftsmen"].map((role,index)=><li key={role}><span>0{index+1}</span>{role}</li>)}</ul></section>
  </>;
}
import { createFileRoute } from "@tanstack/react-router";
import { PearlButton } from "@/components/PearlButton";
import { SectionHeading } from "@/components/SectionHeading";
import { ThreeStage } from "@/components/ThreeStage";
import { projects, services } from "@/lib/pearl-data";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pearl Studio — Architecture, Construction & Design" },
      { name: "description", content: "Pearl Studio creates refined architectural spaces through thoughtful design, precision construction and uncompromising attention to detail." },
      { property: "og:title", content: "Pearl Studio — Architecture, Construction & Design" },
      { property: "og:description", content: "Refined architectural spaces shaped through design, precision construction and enduring detail." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "ProfessionalService", name: "Pearl Studio", description: "Architecture, construction and interior design studio.", areaServed: "Pakistan" }) }],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const featured = projects[0];
  return (
    <>
      <section className="home-hero">
        <ThreeStage />
        <div className="home-hero__measure" aria-hidden="true">ELEV. 01 / 33.6844° N</div>
        <div className="home-hero__label"><span>Pearl Studio</span><span>Architecture / Construction / Design</span></div>
        <div className="home-hero__title"><h1>We build<br /><em>what endures.</em></h1></div>
        <div className="home-hero__footer">
          <p>Architecture, construction and spaces<br />designed with precision.</p>
          <div><PearlButton to="/projects" tone="light">Explore our work</PearlButton><PearlButton to="/contact" tone="outline">Start a project</PearlButton></div>
        </div>
      </section>

      <section className="home-intro">
        <div className="home-intro__index">01 / Studio</div>
        <h2>Built with precision.<br /><em>Designed with purpose.</em></h2>
        <p>Pearl Studio unites architecture, construction and interior design under one disciplined process. We create spaces of lasting value—resolved from the first line to the final detail.</p>
      </section>

      <section className="featured-project">
        <SectionHeading index="02" eyebrow="Featured project" title="A residence shaped by light." />
        <button className="featured-project__image" type="button" aria-label="View The Pearl Residence in projects">
          <img src={featured.image} alt="The Pearl Residence, a contemporary limestone home with a reflecting pool" width={featured.width} height={featured.height} loading="lazy" />
          <span className="featured-project__tag">Project 01</span>
        </button>
        <div className="featured-project__meta">
          <div><span>Project</span><strong>The Pearl Residence</strong></div>
          <div><span>Location</span><strong>Islamabad, Pakistan</strong></div>
          <div><span>Category</span><strong>Residential Architecture</strong></div>
          <PearlButton to="/projects" tone="outline">View project</PearlButton>
        </div>
      </section>

      <section className="services-preview">
        <SectionHeading index="03" eyebrow="Capabilities" title="One studio. Every stage." />
        <div className="services-preview__list">
          {services.map((service) => <a key={service.number} href="/services"><span>{service.number}</span><h3>{service.title}</h3><p>{service.summary}</p><b aria-hidden="true">↗</b></a>)}
        </div>
      </section>

      <section className="stats-band" aria-label="Studio figures, placeholder values">
        {[['15+','Years of experience'],['120+','Projects delivered'],['08','Cities'],['01','Standard of excellence']].map(([value,label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        <small>Illustrative figures — replace with verified studio data.</small>
      </section>

      <section className="final-cta">
        <span>Begin a conversation</span>
        <h2>Let’s build something<br /><em>worth remembering.</em></h2>
        <PearlButton to="/contact" tone="dark">Start a project</PearlButton>
      </section>
    </>
  );
}

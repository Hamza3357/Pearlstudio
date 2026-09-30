import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import { ThreeStage } from "@/components/ThreeStage";
import { PearlButton } from "@/components/PearlButton";
import { services, projects } from "@/lib/pearl-data";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [
    { title: "Architecture & Construction Services — Pearl Studio" },
    { name: "description", content: "Integrated architecture, construction, interior design and project management from Pearl Studio." },
    { property: "og:title", content: "Architecture & Construction Services — Pearl Studio" },
    { property: "og:description", content: "From first idea to built form: four integrated capabilities, one exacting standard." },
    { property: "og:type", content: "website" }, { property: "og:url", content: "/services" }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "/services" }] }),
  component: ServicesPage,
});

function ServicesPage() {
  return <>
    <section className="services-hero"><ThreeStage /><div><span>Capabilities / 04</span><h1>From idea<br /><em>to built form.</em></h1><p>A complete design and delivery practice, aligned around one clear architectural vision.</p></div></section>
    <section className="services-intro"><SectionHeading index="01" eyebrow="Our capabilities" title="Continuity creates quality." /><p>Our integrated approach reduces the distance between the drawing and the building. The same commitment to proportion, performance and detail carries through every stage.</p></section>
    <section className="service-bands">{services.map((service,index) => <article key={service.number} className="service-band"><div className="service-band__number">{service.number}</div><div className="service-band__title"><h2>{service.title}</h2><p>{service.summary}</p></div><img src={projects[index+1]!.image} alt={`${service.title} by Pearl Studio`} width={projects[index+1]!.width} height={projects[index+1]!.height} loading="lazy" /><ul>{service.items.map(item=><li key={item}>{item}</li>)}</ul></article>)}</section>
    <section className="services-close"><span>Integrated delivery</span><h2>One accountable team.<br /><em>One resolved outcome.</em></h2><PearlButton to="/contact" tone="dark">Discuss your project</PearlButton></section>
  </>;
}
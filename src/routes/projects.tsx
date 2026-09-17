import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { projects, type Project, type ProjectCategory } from "@/lib/pearl-data";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [
    { title: "Selected Works — Pearl Studio" },
    { name: "description", content: "Explore selected residential, commercial and interior projects by Pearl Studio." },
    { property: "og:title", content: "Selected Works — Pearl Studio" },
    { property: "og:description", content: "Architecture and interiors shaped by context, craft and lasting value." },
    { property: "og:type", content: "website" }, { property: "og:url", content: "/projects" }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "/projects" }] }),
  component: ProjectsPage,
});

const filters: Array<"All" | ProjectCategory> = ["All", "Residential", "Commercial", "Interiors"];

function ProjectsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const shown = filter === "All" ? projects : projects.filter((project)=>project.category===filter || (filter === "Interiors" && project.services.includes("Interior")));
  useEffect(()=>{ document.body.style.overflow = selected ? "hidden" : ""; return ()=>{document.body.style.overflow="";} },[selected]);
  useEffect(()=>{ if (!selected) return; const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape") setSelected(null)}; window.addEventListener("keydown",onKey); return()=>window.removeEventListener("keydown",onKey)},[selected]);
  return <>
    <section className="projects-hero"><span>Portfolio / 03</span><h1>Selected<br /><em>works.</em></h1><p>Projects shaped by context, proportion and the discipline to resolve every detail.</p><div className="projects-hero__line" /></section>
    <section className="project-browser">
      <div className="project-filters" role="group" aria-label="Filter projects">{filters.map(item=><button key={item} type="button" onClick={()=>setFilter(item)} className={filter===item?"is-active":""}>{item}</button>)}</div>
      <div className="project-grid">{shown.map((project,index)=><button type="button" className={`project-card project-card--${index%4}`} key={project.id} onClick={()=>setSelected(project)}><div className="project-card__image"><img src={project.image} alt={`${project.name}, ${project.category.toLowerCase()} project`} width={project.width} height={project.height} loading={index<2?"eager":"lazy"} /></div><div className="project-card__meta"><span>{project.number}</span><h2>{project.name}</h2><p>{project.category} / {project.location}</p><b aria-hidden="true">View ↗</b></div></button>)}</div>
    </section>
    {selected ? <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-title"><button type="button" className="project-modal__close" onClick={()=>setSelected(null)} aria-label="Close project details"><X aria-hidden="true" /></button><div className="project-modal__image"><img src={selected.image} alt={`${selected.name} architectural view`} width={selected.width} height={selected.height} /></div><div className="project-modal__body"><span>Project {selected.number}</span><h2 id="project-title">{selected.name}</h2><p>{selected.description}</p><dl><div><dt>Location</dt><dd>{selected.location}</dd></div><div><dt>Year</dt><dd>{selected.year}</dd></div><div><dt>Category</dt><dd>{selected.category}</dd></div><div><dt>Services</dt><dd>{selected.services}</dd></div></dl><small>Project information is illustrative placeholder content.</small></div></div> : null}
  </>;
}
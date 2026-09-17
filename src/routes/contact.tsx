import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ThreeStage } from "@/components/ThreeStage";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Start a Project — Pearl Studio" },
    { name: "description", content: "Tell Pearl Studio what you are building. Start a conversation about architecture, construction, interiors or project delivery." },
    { property: "og:title", content: "Start a Project — Pearl Studio" },
    { property: "og:description", content: "Tell us what you are building. We will help turn the idea into something real." },
    { property: "og:type", content: "website" }, { property: "og:url", content: "/contact" }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "/contact" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true); }
  return <>
    <section className="contact-hero"><ThreeStage compact /><div><span>Contact / 05</span><h1>Have a project<br /><em>in mind?</em></h1><p>Tell us what you’re building. We’ll help you turn the idea into something real.</p></div></section>
    <section className="contact-layout">
      <aside><span>Direct enquiries</span><div><small>Email</small><a href="mailto:studio@pearlstudio.example">studio@pearlstudio.example</a></div><div><small>Phone</small><a href="tel:+920000000000">+92 000 000 0000</a></div><div><small>Studio</small><p>Islamabad, Pakistan</p></div><div><small>Office hours</small><p>Monday—Friday / 09:00—18:00</p></div><em>Contact details are placeholders.</em></aside>
      {submitted ? <div className="form-success" role="status"><span><Check aria-hidden="true" /></span><small>Inquiry received</small><h2>Thank you.<br /><em>We’ll be in touch.</em></h2><p>This demonstration has not sent a message. Connect a delivery service before launch.</p><button type="button" onClick={()=>setSubmitted(false)}>Send another inquiry</button></div> :
      <form className="contact-form" onSubmit={submit}>
        <h2>Project enquiry</h2>
        <div className="form-grid">
          <label><span>Name *</span><input required name="name" autoComplete="name" placeholder="Your name" /></label>
          <label><span>Email *</span><input required type="email" name="email" autoComplete="email" placeholder="you@company.com" /></label>
          <label><span>Phone</span><input type="tel" name="phone" autoComplete="tel" placeholder="+92" /></label>
          <label><span>Company</span><input name="company" autoComplete="organization" placeholder="Studio or company" /></label>
          <label><span>Project type *</span><select required name="projectType" defaultValue=""><option value="" disabled>Select a type</option><option>Residential</option><option>Commercial</option><option>Interior</option><option>Other</option></select></label>
          <label><span>Estimated budget</span><select name="budget" defaultValue=""><option value="" disabled>Select a range</option><option>Under PKR 25M</option><option>PKR 25M—75M</option><option>PKR 75M—200M</option><option>PKR 200M+</option></select></label>
          <label className="form-grid__wide"><span>Tell us about the project *</span><textarea required name="message" rows={5} placeholder="Location, scope, ambition and intended timeline" /></label>
        </div>
        <button className="submit-button" type="submit"><span>Send project inquiry</span><b aria-hidden="true">↗</b></button>
      </form>}
    </section>
  </>;
}
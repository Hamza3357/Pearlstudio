import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { navItems } from "@/lib/pearl-data";

function Header() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
        <Link to="/" className="brand-mark" aria-label="Pearl Studio home">
          <span className="brand-mark__pearl" aria-hidden="true" />
          <span>PEARL STUDIO</span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={pathname === item.to ? "is-active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link to="/contact" className="header-cta">
          Start a project <ArrowUpRight aria-hidden="true" size={14} />
        </Link>
        <button className="menu-trigger" type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
          <Menu aria-hidden="true" size={22} />
        </button>
      </header>
      <div className={`mobile-menu ${open ? "mobile-menu--open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu__top">
          <span>PEARL STUDIO</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
            <X aria-hidden="true" size={24} />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {navItems.map((item, index) => (
            <Link key={item.to} to={item.to} tabIndex={open ? 0 : -1}>
              <small>0{index + 1}</small>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <p>Architecture / Construction / Design</p>
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__lead">
        <p>Architecture. Construction.<br />Designed to endure.</p>
        <span className="brand-mark__pearl" aria-hidden="true" />
      </div>
      <div className="site-footer__grid">
        <div>
          <span className="footer-label">Navigate</span>
          {navItems.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}
        </div>
        <div>
          <span className="footer-label">Enquiries</span>
          <a href="mailto:studio@pearlstudio.example">studio@pearlstudio.example</a>
          <a href="tel:+920000000000">+92 000 000 0000</a>
          <span>Islamabad, Pakistan</span>
        </div>
        <div>
          <span className="footer-label">Follow</span>
          <a href="#instagram">Instagram</a>
          <a href="#linkedin">LinkedIn</a>
        </div>
      </div>
      <div className="site-footer__base">
        <span>© {new Date().getFullYear()} Pearl Studio</span>
        <span>33.6844° N / 73.0479° E</span>
        <span>Details marked as placeholders</span>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <Header />
      <main className="page-enter">{children}</main>
      <Footer />
    </div>
  );
}
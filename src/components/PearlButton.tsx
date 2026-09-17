import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type AppPath = "/" | "/about" | "/projects" | "/services" | "/contact";

export function PearlButton({
  to,
  children,
  tone = "light",
}: {
  to: AppPath;
  children: ReactNode;
  tone?: "light" | "dark" | "outline";
}) {
  return (
    <Link to={to} className={`pearl-button pearl-button--${tone}`}>
      <span>{children}</span>
      <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
    </Link>
  );
}
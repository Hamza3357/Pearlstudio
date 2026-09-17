import pearlResidence from "@/assets/pearl-residence.jpg";
import monumentHouse from "@/assets/monument-house.jpg";
import horizonOffices from "@/assets/horizon-offices.jpg";
import courtyardVilla from "@/assets/courtyard-villa.jpg";
import atrium from "@/assets/atrium.jpg";
import stoneHouse from "@/assets/stone-house.jpg";

export type ProjectCategory = "Residential" | "Commercial" | "Interiors";

export type Project = {
  id: string;
  number: string;
  name: string;
  category: ProjectCategory;
  location: string;
  year: string;
  services: string;
  description: string;
  image: string;
  width: number;
  height: number;
};

export const projects: Project[] = [
  {
    id: "pearl-residence",
    number: "01",
    name: "The Pearl Residence",
    category: "Residential",
    location: "Islamabad, Pakistan",
    year: "2026",
    services: "Architecture · Construction",
    description:
      "A study in light, mass and permanence. Deep limestone volumes frame a quiet sequence of water, landscape and interior space.",
    image: pearlResidence,
    width: 1600,
    height: 1104,
  },
  {
    id: "monument-house",
    number: "02",
    name: "Monument House",
    category: "Residential",
    location: "Margalla Hills, Pakistan",
    year: "2025",
    services: "Architecture · Interiors",
    description:
      "Monumental concrete planes and finely perforated bronze screens create a home that feels protective, calm and open to its terrain.",
    image: monumentHouse,
    width: 1200,
    height: 1504,
  },
  {
    id: "horizon-offices",
    number: "03",
    name: "Horizon Offices",
    category: "Commercial",
    location: "Lahore, Pakistan",
    year: "2025",
    services: "Architecture · Project Management",
    description:
      "A disciplined structural rhythm gives this workplace clarity, daylight and a quietly confident civic presence.",
    image: horizonOffices,
    width: 1504,
    height: 1104,
  },
  {
    id: "courtyard-villa",
    number: "04",
    name: "Courtyard Villa",
    category: "Residential",
    location: "Karachi, Pakistan",
    year: "2024",
    services: "Architecture · Interior Design",
    description:
      "A shaded garden and reflecting court organize daily life around nature, tactility and the changing quality of light.",
    image: courtyardVilla,
    width: 1200,
    height: 1504,
  },
  {
    id: "the-atrium",
    number: "05",
    name: "The Atrium",
    category: "Commercial",
    location: "Islamabad, Pakistan",
    year: "2024",
    services: "Interior Design · Construction",
    description:
      "A generous public interior shaped by structure, daylight and stone—designed to make movement through the building intuitive.",
    image: atrium,
    width: 1504,
    height: 1104,
  },
  {
    id: "stone-house",
    number: "06",
    name: "Stone House",
    category: "Residential",
    location: "Northern Pakistan",
    year: "2023",
    services: "Architecture · Construction",
    description:
      "Local stone, dark steel and glass form a measured retreat that belongs to the mountain rather than competing with it.",
    image: stoneHouse,
    width: 1200,
    height: 1504,
  },
];

export const services = [
  {
    number: "01",
    title: "Architecture",
    summary: "From first sketch to resolved built form, we shape coherent, enduring spaces.",
    items: ["Concept development", "Architectural design", "Planning", "Technical drawings", "Design development"],
  },
  {
    number: "02",
    title: "Construction",
    summary: "Disciplined execution, precise coordination and uncompromising control on site.",
    items: ["Structural execution", "Site management", "Material coordination", "Quality control", "Construction management"],
  },
  {
    number: "03",
    title: "Interior Design",
    summary: "Interiors composed through proportion, material, light and the rituals of daily life.",
    items: ["Material selection", "Space planning", "Furniture coordination", "Lighting", "Finishing"],
  },
  {
    number: "04",
    title: "Project Management",
    summary: "Clear oversight from programme and budget through coordination and final delivery.",
    items: ["Planning", "Budget coordination", "Scheduling", "Contractor coordination", "Quality assurance"],
  },
];

export const navItems = [
  { label: "Home", to: "/" as const },
  { label: "About", to: "/about" as const },
  { label: "Projects", to: "/projects" as const },
  { label: "Services", to: "/services" as const },
  { label: "Contact", to: "/contact" as const },
];
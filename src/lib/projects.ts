export type ProjectCategory = "cad" | "philosophy";

export interface ProjectItem {
  id: string;
  title: string;
  shortTitle: string;
  url: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  categoryLabel: string;
  tags: string[];
  highlights: string[];
  featured?: boolean;
}

export const projectCategories: { key: "all" | ProjectCategory; label: string }[] = [
  { key: "all", label: "All Projects" },
  { key: "cad", label: "Engineering & CAD" },
  { key: "philosophy", label: "Wisdom & Philosophy" },
];

export const projects: ProjectItem[] = [
  {
    id: "cadguide",
    title: "CAD Guide & Productivity Toolkit",
    shortTitle: "CAD Guide & Tools",
    url: "https://cadguide.tools/",
    tagline: "Essential Drafting Utilities, Command Shortcuts & Workflow Boosters",
    description:
      "An indispensable reference hub and utility toolkit engineered for professional CAD operators, drafters, and architects. Features instant command lookups, AutoLISP script collections, hatch patterns, and drafting standards to accelerate computer-aided engineering workflows.",
    category: "cad",
    categoryLabel: "Engineering & CAD",
    tags: ["CAD Utilities", "AutoLISP", "Drafting Shortcuts", "Engineering Workflow", "Design Automation"],
    highlights: [
      "Fast searchable command matrix and keyboard shortcuts for AutoCAD & GstarCAD",
      "Curated AutoLISP scripts and productivity routines for batch drawing tasks",
      "Standard drafting guidelines, layer setups, and dimensioning best practices",
    ],
    featured: true,
  },
  {
    id: "gstarcademy",
    title: "Gstarcademy — CAD Learning & Mastery Hub",
    shortTitle: "Gstarcademy",
    url: "https://gstarcademy.com/",
    tagline: "Comprehensive CAD Education, Masterclasses & Practical Tutorials",
    description:
      "A dedicated online learning academy built to help engineers, students, and design studios master computer-aided design from the ground up. Offers structured modular courses, real-world drafting exercises, and professional certification preparation.",
    category: "cad",
    categoryLabel: "Engineering & CAD",
    tags: ["CAD E-Learning", "Online Courses", "Drafting Masterclasses", "Engineering Education", "Skill Building"],
    highlights: [
      "Structured learning paths from drafting fundamentals to advanced 2D/3D modeling",
      "Hands-on architectural and mechanical design project walkthroughs",
      "Interactive knowledge base with downloadable sample DWG drawing exercises",
    ],
    featured: true,
  },
  {
    id: "ramanamaharshi",
    title: "Sri Ramana Maharshi Wisdom Archive",
    shortTitle: "Ramana Maharshi Archive",
    url: "https://ramanamaharshi.space/",
    tagline: "Digital Sanctuary for Non-Dual Wisdom, Self-Enquiry & Contemplation",
    description:
      "A rich digital library and contemplative repository dedicated to the timeless teachings of Sri Ramana Maharshi and classical Advaita Vedanta. Provides digitized original texts, clear explanations of Self-Enquiry ('Who am I?'), and peaceful reading environments.",
    category: "philosophy",
    categoryLabel: "Wisdom & Philosophy",
    tags: ["Advaita Vedanta", "Self-Enquiry", "Spiritual Archive", "Non-Duality", "Mindfulness"],
    highlights: [
      "Searchable digital library of canonical Advaita dialogues and original teachings",
      "In-depth guides on the direct path of Self-Enquiry (Nan Yar? / Who am I?)",
      "Clean, accessible, and distraction-free typography crafted for deep contemplation",
    ],
    featured: true,
  },
  {
    id: "chanzong",
    title: "Chanzong (Zen) Heritage Portal",
    shortTitle: "Chanzong Zen Portal",
    url: "https://chanzong.space/",
    tagline: "Classical Zen Buddhism, Koan Archives & Eastern Contemplative Thought",
    description:
      "A digital humanities platform preserving and presenting the living heritage of Chan (Zen) Buddhism. Brings together patriarch treatises, classic koan (Gong'an) collections, and insightful commentaries for modern seekers of inner clarity and philosophical depth.",
    category: "philosophy",
    categoryLabel: "Wisdom & Philosophy",
    tags: ["Zen Buddhism", "Koan Archive", "Eastern Philosophy", "Contemplative Study", "Digital Humanities"],
    highlights: [
      "Digitized historical Zen records, lineage genealogies, and patriarch commentaries",
      "Curated koan collections with scholarly annotations and historical context",
      "Thoughtfully designed digital reading environment honoring ancient wisdom",
    ],
    featured: true,
  },
];

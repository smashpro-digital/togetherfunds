export type Product = {
  id: string;
  name: string;
  ritual: string;
  price: number;
  description: string;
  ingredients: string[];
  benefits: string[];
};

export type Service = {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  includes: string[];
};

export type MembershipPlan = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  perks: string[];
};

export const products: Product[] = [
  {
    id: "botanical-veil",
    name: "Botanical Veil Serum",
    ritual: "Morning Renewal",
    price: 68,
    description: "A lightweight botanical serum for calm, hydrated skin.",
    ingredients: ["aloe", "green tea", "rosehip", "blue tansy"],
    benefits: ["softens texture", "supports glow", "calms visible stress"]
  },
  {
    id: "mineral-soak",
    name: "Mineral Reset Soak",
    ritual: "Evening Recovery",
    price: 42,
    description: "A restorative soak blended for post-service decompression.",
    ingredients: ["magnesium", "sea salt", "lavender", "chamomile"],
    benefits: ["eases tension", "supports rest", "grounds the body"]
  },
  {
    id: "lymphatic-oil",
    name: "Lymphatic Body Oil",
    ritual: "Body Balance",
    price: 56,
    description: "A silky body oil for slow massage and intentional care.",
    ingredients: ["jojoba", "grapefruit", "cypress", "calendula"],
    benefits: ["nourishes skin", "encourages massage", "finishes softly"]
  }
];

export const bundles: Product[] = [
  {
    id: "restore-within",
    name: "Restore From Within Set",
    ritual: "Full Reset",
    price: 138,
    description: "A complete ritual pairing serum, soak, and body oil.",
    ingredients: ["botanical serum", "mineral soak", "body oil"],
    benefits: ["complete ritual", "balanced routine", "premium gifting"]
  },
  {
    id: "detox-ritual",
    name: "Detox Ritual Kit",
    ritual: "Service Companion",
    price: 92,
    description: "Designed to extend the foot detox ritual at home.",
    ingredients: ["mineral soak", "dry brush", "hydration guide"],
    benefits: ["service support", "repeat care", "calm weekly rhythm"]
  }
];

export const services: Service[] = [
  {
    id: "ionic-foot-detox",
    name: "Ionic Foot Detox",
    price: "$55",
    duration: "35 minutes",
    description: "A grounding detox ritual designed to help the body return to balance.",
    includes: ["warm mineral foot bath", "guided reset", "post-session hydration notes"]
  },
  {
    id: "mobile-detox",
    name: "Mobile Detox Service",
    price: "from $85",
    duration: "45 minutes",
    description: "A private in-home service for clients who prefer a restorative ritual at home.",
    includes: ["travel setup", "single session", "aftercare ritual card"]
  }
];

export const memberships: MembershipPlan[] = [
  {
    id: "weekly-renewal",
    name: "Weekly Renewal",
    price: "$180/mo",
    cadence: "1 session per week",
    description: "A steady rhythm for ongoing restoration and priority booking.",
    perks: ["weekly ionic foot detox", "priority booking", "10% member savings"]
  },
  {
    id: "total-reset",
    name: "Total Reset",
    price: "$320/mo",
    cadence: "2 sessions per week",
    description: "A deeper recurring plan for clients building a complete reset practice.",
    perks: ["two detox sessions weekly", "early product access", "15% member savings"]
  }
];

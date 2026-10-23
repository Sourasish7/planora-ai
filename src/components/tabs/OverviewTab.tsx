"use client";

import React from "react";
import {
  DollarSign,
  CalendarCheck,
  Briefcase,
  Users,
  Bot,
  ArrowRight,
  Clock,
  Palette,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
} from "lucide-react";
import { EventPlan } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { getBudgetTier, getDecorationsForEvent, getEstimatedSupplyCost } from "@/lib/ai-engine";
import { ActiveTab } from "../TabNavigation";

// Module-level persistent cache across tab switching
const webImageMemoryCache = new Map<string, string>();

interface OverviewTabProps {
  event: EventPlan;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenNewMilestone: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  event,
  onNavigateTab,
  onOpenNewMilestone,
}) => {
  // Aggregate Metrics
  const totalSpent = event.expenses.reduce(
    (sum, exp) => sum + (exp.paid ? exp.amount : 0),
    0
  );
  const totalAllocated = event.budgetAllocations.reduce(
    (sum, b) => sum + b.allocatedAmount,
    0
  );
  const confirmedVendors = event.vendors.filter(
    (v) => v.status === "booked" || v.status === "completed"
  ).length;

  const completedMilestones = event.milestones.filter((m) => m.completed).length;
  const milestoneProgress =
    event.milestones.length > 0
      ? Math.round((completedMilestones / event.milestones.length) * 100)
      : 0;

  const totalRSVP = event.guests.reduce(
    (sum, g) => (g.rsvpStatus === "attending" ? sum + 1 + g.plusOnes : sum),
    0
  );
  const totalInvited = event.guests.reduce(
    (sum, g) => sum + 1 + g.plusOnes,
    0
  );

  const primaryTheme = event.ideas?.themes?.[0];

  const DECORATION_CATALOG: Record<string, { category: string; image: string; spec: string }> = {
    // Primary Celebration Essentials (Balloons, Cake, Banners, Poppers)
    "Colorful Latex Party Balloons (Pack of 20)": {
      category: "Balloons",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
      spec: "Pack of 20 vibrant helium/air party balloons with satin curling ribbons",
    },
    "Fresh Celebration Birthday Cake with Candles": {
      category: "Cake & Candles",
      image: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?auto=format&fit=crop&w=600&q=80",
      spec: "Fresh celebration birthday cake with glowing candles & cake stand",
    },
    "Happy Birthday Letter Wall Banner & Bunting": {
      category: "Banner & Signage",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
      spec: "Glittering Happy Birthday wall banner and decorative bunting",
    },
    "Celebration Party Poppers & Table Confetti": {
      category: "Party Poppers & Confetti",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
      spec: "Handheld celebration party poppers & sparkling table confetti",
    },
    "Birthday Party Hats & Cone Caps (Pack of 5)": {
      category: "Party Hats & Caps",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
      spec: "Pack of 5 festive cone party hats with chin elastic straps",
    },
    "Warm LED Fairy Lights for Wall Decor": {
      category: "Warm Fairy Lights",
      image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=600&q=80",
      spec: "Warm ambient LED fairy string lights for wall backdrop glow",
    },
    "Cake Cutting Knife & Paper Plates Set": {
      category: "Party Tableware",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
      spec: "Cake serving knife, paper plates, cups and party napkins",
    },
    "Colorful Crepe Paper Streamers & Ribbons": {
      category: "Streamers & Ribbons",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
      spec: "Rolls of colorful crepe paper streamers and hanging party ribbons",
    },
    "White & Gold Ceremony Balloons & Ribbons": {
      category: "Balloons",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
      spec: "Elegant white and metallic gold ceremony balloons with ribbons",
    },
    "Intimate Celebration Wedding Cake & Candles": {
      category: "Cake & Candles",
      image: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?auto=format&fit=crop&w=600&q=80",
      spec: "Celebration wedding cake with customized cake topper",
    },
    "Handwritten Wedding Welcome Signboard & Easel": {
      category: "Banner & Signage",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
      spec: "Handcrafted calligraphy welcome card with wooden easel",
    },
    "Celebration Flower Petal Confetti Poppers": {
      category: "Party Poppers & Confetti",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
      spec: "Real rose petal celebration poppers for send-off",
    },
    "Cake Cutting Knife & Toasting Glasses Set": {
      category: "Party Tableware",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
      spec: "Decorative cake server and pair of champagne toast flutes",
    },
    "Heart Foil Balloons & Metallic Balloon Bunch": {
      category: "Balloons",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
      spec: "Heart-shaped foil balloons and metallic balloon cluster",
    },
    "Celebration Anniversary Cake with Candles": {
      category: "Cake & Candles",
      image: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?auto=format&fit=crop&w=600&q=80",
      spec: "Tiered celebration anniversary cake with glowing candles",
    },
    "Happy Anniversary Golden Wall Banner": {
      category: "Banner & Signage",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
      spec: "Shimmering gold Happy Anniversary letter bunting banner",
    },
    "Colorful Celebration Party Balloons with Ribbons": {
      category: "Balloons",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
      spec: "Set of vibrant celebration balloons with satin ribbons",
    },
    "Fresh Celebration Cake with Candles": {
      category: "Cake & Candles",
      image: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?auto=format&fit=crop&w=600&q=80",
      spec: "Fresh celebration cake with glowing candles and cake stand",
    },
    "Event Welcome Banner & Wall Bunting": {
      category: "Banner & Signage",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
      spec: "Custom celebratory entrance banner and colorful wall bunting",
    },
    "Party Caps & Festive Cone Hats": {
      category: "Party Hats & Caps",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
      spec: "Festive celebration party caps and cone hats",
    },
    "Cake Knife & Paper Plates Set": {
      category: "Party Tableware",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
      spec: "Cake serving knife, dessert plates and napkins set",
    },
    // Premium & Luxury Celebrations
    "Custom LED Neon Name & Happy Birthday Sign": {
      category: "Neon Sign",
      image: "https://images.unsplash.com/photo-1581285366526-fa1909abd17e?auto=format&fit=crop&w=600&q=80",
      spec: "Vibrant custom glowing neon sign with acrylic backplate",
    },
    "Custom LED Neon Name & Number Birthday Sign": {
      category: "Neon Sign",
      image: "https://images.unsplash.com/photo-1581285366526-fa1909abd17e?auto=format&fit=crop&w=600&q=80",
      spec: "Vibrant custom glowing neon sign with acrylic backplate",
    },
    "Ultraviolet (UV) Blacklight Flood Projectors & Atmospheric Haze": {
      category: "Lighting",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
      spec: "Dual 100W UV Blacklight cannons with atmospheric haze",
    },
    "Ultraviolet (UV) Blacklight Projectors & Haze Lighting": {
      category: "Lighting",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
      spec: "Dual 100W UV Blacklight cannons with atmospheric haze",
    },
    "12-Inch Mirrored Disco Balls with Rotating Ceiling Motor": {
      category: "Disco Ball",
      image: "https://images.unsplash.com/photo-1618553547283-bfeb6133c384?auto=format&fit=crop&w=600&q=80",
      spec: "Twin reflective glass mirror balls with 3-RPM ceiling swivel motor",
    },
    "Cyberpunk Neon Balloon Garland (Chrome Cyan, Magenta & Black)": {
      category: "Balloon Arch",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
      spec: "16ft double-stuffed metallic latex garland with wire",
    },
    "Cyberpunk Balloon Garland (Chrome Cyan, Magenta & Black)": {
      category: "Balloon Arch",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
      spec: "16ft double-stuffed metallic latex garland with wire",
    },
    "Glow Sticks, UV Neon Face Paints & LED Foam Party Batons": {
      category: "Party Favors",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
      spec: "100-pc glow wand pack + 12 flashing foam batons",
    },
    "Holographic Photo-Wall Backdrop with Retro Arcade Props": {
      category: "Photo Booth",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
      spec: "8x8ft shimmering party backdrop with photo props & accessories",
    },
    "Cake Table Neon Runner with Floating LED Candles": {
      category: "Cake Table",
      image: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?auto=format&fit=crop&w=600&q=80",
      spec: "Celebratory cake centerpiece with warm flickering candles",
    },
    "Fluorescent Tableware, Cups & Confetti Party Poppers": {
      category: "Tableware",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
      spec: "Neon cups, cutlery, napkins & colorful confetti poppers",
    },
    "Fluorescent Tableware, Cups & Confetti Cannon": {
      category: "Tableware",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
      spec: "Neon cups, cutlery, napkins & colorful confetti cannon",
    },
    "Geometric Brass Ceremony Arch with White Florals & Ivy": {
      category: "Altar & Arch",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
      spec: "8ft brass hexagon arch with fresh white roses and ivy",
    },
    "Draped Warm Fairy Light Canopy & Ambient Floor Uplighting": {
      category: "Lighting & Canopy",
      image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=600&q=80",
      spec: "20-strand warm white waterfall fairy light curtain",
    },
    "Welcome Board on Brass Easel with Custom Calligraphy": {
      category: "Entry Signage",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
      spec: "A1 frosted acrylic sign with gold calligraphy & easel",
    },
    "Chiavari Chairs with Silk Ribbons & Eucalyptus Sprigs": {
      category: "Ceremony Seating",
      image: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=600&q=80",
      spec: "Gold Chiavari chairs with ivory satin sash accents",
    },
    "Tall Crystal Candelabras with Glass Votive Centerpieces": {
      category: "Centerpieces",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
      spec: "5-arm crystal candelabras with glass hurricane shades",
    },
    "Aisle Runner Carpet with Scattered Silk Rose Petals": {
      category: "Ceremony Aisle",
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
      spec: "50ft plush white aisle runner & silk rose petals",
    },
    "Custom Monogram Dance Floor Lighting Projection": {
      category: "Dance Floor",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
      spec: "High-output Gobo LED custom monogram spotlight",
    },
    "Velvet Table Runners & Satin Napkin Rings": {
      category: "Table Linens",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
      spec: "Velvet runners & brushed brass napkin rings",
    },
    "Weatherproof Welcome Vinyl Arch Banner & Kiosk Sign": {
      category: "Entry Banner",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80",
      spec: "Heavy-duty outdoor eyelet vinyl banner (12x4ft)",
    },
    "Festoon Edison Bulb String Lighting along Pathways": {
      category: "Pathway Lights",
      image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=600&q=80",
      spec: "Weatherproof S14 warm Edison festoons (100m)",
    },
    "Color-Coded Wayfinding Directional Signboards": {
      category: "Wayfinding Signs",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
      spec: "Set of 6 rustic wooden arrow directional fingerposts",
    },
    "Eco-Friendly Burlap Bunting, Hay Bales & Wooden Fruit Crates": {
      category: "Rustic Staging",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80",
      spec: "10 vintage pine crates & organic straw seating bales",
    },
    "Artisan Stall Canopy Tents with Branded Tablecloths": {
      category: "Stalls & Tents",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80",
      spec: "10x10ft pop-up aluminum waterproof gazebos",
    },
    "Amphitheater Stage Backdrop Banner & Speaker Covers": {
      category: "Main Stage",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
      spec: "Stage scrim backdrop mesh with high-contrast print",
    },
    "Flower Pot Table Centerpieces & Wildflower Seed Packet Favors": {
      category: "Eco Favors",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
      spec: "Terracotta mini succulent pots & seed packets",
    },
    "Clearly Labeled Eco-Friendly Recycling & Compost Stations": {
      category: "Eco Stations",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
      spec: "Color-coded 3-stream waste bins with signage",
    },
  };

  const toSimpleName = (rawItem: string): string => {
    const lower = rawItem.toLowerCase().trim();
    if (lower.includes("balloon")) return "Balloons";
    if (lower.includes("wedding cake")) return "Wedding Cake";
    if (lower.includes("cake") || lower.includes("pastry") || lower.includes("dessert")) return "Cake";
    if (lower.includes("candle") || lower.includes("sparkler") || lower.includes("disco")) return "Candles";
    if (lower.includes("birthday banner") || (lower.includes("banner") && lower.includes("birthday")) || lower.includes("happy birthday")) return "Birthday Banner";
    if (lower.includes("banner") || lower.includes("bunting")) return "Banner";
    if (lower.includes("popper") || lower.includes("confetti") || lower.includes("cannon") || lower.includes("spray")) return "Party Poppers";
    if (lower.includes("hat") || lower.includes("cap") || lower.includes("favor") || lower.includes("glow")) return "Party Hats";
    if (lower.includes("fairy") || lower.includes("light") || lower.includes("lamp") || lower.includes("projector") || lower.includes("haze")) return "Fairy Lights";
    if (lower.includes("streamer") || lower.includes("ribbon") || lower.includes("swirl")) return "Streamers";
    if (lower.includes("plate") || lower.includes("cup") || lower.includes("tableware") || lower.includes("knife") || lower.includes("napkin")) return "Paper Plates & Cups";
    if (lower.includes("flower") || lower.includes("rose") || lower.includes("floral")) return "Flowers";
    if (lower.includes("welcome") || lower.includes("easel") || lower.includes("sign")) return "Welcome Sign";
    if (lower.includes("photo") || lower.includes("booth") || lower.includes("prop")) return "Photo Props";
    if (lower.includes("runner") || lower.includes("linen")) return "Table Runner";
    // Capitalize first letter of short custom strings
    return rawItem.charAt(0).toUpperCase() + rawItem.slice(1).trim();
  };

  const [webImages, setWebImages] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    webImageMemoryCache.forEach((val, key) => {
      initial[key] = val;
    });
    return initial;
  });

  const fetchWebImage = React.useCallback(async (itemName: string) => {
    const simple = toSimpleName(itemName);
    if (webImageMemoryCache.has(simple)) {
      const cached = webImageMemoryCache.get(simple)!;
      setWebImages((prev) => (prev[simple] === cached ? prev : { ...prev, [simple]: cached }));
      return;
    }
    try {
      const res = await fetch(`/api/search-image?q=${encodeURIComponent(simple)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          webImageMemoryCache.set(simple, data.imageUrl);
          setWebImages((prev) => ({ ...prev, [simple]: data.imageUrl }));
        }
      }
    } catch {
      // Fallback handled in getDecorDetail
    }
  }, []);

  const sortDecorPriority = (items: string[]) => {
    const cleaned = Array.from(new Set(items.map(toSimpleName)));
    return cleaned.sort((a, b) => {
      const score = (item: string) => {
        const l = item.toLowerCase();
        if (l.includes("balloon")) return 1;
        if (l.includes("cake")) return 2;
        if (l.includes("candle")) return 3;
        if (l.includes("banner")) return 4;
        if (l.includes("popper") || l.includes("confetti")) return 5;
        if (l.includes("hat")) return 6;
        if (l.includes("fairy") || l.includes("light")) return 7;
        if (l.includes("streamer") || l.includes("ribbon")) return 8;
        return 9;
      };
      return score(a) - score(b);
    });
  };

  const getDecorDetail = (item: string) => {
    const simple = toSimpleName(item);
    const webImg = webImages[simple];

    const baseMap: Record<string, { category: string; image: string; spec: string }> = {
      Balloons: {
        category: "Balloons",
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
        spec: "Pack of colorful latex celebration balloons & ribbons",
      },
      Cake: {
        category: "Cake",
        image: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?auto=format&fit=crop&w=600&q=80",
        spec: "Fresh celebratory cake with candles",
      },
      Candles: {
        category: "Candles",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
        spec: "Celebration candle set for cake and table",
      },
      "Birthday Banner": {
        category: "Banner",
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
        spec: "Festive celebration banner for main backdrop",
      },
      Banner: {
        category: "Banner",
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
        spec: "Decorative party banner for backdrop",
      },
      "Party Poppers": {
        category: "Party Poppers",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
        spec: "Celebration party poppers & confetti",
      },
      "Party Hats": {
        category: "Party Hats",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
        spec: "Fun festive celebration party hats",
      },
      "Fairy Lights": {
        category: "Fairy Lights",
        image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=600&q=80",
        spec: "Warm ambient LED fairy string lights",
      },
      Streamers: {
        category: "Streamers",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        spec: "Crepe paper decorative ceiling streamers",
      },
      Flowers: {
        category: "Flowers",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
        spec: "Fresh floral centerpiece arrangements",
      },
      "Wedding Cake": {
        category: "Wedding Cake",
        image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80",
        spec: "Multi-tiered celebration wedding cake",
      },
      "Welcome Sign": {
        category: "Welcome Sign",
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
        spec: "Personalized event entrance welcome easel",
      },
      Ribbons: {
        category: "Ribbons",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        spec: "Satin ribbons and decorative bows",
      },
      "Table Runner": {
        category: "Table Runner",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
        spec: "Decorative celebration table runner",
      },
      "Photo Props": {
        category: "Photo Props",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        spec: "Fun event photo booth props kit",
      },
      "Paper Plates & Cups": {
        category: "Tableware",
        image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80",
        spec: "Eco-friendly party tableware set",
      },
    };

    const match = baseMap[simple] || {
      category: simple,
      image: webImg || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
      spec: `${simple} essential party supplies`,
    };

    const est = getEstimatedSupplyCost(simple, event.currency);

    return {
      category: match.category,
      image: webImg || match.image,
      spec: match.spec,
      estCost: est.formatted,
    };
  };

  const defaultDecorations: Record<string, string[]> = {
    birthday: [
      "Balloons",
      "Cake",
      "Candles",
      "Birthday Banner",
      "Party Poppers",
      "Party Hats",
      "Fairy Lights",
      "Streamers",
    ],
    wedding: [
      "Flowers",
      "Wedding Cake",
      "Candles",
      "Fairy Lights",
      "Balloons",
      "Welcome Sign",
      "Ribbons",
      "Table Runner",
    ],
    community_event: [
      "Banner",
      "Fairy Lights",
      "Balloons",
      "Signboard",
      "Stall Tents",
      "Flowers",
      "Streamers",
    ],
  };

  // Derive decorations strictly according to event budget and type
  const rawInitial = getDecorationsForEvent(
    event.eventType,
    getBudgetTier(event.totalBudget, event.currency)
  );

  const [decorItems, setDecorItems] = React.useState<string[]>(sortDecorPriority(rawInitial));
  const [checkedDecor, setCheckedDecor] = React.useState<Record<number, boolean>>({});
  const [newDecorInput, setNewDecorInput] = React.useState("");
  const [isAddingDecor, setIsAddingDecor] = React.useState(false);

  // Trigger web image search for all items
  React.useEffect(() => {
    decorItems.forEach((item) => {
      fetchWebImage(item);
    });
  }, [decorItems, fetchWebImage]);

  const handleDeleteDecor = (indexToDelete: number) => {
    setDecorItems((prev) => prev.filter((_, i) => i !== indexToDelete));
    setCheckedDecor((prev) => {
      const updated: Record<number, boolean> = {};
      Object.keys(prev).forEach((key) => {
        const k = parseInt(key);
        if (k < indexToDelete) {
          updated[k] = prev[k];
        } else if (k > indexToDelete) {
          updated[k - 1] = prev[k];
        }
      });
      return updated;
    });
  };

  // Sync decorations when event budget or event type changes
  React.useEffect(() => {
    const tier = getBudgetTier(event.totalBudget, event.currency);
    const budgetDecorations = getDecorationsForEvent(event.eventType, tier);
    setDecorItems(sortDecorPriority(budgetDecorations));
    setCheckedDecor({});
  }, [event.id, event.eventType, event.totalBudget, event.currency]);

  return (
    <div className="space-y-8 animate-fade-in text-black">
      {/* 4 Pastel Neobrutalist Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Budget Card - Pastel Peach */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Budget Allocation: ${formatCurrency(totalSpent, event.currency)} spent of ${formatCurrency(event.totalBudget, event.currency)}. Click to manage budget.`}
          onClick={() => onNavigateTab("budget")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigateTab("budget");
            }
          }}
          className="cursor-pointer rounded-2xl border-2 border-black bg-[#fcd2c2] p-5 shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]"
        >
          <div className="flex items-center justify-between text-xs font-black">
            <span>Budget Allocation</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[1.5px_1.5px_0px_0px_#000]">
              <DollarSign className="h-4 w-4 text-black" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-black">
              {formatCurrency(totalSpent, event.currency)}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {" "}
              / {formatCurrency(event.totalBudget, event.currency)}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>
              {((totalSpent / (event.totalBudget || 1)) * 100).toFixed(0)}% utilized
            </span>
            <span className="flex items-center gap-1 font-black underline">
              Manage <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Milestones Card - Vibrant Yellow */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Planning Progress: ${completedMilestones} of ${event.milestones.length} milestones complete. Click to view timeline.`}
          onClick={() => onNavigateTab("timeline")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigateTab("timeline");
            }
          }}
          className="cursor-pointer rounded-2xl border-2 border-black bg-[#eefc27] p-5 shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]"
        >
          <div className="flex items-center justify-between text-xs font-black">
            <span>Milestones Completed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[1.5px_1.5px_0px_0px_#000]">
              <CalendarCheck className="h-4 w-4 text-black" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-black">
              {completedMilestones}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {" "}
              / {event.milestones.length} Tasks
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>{milestoneProgress}% complete</span>
            <span className="flex items-center gap-1 font-black underline">
              Timeline <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Vendors Card - Pastel Blue */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Booked Vendors: ${confirmedVendors} of ${event.vendors.length} vendors contracted. Click to view vendors.`}
          onClick={() => onNavigateTab("vendors")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigateTab("vendors");
            }
          }}
          className="cursor-pointer rounded-2xl border-2 border-black bg-[#c2e9fb] p-5 shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]"
        >
          <div className="flex items-center justify-between text-xs font-black">
            <span>Booked Vendors</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[1.5px_1.5px_0px_0px_#000]">
              <Briefcase className="h-4 w-4 text-black" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-black">
              {confirmedVendors}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {" "}
              / {event.vendors.length} Categories
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>
              {event.vendors.length - confirmedVendors} Pending
            </span>
            <span className="flex items-center gap-1 font-black underline">
              Checklists <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Guest RSVP Card - Pastel Mint */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Guest RSVPs: ${totalRSVP} attending of ${event.guestCount} target capacity.`}
          onClick={() => onNavigateTab("overview")}
          className="rounded-2xl border-2 border-black bg-[#c7f7d4] p-5 shadow-[4px_4px_0px_0px_#000] transition-all"
        >
          <div className="flex items-center justify-between text-xs font-black">
            <span>Guest Target</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[1.5px_1.5px_0px_0px_#000]">
              <Users className="h-4 w-4 text-black" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-black">
              {event.guestCount}
            </span>
            <span className="text-xs font-bold text-slate-800"> Guests Plan</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Seating & Catering Ready</span>
            <span className="font-black text-black">Calibrated</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Theme & Aesthetic Concept with Required Decorations (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {primaryTheme && (
            <div className="rounded-3xl border-2 border-black bg-white p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border-2 border-black bg-[#eefc27] px-3 py-1 text-xs font-black text-black shadow-[1.5px_1.5px_0px_0px_#000]">
                    Theme Concept
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Primary Aesthetic Signature
                  </span>
                </div>
                <button
                  onClick={() => onNavigateTab("ideas")}
                  className="flex items-center gap-1 text-xs font-black text-black underline hover:text-blue-600"
                >
                  <span>Explore All 3 Concepts</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-5">
                <h4 className="text-xl font-black text-black">
                  {primaryTheme.name}
                </h4>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-800">
                  {primaryTheme.description}
                </p>
              </div>

              {/* Color Palette Swatches */}
              <div className="mt-5">
                <span className="text-xs font-black text-black">
                  Recommended Color Palette:
                </span>
                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  {primaryTheme.colorPalette.map((color, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border-1.5 border-black bg-[#faf8f2] p-1.5 pr-2.5 shadow-[1.5px_1.5px_0px_0px_#000]">
                      <div
                        className="h-6 w-6 rounded-lg border-1.5 border-black shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                      <span className="text-[11px] font-mono font-bold text-black">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Vibe Signature:</span>
                <span className="rounded-full border-1.5 border-black bg-[#fcd2c2] px-3 py-0.5 text-xs font-black text-black shadow-[1px_1px_0px_0px_#000]">
                  {primaryTheme.vibes}
                </span>
              </div>

              {/* Required Decoration Items Section with Visual Image Cards */}
              <div className="mt-8 pt-6 border-t-2 border-black">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border-1.5 border-black bg-[#eefc27] text-black shadow-[1.5px_1.5px_0px_0px_#000]">
                      <Palette className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black block">
                        Required Decoration Items & Supplies
                      </span>
                      <p className="text-[11px] font-bold text-slate-600">
                        Visual photo guide calibrated for your {formatCurrency(event.totalBudget, event.currency)} budget ({decorItems.length} essential {decorItems.length === 1 ? "item" : "supplies"})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border-1.5 border-black bg-[#c7f7d4] px-2.5 py-0.5 text-[10px] font-black text-black shadow-[1px_1px_0px_0px_#000]">
                      {Object.values(checkedDecor).filter(Boolean).length} / {decorItems.length} Procured
                    </span>
                    <span className="rounded-full border-1.5 border-black bg-[#eefc27] px-2.5 py-0.5 text-[10px] font-black text-black shadow-[1px_1px_0px_0px_#000]">
                      {decorItems.length} Items
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                  {decorItems.map((item, idx) => {
                    const isChecked = checkedDecor[idx];
                    const detail = getDecorDetail(item);
                    return (
                      <div
                        key={idx}
                        className={`group relative overflow-hidden rounded-2xl border-2 border-black transition-all shadow-[3px_3px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 flex flex-col justify-between ${
                          isChecked ? "bg-[#c7f7d4]/30" : "bg-[#faf8f2]"
                        }`}
                      >
                        {/* Image Showcase */}
                        <div className="relative h-28 sm:h-32 w-full overflow-hidden border-b-2 border-black bg-slate-100">
                          <img
                            src={detail.image}
                            alt={item}
                            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              isChecked ? "filter grayscale contrast-125" : ""
                            }`}
                            loading="lazy"
                          />
                          {/* Status Pill Badge */}
                          <div className="absolute top-2 left-2">
                            <span
                              className={`rounded-full border-1.5 border-black px-2 py-0.5 text-[9px] font-black shadow-[1px_1px_0px_0px_#000] ${
                                isChecked ? "bg-[#c7f7d4] text-black" : "bg-[#eefc27] text-black"
                              }`}
                            >
                              {isChecked ? "Procured" : "Required"}
                            </span>
                          </div>
                        </div>

                        {/* Details and Action */}
                        <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                          <div>
                            {/* Category Badge & Estimated Cost */}
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="inline-block whitespace-nowrap rounded-full border border-black bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow-[1px_1px_0px_0px_#000]">
                                {detail.category}
                              </span>
                              <span className="text-[10px] font-black text-slate-800 bg-[#eefc27]/80 border border-black/30 rounded-full px-2 py-0.5 shadow-[1px_1px_0px_0px_#000]">
                                {detail.estCost}
                              </span>
                            </div>

                            <h5
                              className={`text-sm sm:text-base font-black text-black leading-snug tracking-tight ${
                                isChecked ? "line-through text-slate-400" : ""
                              }`}
                            >
                              {toSimpleName(item)}
                            </h5>
                            <p className="mt-1 text-[11px] sm:text-xs font-medium text-slate-600 leading-normal">
                              {detail.spec}
                            </p>
                          </div>

                          {/* Action Row: Toggle Procured + Single Dedicated Delete Button */}
                          <div className="flex items-center gap-2 pt-2 border-t border-black/10">
                            <button
                              type="button"
                              onClick={() =>
                                setCheckedDecor((prev) => ({
                                  ...prev,
                                  [idx]: !prev[idx],
                                }))
                              }
                              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 border-black py-1.5 px-2 text-xs font-black transition-all shadow-[1.5px_1.5px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] ${
                                isChecked
                                  ? "bg-[#c7f7d4] text-black hover:bg-[#b2f0c3]"
                                  : "bg-[#eefc27] text-black hover:bg-[#e4f31c]"
                              }`}
                            >
                              {isChecked ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                                  <span>Procured</span>
                                </>
                              ) : (
                                <>
                                  <Circle className="h-3.5 w-3.5 text-black" />
                                  <span>Mark as Procured</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteDecor(idx)}
                              title={`Delete ${item}`}
                              aria-label={`Delete ${item}`}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-white hover:bg-rose-400 text-black shadow-[1.5px_1.5px_0px_0px_#000] transition-colors flex-shrink-0 active:translate-x-[1px] active:translate-y-[1px]"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-black" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Decor Item */}
                <div className="mt-4">
                  {isAddingDecor ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newDecorInput.trim()) {
                          const simple = toSimpleName(newDecorInput.trim());
                          setDecorItems((prev) => sortDecorPriority([...prev, simple]));
                          fetchWebImage(simple);
                          setNewDecorInput("");
                          setIsAddingDecor(false);
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={newDecorInput}
                        onChange={(e) => setNewDecorInput(e.target.value)}
                        placeholder="Enter simple item name (e.g. Balloons, Cake, Candles, Chocolates)"
                        className="flex-1 rounded-xl border-2 border-black bg-white p-2 text-xs font-bold text-black placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="neo-btn-primary px-3 py-2 text-xs font-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Item</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingDecor(false)}
                        className="neo-btn px-3 py-2 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingDecor(true)}
                      className="neo-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Item</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hourly Run-of-Show Preview */}
          <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-black" />
                <h3 className="text-base font-black text-black">
                  Day-of Run of Show Preview
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab("timeline")}
                className="text-xs font-black text-black underline hover:text-blue-600"
              >
                View Full Itinerary
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {event.runOfShow.slice(0, 4).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-xl border-2 border-black bg-[#faf8f2] p-3 text-xs shadow-[2px_2px_0px_0px_#000]"
                >
                  <span className="w-20 font-mono font-black text-black flex-shrink-0">
                    {item.time}
                  </span>
                  <div className="flex-1 space-y-1">
                    <span className="font-black text-black block">
                      {item.activity}
                    </span>
                    <p className="text-slate-700 text-[11px] font-medium leading-relaxed">
                      {item.notes}
                    </p>
                  </div>
                  <span className="rounded-full border-1.5 border-black bg-white px-2 py-0.5 text-[10px] font-bold text-black flex-shrink-0">
                    {item.personInCharge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Co-Pilot Assistant Quick Suggestions & Milestones (1 col) */}
        <div className="space-y-6">
          {/* AI Quick Prompts Card - Vibrant Yellow */}
          <div className="rounded-3xl border-2 border-black bg-[#eefc27] p-6 shadow-[5px_5px_0px_0px_#000]">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-black" />
              <h3 className="text-base font-black text-black">
                Planora AI Co-Pilot
              </h3>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-800">
              Ask anything about budgets, timeline logistics, icebreakers, or
              vendor negotiations!
            </p>

            <div className="mt-4 space-y-2">
              {[
                "Where can I trim 10% from my budget?",
                "Suggest 3 interactive games for my guests",
                "Draft an RSVP invitation email",
                "Vendor tipping and deposit advice",
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateTab("ai")}
                  className="flex w-full items-center justify-between rounded-xl border-2 border-black bg-white p-2.5 text-left text-xs font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  <span className="truncate pr-2">{prompt}</span>
                  <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-black" />
                </button>
              ))}
            </div>
          </div>

          {/* Urgent Milestones Card */}
          <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-sm font-black text-black">
                Upcoming Deadlines
              </h3>
              <button
                onClick={onOpenNewMilestone}
                className="flex items-center gap-1 rounded-lg border-1.5 border-black bg-[#faf8f2] px-2 py-1 text-[11px] font-black text-black shadow-[1px_1px_0px_0px_#000]"
              >
                <Plus className="h-3 w-3" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {event.milestones.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border-1.5 border-black bg-[#faf8f2] p-2.5 text-xs shadow-[1.5px_1.5px_0px_0px_#000]"
                >
                  <div className="flex items-center gap-2">
                    {m.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    )}
                    <span
                      className={`truncate max-w-[140px] font-bold ${
                        m.completed ? "line-through text-slate-500" : "text-black"
                      }`}
                    >
                      {m.title}
                    </span>
                  </div>
                  <span className="rounded-md border border-black bg-white px-2 py-0.5 text-[10px] font-mono font-bold text-black flex-shrink-0">
                    {m.dueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

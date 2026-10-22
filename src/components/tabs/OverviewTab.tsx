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
import { ActiveTab } from "../TabNavigation";

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
      image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80",
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
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
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
      image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80",
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
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
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

  const getDecorDetail = (item: string) => {
    if (DECORATION_CATALOG[item]) {
      return DECORATION_CATALOG[item];
    }
    const lower = item.toLowerCase();
    if (lower.includes("neon") || lower.includes("sign")) {
      return {
        category: "Neon & Signage",
        image: "https://images.unsplash.com/photo-1581285366526-fa1909abd17e?auto=format&fit=crop&w=600&q=80",
        spec: "Custom glowing LED neon fixture",
      };
    }
    if (lower.includes("light") || lower.includes("projector") || lower.includes("haze") || lower.includes("lamp")) {
      return {
        category: "Lighting & Effects",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
        spec: "High-output ambient lighting setup",
      };
    }
    if (lower.includes("disco") || lower.includes("ball") || lower.includes("mirror")) {
      return {
        category: "Ceiling Installation",
        image: "https://images.unsplash.com/photo-1618553547283-bfeb6133c384?auto=format&fit=crop&w=600&q=80",
        spec: "Rotating mirror ball fixture",
      };
    }
    if (lower.includes("balloon") || lower.includes("garland") || lower.includes("arch")) {
      return {
        category: "Balloon Decor",
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
        spec: "Multi-tier balloon arch display",
      };
    }
    if (lower.includes("cake") || lower.includes("candle") || lower.includes("pastry")) {
      return {
        category: "Cake & Candles",
        image: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?auto=format&fit=crop&w=600&q=80",
        spec: "Celebration cake with glowing candles",
      };
    }
    if (lower.includes("glow") || lower.includes("stick") || lower.includes("baton") || lower.includes("favor")) {
      return {
        category: "Party Supplies",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
        spec: "Glow accessories & guest party items",
      };
    }
    if (lower.includes("photo") || lower.includes("backdrop") || lower.includes("wall") || lower.includes("booth")) {
      return {
        category: "Photo Station",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        spec: "Shimmer backdrop & photo accessories",
      };
    }
    if (lower.includes("table") || lower.includes("runner") || lower.includes("centerpiece")) {
      return {
        category: "Tabletop Styling",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
        spec: "Table runner and ambient decor",
      };
    }
    if (lower.includes("flower") || lower.includes("floral") || lower.includes("ivy") || lower.includes("rose")) {
      return {
        category: "Floral Design",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
        spec: "Arranged fresh botanicals & blooms",
      };
    }
    if (lower.includes("chair") || lower.includes("seat") || lower.includes("ribbon")) {
      return {
        category: "Seating Decor",
        image: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=600&q=80",
        spec: "Decorated event seating",
      };
    }
    return {
      category: "Celebration Supply",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
      spec: "Essential event decoration & supply",
    };
  };

  const defaultDecorations: Record<string, string[]> = {
    birthday: [
      "Custom LED Neon Name & Number Birthday Sign",
      "Ultraviolet (UV) Blacklight Projectors & Haze Lighting",
      "12-Inch Mirrored Disco Balls with Rotating Ceiling Motor",
      "Cyberpunk Balloon Garland (Chrome Cyan, Magenta & Black)",
      "Glow Sticks, UV Neon Face Paints & LED Foam Party Batons",
      "Holographic Photo-Wall Backdrop with Retro Arcade Props",
      "Cake Table Neon Runner with Floating LED Candles",
      "Fluorescent Tableware, Cups & Confetti Cannon",
    ],
    wedding: [
      "Geometric Brass Ceremony Arch with White Florals & Ivy",
      "Draped Warm Fairy Light Canopy & Ambient Floor Uplighting",
      "Welcome Board on Brass Easel with Custom Calligraphy",
      "Chiavari Chairs with Silk Ribbons & Eucalyptus Sprigs",
      "Tall Crystal Candelabras with Glass Votive Centerpieces",
      "Aisle Runner Carpet with Scattered Silk Rose Petals",
      "Custom Monogram Dance Floor Lighting Projection",
      "Velvet Table Runners & Satin Napkin Rings",
    ],
    community_event: [
      "Weatherproof Welcome Vinyl Arch Banner & Kiosk Sign",
      "Festoon Edison Bulb String Lighting along Pathways",
      "Color-Coded Wayfinding Directional Signboards",
      "Eco-Friendly Burlap Bunting, Hay Bales & Wooden Fruit Crates",
      "Artisan Stall Canopy Tents with Branded Tablecloths",
      "Amphitheater Stage Backdrop Banner & Speaker Covers",
      "Flower Pot Table Centerpieces & Wildflower Seed Packet Favors",
      "Clearly Labeled Eco-Friendly Recycling & Compost Stations",
    ],
  };

  const initialDecor =
    primaryTheme?.decorations && primaryTheme.decorations.length > 0
      ? primaryTheme.decorations
      : defaultDecorations[event.eventType] || defaultDecorations.birthday;

  const [decorItems, setDecorItems] = React.useState<string[]>(initialDecor);
  const [checkedDecor, setCheckedDecor] = React.useState<Record<number, boolean>>({});
  const [newDecorInput, setNewDecorInput] = React.useState("");
  const [isAddingDecor, setIsAddingDecor] = React.useState(false);

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

  // Sync if event changes
  React.useEffect(() => {
    if (primaryTheme?.decorations && primaryTheme.decorations.length > 0) {
      setDecorItems(primaryTheme.decorations);
    } else {
      setDecorItems(defaultDecorations[event.eventType] || defaultDecorations.birthday);
    }
    setCheckedDecor({});
  }, [event.id, primaryTheme?.name, event.eventType]);

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
                        Visual photo guide showing what each required decoration and centerpiece looks like
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
                            {/* Category Badge - Single-line non-wrapping */}
                            <div className="flex items-center mb-1.5">
                              <span className="inline-block whitespace-nowrap rounded-full border border-black bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow-[1px_1px_0px_0px_#000]">
                                {detail.category}
                              </span>
                            </div>

                            <h5
                              className={`text-xs sm:text-sm font-black text-black leading-snug tracking-tight ${
                                isChecked ? "line-through text-slate-400" : ""
                              }`}
                            >
                              {item}
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
                          setDecorItems((prev) => [...prev, newDecorInput.trim()]);
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
                        placeholder="Add required supply (e.g. 50x Brass Table Numbers)"
                        className="flex-1 rounded-xl border-2 border-black bg-white p-2 text-xs font-bold text-black placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="neo-btn-primary px-3 py-2 text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                      >
                        Add Item
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
                      <span>Add Decoration Supply</span>
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

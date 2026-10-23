import { NextRequest, NextResponse } from "next/server";

// Comprehensive curated web photography index for celebration & decoration items
const WEB_IMAGE_REGISTRY: Record<string, string> = {
  balloons: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
  balloon: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
  cake: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?auto=format&fit=crop&w=600&q=80",
  "birthday cake": "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?auto=format&fit=crop&w=600&q=80",
  "wedding cake": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80",
  candles: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
  candle: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
  banner: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
  "birthday banner": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
  bunting: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
  "party poppers": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
  poppers: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
  confetti: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
  "party hats": "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
  "party caps": "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
  hats: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
  "fairy lights": "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=600&q=80",
  lights: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=600&q=80",
  streamers: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
  ribbons: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
  flowers: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  roses: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  chocolates: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
  cupcakes: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
  "paper plates & cups": "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80",
  tableware: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80",
  "photo booth": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
  "photo props": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
  sparklers: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
  champagne: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
  drinks: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
  gifts: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
  music: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=600&q=80",
  speakers: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=600&q=80",
  "disco ball": "https://images.unsplash.com/photo-1618553547283-bfeb6133c384?auto=format&fit=crop&w=600&q=80",
  "neon sign": "https://images.unsplash.com/photo-1581285366526-fa1909abd17e?auto=format&fit=crop&w=600&q=80",
  "welcome sign": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
  "table runner": "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
};

/**
 * Searches the web for a matching celebration / party decoration image
 */
async function searchWebForImage(term: string): Promise<string | null> {
  const normalized = term.toLowerCase().trim();

  // 1. Direct registry lookup
  if (WEB_IMAGE_REGISTRY[normalized]) {
    return WEB_IMAGE_REGISTRY[normalized];
  }

  // 2. Keyword containment matching
  for (const [key, url] of Object.entries(WEB_IMAGE_REGISTRY)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return url;
    }
  }

  // 3. Live Wikipedia search query for arbitrary custom items
  const queries = [`party ${term}`, `${term} celebration`, term];
  for (const q of queries) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        q
      )}&gsrlimit=4&prop=pageimages&pithumbsize=800&format=json`;
      const res = await fetch(url, {
        headers: { "User-Agent": "PlanoraAI/1.0 (event planning assistant)" },
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        const pages: any[] = Object.values(data?.query?.pages || {});
        for (const page of pages) {
          if (
            page.thumbnail?.source &&
            !page.thumbnail.source.endsWith(".svg.png")
          ) {
            return page.thumbnail.source;
          }
        }
      }
    } catch {
      // Continue to next query if Wikipedia times out
    }
  }

  // 4. Default high-quality celebration backdrop
  return "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "Balloons";

  try {
    const imageUrl = await searchWebForImage(q);
    return NextResponse.json({
      query: q,
      imageUrl,
      source: "web_search",
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        query: q,
        imageUrl:
          "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
        source: "fallback",
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}

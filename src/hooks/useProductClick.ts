import { supabase } from "@/lib/supabase";

export async function recordProductClick(productId: string, context?: { type: "product_card" | "whatsapp" | "detail_page" }) {
  try {
    // Get user's IP and user agent (client-side only)
    const userAgent = navigator.userAgent;
    const referrer = document.referrer;

    // Insert click record
    const { error } = await supabase
      .from("product_clicks")
      .insert([
        {
          product_id: productId,
          user_agent: userAgent,
          ip_address: null, // Client-side can't get IP directly, server can
          referrer: referrer || null,
        },
      ]);

    if (error) {
      console.error("Error recording click:", error.message || error);
    }
  } catch (err) {
    console.error("Error in recordProductClick:", err instanceof Error ? err.message : err);
    // Fail silently - don't interrupt user experience
  }
}

export async function recordProductView(productId: string) {
  try {
    const userAgent = navigator.userAgent;
    const referrer = document.referrer;

    // Insert view record
    const { error } = await supabase
      .from("product_views")
      .insert([
        {
          product_id: productId,
          user_agent: userAgent,
          ip_address: null,
          referrer: referrer || null,
        },
      ]);

    if (error) {
      console.error("Error recording view:", error.message || error);
    }
  } catch (err) {
    console.error("Error in recordProductView:", err instanceof Error ? err.message : err);
  }
}

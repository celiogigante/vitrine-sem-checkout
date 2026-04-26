import { supabase } from "@/lib/supabase";

/**
 * Migrates products from localStorage to Supabase
 * This function reads the old localStorage data and inserts it into Supabase
 * Returns the number of products migrated
 */
export async function migrateLocalStorageToSupabase(): Promise<number> {
  try {
    const STORAGE_KEY = "cellstore_products";
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      console.log("No localStorage data found");
      return 0;
    }

    const localProducts = JSON.parse(stored) as any[];
    console.log(`Found ${localProducts.length} products in localStorage`);

    let migratedCount = 0;

    for (const localProduct of localProducts) {
      try {
        // Convert localStorage format to Supabase format
        const supabaseProduct = {
          id: localProduct.id,
          name: localProduct.name,
          brand: localProduct.brand,
          price: localProduct.price,
          original_price: localProduct.originalPrice || null,
          description: localProduct.description,
          condition: localProduct.condition,
          status: localProduct.status || "disponivel",
          battery_percentage: localProduct.battery || null,
          general_condition: localProduct.generalState || null,
          slug: localProduct.slug || generateSlug(localProduct.name),
          images: localProduct.images || [],
          video_url: localProduct.videoUrl || null,
          specs: localProduct.specs || {},
          featured: localProduct.featured || false,
          promotion: localProduct.promotion || false,
          is_on_request: localProduct.isOnRequest || false,
          views: localProduct.views || 0,
          created_at: localProduct.createdAt 
            ? new Date(localProduct.createdAt).toISOString()
            : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Try to insert the product
        const { error } = await supabase
          .from("products")
          .upsert([supabaseProduct], { onConflict: "id" });

        if (error) {
          console.error(`Error migrating product ${localProduct.id}:`, error);
        } else {
          migratedCount++;
          console.log(`✓ Migrated: ${localProduct.name}`);
        }
      } catch (err) {
        console.error(`Exception migrating product ${localProduct.id}:`, err);
      }
    }

    console.log(`\n✅ Migration complete! ${migratedCount}/${localProducts.length} products migrated.`);
    return migratedCount;
  } catch (err) {
    console.error("Migration failed:", err);
    throw err;
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Clears localStorage products after migration is complete
 * Only call this AFTER verifying migration was successful
 */
export function clearLocalStorageProducts(): void {
  const STORAGE_KEY = "cellstore_products";
  localStorage.removeItem(STORAGE_KEY);
  console.log("✓ LocalStorage products cleared");
}

"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

// HELPER: Generate Unique Slug
async function generateUniqueSlug(table: string, baseSlug: string, excludeId?: string) {
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (true) {
    let query = supabaseAdmin.from(table).select("id").eq("slug", uniqueSlug);
    if (excludeId) query = query.neq("id", excludeId);
    
    const { data } = await query.maybeSingle();
    if (!data) break; // Slug is unique
    
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

// PRODUCTS
export async function getProducts() {
  const { data } = await supabaseAdmin.from("products").select("*").is("deleted_at", null).order("priority", { ascending: false });
  return data || [];
}
export async function getProductBySlug(slug: string) {
  const { data } = await supabaseAdmin.from("products").select("*").eq("slug", slug).single();
  return data;
}
export async function createProduct(productData: any) {
  productData.slug = await generateUniqueSlug("products", productData.slug || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  const { data, error } = await supabaseAdmin.from("products").insert([productData]).select().single();
  if (error) {
    if (error.message && error.message.includes("column") && error.message.includes("does not exist")) {
      return { error: 'COLUMN_MISSING', message: error.message };
    }
    throw error;
  }
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
  return { success: true, data };
}
export async function updateProduct(id: string, productData: any) {
  if (productData.slug) {
    productData.slug = await generateUniqueSlug("products", productData.slug, id);
  }
  const { data, error } = await supabaseAdmin.from("products").update(productData).eq("id", id).select().single();
  if (error) {
    if (error.message && error.message.includes("column") && error.message.includes("does not exist")) {
      return { error: 'COLUMN_MISSING', message: error.message };
    }
    throw error;
  }
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
  return { success: true, data };
}
export async function deleteProduct(id: string) {
  const { error } = await supabaseAdmin.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
  return true;
}

export async function getDeletedProducts() {
  const { data } = await supabaseAdmin.from("products").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false });
  return data || [];
}
export async function restoreProduct(id: string) {
  const { error } = await supabaseAdmin.from("products").update({ deleted_at: null }).eq("id", id);
  if (error) throw error;
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
  return true;
}
export async function permanentlyDeleteProduct(id: string) {
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) throw error;
  return true;
}
export async function bulkUpdateProducts(ids: string[], updates: any) {
  const { data, error } = await supabaseAdmin.from("products").update(updates).in("id", ids).select();
  if (error) throw error;
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
  return data;
}
export async function uploadProductImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabaseAdmin.storage.from("products").upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) throw error;
  
  const { data: { publicUrl } } = supabaseAdmin.storage.from("products").getPublicUrl(fileName);
  return publicUrl;
}

// COLLECTIONS
export async function getCollections() {
  const { data } = await supabaseAdmin.from("collections").select("*").is("deleted_at", null).order("order", { ascending: true });
  return data || [];
}
export async function createCollection(collectionData: any) {
  collectionData.slug = await generateUniqueSlug("collections", collectionData.slug || collectionData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  const { data, error } = await supabaseAdmin.from("collections").insert([collectionData]).select().single();
  if (error) throw error;
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
  return data;
}
export async function updateCollection(id: string, collectionData: any) {
  if (collectionData.slug) {
    collectionData.slug = await generateUniqueSlug("collections", collectionData.slug, id);
  }
  const { data, error } = await supabaseAdmin.from("collections").update(collectionData).eq("id", id).select().single();
  if (error) throw error;
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
  return data;
}
export async function deleteCollection(id: string) {
  const { error } = await supabaseAdmin.from("collections").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
  return true;
}

export async function getDeletedCollections() {
  const { data } = await supabaseAdmin.from("collections").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false });
  return data || [];
}
export async function restoreCollection(id: string) {
  const { error } = await supabaseAdmin.from("collections").update({ deleted_at: null }).eq("id", id);
  if (error) throw error;
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
  return true;
}
export async function permanentlyDeleteCollection(id: string) {
  const { error } = await supabaseAdmin.from("collections").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ORDERS
export async function getOrders() {
  const { data } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });
  return data || [];
}
export async function createOrder(orderData: any) {
  const { data, error } = await supabaseAdmin.from("orders").insert([orderData]).select().single();
  if (error) throw error;
  return data;
}
export async function updateOrderField(id: string, field: string, value: string) {
  const { data, error } = await supabaseAdmin.from("orders").update({ [field]: value }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// CUSTOMERS (Aggregated from Orders)
export async function getCustomers() {
  const { data: orders, error } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });
  if (error || !orders) {
    return [];
  }

  const customerMap = new Map<string, any>();

  orders.forEach((order: any) => {
    const email = order.email || order.shipping_address?.email || "Unknown";
    const phone = order.whatsapp_number || order.shipping_address?.phone || "Unknown";
    const name = order.shipping_address?.fullName || "Unknown Customer";
    const id = email !== "Unknown" ? email : (phone !== "Unknown" ? phone : order.id);

    if (!customerMap.has(id)) {
      customerMap.set(id, {
        id,
        name,
        email,
        phone,
        total_spent: 0,
        orders_count: 0,
        last_order_date: order.created_at,
        recent_orders: []
      });
    }

    const customer = customerMap.get(id);
    customer.total_spent += Number(order.total_amount || 0);
    customer.orders_count += 1;
    customer.recent_orders.push(order);
  });

  return Array.from(customerMap.values());
}

// CRM / CARTS
export async function getCrmSessions() {
  const { data } = await supabaseAdmin.from("cart_sessions").select("*").order("updated_at", { ascending: false });
  return data || [];
}
export async function createOrUpdateCartSession(sessionData: any) {
  const { data, error } = await supabaseAdmin.from("cart_sessions").upsert([sessionData], { onConflict: "email" }).select().single();
  if (error) throw error;
  return data;
}
export async function updateCrmSession(id: string, dataObj: any) {
  const { data, error } = await supabaseAdmin.from("cart_sessions").update(dataObj).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// NEWSLETTER / SUBSCRIBERS
export async function subscribeNewsletter(email: string, whatsapp_number?: string, snapchat?: string) {
  const { data, error } = await supabaseAdmin.from("subscribers").upsert([{ email, whatsapp_number, snapchat }], { onConflict: "email" }).select();
  if (error) {
    if (error.code === 'PGRST205') return { error: 'TABLE_MISSING' };
    return { error: error.message };
  }
  
  if (data && data.length > 0) {
    await supabaseAdmin.channel('admin-notifications').send({
      type: 'broadcast',
      event: 'new-subscriber',
      payload: data[0]
    });
  }

  return { success: true, data };
}

export async function getSubscribers() {
  const { data } = await supabaseAdmin.from("subscribers").select("*").order("created_at", { ascending: false });
  return data || [];
}

// DASHBOARD STATS
export async function getDashboardStats() {
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id, email, total_amount, status, created_at, line_items")
    .order("created_at", { ascending: false });
    
  const { data: carts } = await supabaseAdmin
    .from("cart_sessions")
    .select("id, email, total_amount, items, created_at, is_recovered")
    .order("created_at", { ascending: false });
    
  return { orders: orders || [], carts: carts || [] };
}

// CAFE ITEMS
export async function getCafeItems() {
  const { data, error } = await supabaseAdmin.from("cafe_items").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) {
    console.error("Missing cafe_items table, returning fallback data");
    return [];
  }
  return data || [];
}
export async function getCafeItemById(id: string) {
  const { data, error } = await supabaseAdmin.from("cafe_items").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}
export async function createCafeItem(itemData: any) {
  const { data, error } = await supabaseAdmin.from("cafe_items").insert([itemData]).select().single();
  if (error) {
    if (error.code === 'PGRST205') return { error: 'TABLE_MISSING', table: 'cafe_items' };
    throw error;
  }
  revalidatePath('/cafe', 'layout');
  return { success: true, data };
}
export async function updateCafeItem(id: string, itemData: any) {
  const { data, error } = await supabaseAdmin.from("cafe_items").update(itemData).eq("id", id).select().single();
  if (error) throw error;
  revalidatePath('/cafe', 'layout');
  return data;
}
export async function deleteCafeItem(id: string) {
  const { error } = await supabaseAdmin.from("cafe_items").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath('/cafe', 'layout');
  return true;
}
export async function bulkUpdateCafeItems(ids: string[], updates: any) {
  const { data, error } = await supabaseAdmin.from("cafe_items").update(updates).in("id", ids).select();
  if (error) throw error;
  revalidatePath('/cafe', 'layout');
  return data;
}

export async function getDeletedCafeItems() {
  const { data } = await supabaseAdmin.from("cafe_items").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false });
  return data || [];
}
export async function restoreCafeItem(id: string) {
  const { error } = await supabaseAdmin.from("cafe_items").update({ deleted_at: null }).eq("id", id);
  if (error) throw error;
  revalidatePath('/cafe', 'layout');
  return true;
}
export async function permanentlyDeleteCafeItem(id: string) {
  const { error } = await supabaseAdmin.from("cafe_items").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// AUDIO TRACKS
export async function getAudioTracks() {
  const { data, error } = await supabaseAdmin.from("audio_tracks").select("*").is("deleted_at", null).order("track_number", { ascending: true });
  if (error) {
    console.error("Missing audio_tracks table, returning fallback data");
    return [];
  }
  return data || [];
}
export async function createAudioTrack(trackData: any) {
  const { data, error } = await supabaseAdmin.from("audio_tracks").insert([trackData]).select().single();
  if (error) {
    if (error.code === 'PGRST205') return { error: 'TABLE_MISSING', table: 'audio_tracks' };
    return { error: 'DB_ERROR', message: error.message };
  }
  revalidatePath('/sights-and-sounds', 'layout');
  return { success: true, data };
}
export async function updateAudioTrack(id: string, trackData: any) {
  const { data, error } = await supabaseAdmin.from("audio_tracks").update(trackData).eq("id", id).select().single();
  if (error) {
    return { error: 'DB_ERROR', message: error.message };
  }
  revalidatePath('/sights-and-sounds', 'layout');
  return data;
}
export async function deleteAudioTrack(id: string) {
  const { error } = await supabaseAdmin.from("audio_tracks").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath('/sights-and-sounds', 'layout');
  return true;
}

export async function getDeletedAudioTracks() {
  const { data } = await supabaseAdmin.from("audio_tracks").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false });
  return data || [];
}
export async function restoreAudioTrack(id: string) {
  const { error } = await supabaseAdmin.from("audio_tracks").update({ deleted_at: null }).eq("id", id);
  if (error) throw error;
  revalidatePath('/sights-and-sounds', 'layout');
  return true;
}
export async function permanentlyDeleteAudioTrack(id: string) {
  const { error } = await supabaseAdmin.from("audio_tracks").delete().eq("id", id);
  if (error) throw error;
  return true;
}
export async function getAudioUploadToken(fileName: string) {
  const fileExt = fileName.split('.').pop();
  const safeName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabaseAdmin.storage.from("audio").createSignedUploadUrl(safeName);

  if (error) throw error;
  
  const { data: { publicUrl } } = supabaseAdmin.storage.from("audio").getPublicUrl(safeName);
  
  return { 
    token: data.token, 
    path: data.path, 
    publicUrl 
  };
}

// ANNOUNCEMENTS
export async function getAnnouncements() {
  const { data, error } = await supabaseAdmin.from("announcements").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) {
    console.error("Missing announcements table, returning fallback data");
    return [];
  }
  return data || [];
}

export async function createAnnouncement(announcementData: any) {
  const { data, error } = await supabaseAdmin.from("announcements").insert([announcementData]).select().single();
  if (error) {
    if (error.code === 'PGRST205' || (error.message && error.message.includes("does not exist"))) {
      return { error: 'TABLE_MISSING', table: 'announcements' };
    }
    throw error;
  }
  revalidatePath('/announcements', 'layout');
  revalidatePath('/', 'layout');
  return { success: true, data };
}

export async function updateAnnouncement(id: string, announcementData: any) {
  const { data, error } = await supabaseAdmin.from("announcements").update(announcementData).eq("id", id).select().single();
  if (error) throw error;
  revalidatePath('/announcements', 'layout');
  revalidatePath('/', 'layout');
  return { success: true, data };
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabaseAdmin.from("announcements").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath('/announcements', 'layout');
  revalidatePath('/', 'layout');
  return true;
}

export async function getDeletedAnnouncements() {
  const { data } = await supabaseAdmin.from("announcements").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false });
  return data || [];
}
export async function restoreAnnouncement(id: string) {
  const { error } = await supabaseAdmin.from("announcements").update({ deleted_at: null }).eq("id", id);
  if (error) throw error;
  revalidatePath('/announcements', 'layout');
  revalidatePath('/', 'layout');
  return true;
}
export async function permanentlyDeleteAnnouncement(id: string) {
  const { error } = await supabaseAdmin.from("announcements").delete().eq("id", id);
  if (error) throw error;
  return true;
}

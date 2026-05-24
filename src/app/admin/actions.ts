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
  const { data } = await supabaseAdmin.from("products").select("*").order("priority", { ascending: false });
  return data || [];
}
export async function getProductBySlug(slug: string) {
  const { data } = await supabaseAdmin.from("products").select("*").eq("slug", slug).single();
  return data;
}
export async function createProduct(productData: any) {
  productData.slug = await generateUniqueSlug("products", productData.slug || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  const { data, error } = await supabaseAdmin.from("products").insert([productData]).select().single();
  if (error) throw error;
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
  return data;
}
export async function updateProduct(id: string, productData: any) {
  if (productData.slug) {
    productData.slug = await generateUniqueSlug("products", productData.slug, id);
  }
  const { data, error } = await supabaseAdmin.from("products").update(productData).eq("id", id).select().single();
  if (error) throw error;
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
  return data;
}
export async function deleteProduct(id: string) {
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) throw error;
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
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
  const { data } = await supabaseAdmin.from("collections").select("*").order("order", { ascending: true });
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
  const { error } = await supabaseAdmin.from("collections").delete().eq("id", id);
  if (error) throw error;
  revalidatePath('/shop', 'layout');
  revalidatePath('/', 'layout');
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

// DASHBOARD STATS
export async function getDashboardStats() {
  const { data: orders } = await supabaseAdmin.from("orders").select("total_amount, status");
  const { data: carts } = await supabaseAdmin.from("cart_sessions").select("id").eq("is_recovered", false);
  return { orders: orders || [], carts: carts || [] };
}

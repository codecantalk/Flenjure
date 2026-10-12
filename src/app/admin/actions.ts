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

// CUSTOMERS (Aggregated from Auth Users + Orders)
export interface CustomerData {
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  shipping_address?: {
    fullName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    snapchat_handle?: string;
    whatsapp_number?: string;
  } | null;
  notes?: string;
  tags?: string[];
}

export async function getCustomers() {
  const { data: orders, error: ordersError } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  const customerMap = new Map<string, any>();

  // 1. Add all registered Supabase Auth users to map
  if (authData && authData.users) {
    authData.users.forEach(user => {
      const email = user.email || "";
      if (!email) return;

      const meta = user.user_metadata || {};
      const firstName = meta.first_name || "";
      const lastName = meta.last_name || "";
      let name = "";
      if (firstName || lastName) {
        name = `${firstName} ${lastName}`.trim();
      } else if (meta.full_name) {
        name = meta.full_name;
      } else if (meta.name) {
        name = meta.name;
      } else {
        name = email.split("@")[0] || "Customer";
      }

      const phone = user.phone || meta.phone || "";

      customerMap.set(email.toLowerCase(), {
        id: user.id,
        auth_id: user.id,
        first_name: firstName,
        last_name: lastName,
        name,
        email,
        phone: phone || "Unknown",
        shipping_address: meta.shipping_address || null,
        notes: meta.notes || "",
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        is_registered: true,
        total_spent: 0,
        orders_count: 0,
        last_order_date: user.created_at,
        created_at: user.created_at,
        recent_orders: []
      });
    });
  }

  // 2. Aggregate / merge order history
  if (orders && !ordersError) {
    orders.forEach((order: any) => {
      const rawEmail = order.email || order.shipping_address?.email || "";
      const emailKey = rawEmail ? rawEmail.toLowerCase() : "";
      const orderPhone = order.whatsapp_number || order.shipping_address?.phone || order.shipping_address?.whatsapp_number || "";
      const orderName = order.shipping_address?.fullName || "";
      const mapKey = emailKey || (orderPhone ? orderPhone : order.id);

      if (!customerMap.has(mapKey)) {
        const nameParts = orderName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        customerMap.set(mapKey, {
          id: mapKey,
          auth_id: null,
          first_name: firstName,
          last_name: lastName,
          name: orderName || (rawEmail ? rawEmail.split("@")[0] : "Customer"),
          email: rawEmail || "Unknown",
          phone: orderPhone || "Unknown",
          shipping_address: order.shipping_address || null,
          notes: "",
          tags: [],
          is_registered: false,
          total_spent: 0,
          orders_count: 0,
          last_order_date: order.created_at,
          created_at: order.created_at,
          recent_orders: []
        });
      }

      const customer = customerMap.get(mapKey);

      // Enhance name if currently generic
      if ((!customer.name || customer.name === "Customer" || customer.name === "Unknown Customer") && orderName) {
        customer.name = orderName;
        if (!customer.first_name) customer.first_name = orderName.trim().split(" ")[0] || "";
        if (!customer.last_name) customer.last_name = orderName.trim().split(" ").slice(1).join(" ") || "";
      }

      // Enhance phone if empty or unknown
      if ((!customer.phone || customer.phone === "Unknown") && orderPhone) {
        customer.phone = orderPhone;
      }

      // Fill shipping address if missing
      if (!customer.shipping_address && order.shipping_address) {
        customer.shipping_address = order.shipping_address;
      }

      customer.total_spent += Number(order.total_amount || 0);
      customer.orders_count += 1;
      customer.recent_orders.push(order);

      if (new Date(order.created_at) > new Date(customer.last_order_date)) {
        customer.last_order_date = order.created_at;
      }
    });
  }

  return Array.from(customerMap.values()).sort(
    (a, b) => new Date(b.last_order_date || b.created_at || 0).getTime() - new Date(a.last_order_date || a.created_at || 0).getTime()
  );
}

export async function createCustomer(data: CustomerData) {
  const email = data.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "A valid email address is required." };
  }

  // Check if user already exists
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
  const existing = authData?.users?.find(u => u.email?.toLowerCase() === email);
  if (existing) {
    return { error: "A customer profile with this email already exists." };
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      first_name: data.first_name?.trim() || "",
      last_name: data.last_name?.trim() || "",
      phone: data.phone?.trim() || "",
      shipping_address: data.shipping_address || null,
      notes: data.notes?.trim() || "",
      tags: data.tags || [],
    }
  });

  if (createError) {
    return { error: createError.message };
  }

  revalidatePath("/admin/customers");
  return { success: true, customer: created.user };
}

export async function updateCustomer(idOrEmail: string, data: CustomerData) {
  const email = data.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "A valid email address is required." };
  }

  const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = authData?.users?.find(
    u => u.id === idOrEmail || u.email?.toLowerCase() === idOrEmail.toLowerCase() || u.email?.toLowerCase() === email
  );

  const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim();

  if (existingUser) {
    // Update existing Supabase Auth profile
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      email,
      user_metadata: {
        ...(existingUser.user_metadata || {}),
        first_name: data.first_name?.trim() || "",
        last_name: data.last_name?.trim() || "",
        full_name: fullName,
        phone: data.phone?.trim() || "",
        shipping_address: data.shipping_address || null,
        notes: data.notes !== undefined ? data.notes.trim() : (existingUser.user_metadata?.notes || ""),
        tags: data.tags || existingUser.user_metadata?.tags || [],
      }
    });

    if (updateError) {
      return { error: updateError.message };
    }
  } else {
    // Create new Auth profile for guest customer
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        first_name: data.first_name?.trim() || "",
        last_name: data.last_name?.trim() || "",
        full_name: fullName,
        phone: data.phone?.trim() || "",
        shipping_address: data.shipping_address || null,
        notes: data.notes?.trim() || "",
        tags: data.tags || [],
      }
    });

    if (createError) {
      return { error: createError.message };
    }
  }

  // Also sync order records under this email if customer changed details
  try {
    const { data: matchedOrders } = await supabaseAdmin
      .from("orders")
      .select("id, shipping_address")
      .eq("email", email);

    if (matchedOrders && matchedOrders.length > 0) {
      for (const ord of matchedOrders) {
        const updatedAddress = {
          ...(ord.shipping_address || {}),
          ...(data.shipping_address || {}),
          ...(fullName ? { fullName } : {}),
          ...(data.phone ? { whatsapp_number: data.phone, phone: data.phone } : {})
        };

        await supabaseAdmin
          .from("orders")
          .update({
            shipping_address: updatedAddress,
            whatsapp_number: data.phone || undefined
          })
          .eq("id", ord.id);
      }
    }
  } catch (err) {
    console.error("Order sync warning (non-fatal):", err);
  }

  revalidatePath("/admin/customers");
  return { success: true };
}

export async function deleteCustomer(idOrEmail: string) {
  try {
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const existing = authData?.users?.find(
      u => u.id === idOrEmail || u.email?.toLowerCase() === idOrEmail.toLowerCase()
    );

    if (existing) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(existing.id);
      if (error) return { error: error.message };
    }

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to remove customer" };
  }
}

export async function getCustomerOrders(email: string) {
  if (!email) return [];
  const { data } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false });
  return data || [];
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
    .select("id, email, total_amount, status, created_at, items")
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

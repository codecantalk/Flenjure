import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // In a real application, you might insert into an 'orders' table.
    // Since Flenjure uses cart_sessions, we can update or create a manual session log.
    // For now, we will just return success so the frontend redirects to success page.
    // The admin will see the cart_session marked as recovered/paid manually if they check the DB.

    console.log("Manual Cafe Checkout Processed:", data);

    return NextResponse.json({ success: true, message: "Manual payment order received" });
  } catch (error: any) {
    console.error("Manual checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

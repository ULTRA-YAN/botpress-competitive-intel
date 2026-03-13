import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// POST: Subscribe an email for weekly digest
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("digest_subscribers")
      .select("id, active")
      .eq("email", email.toLowerCase().trim())
      .limit(1);

    if (existing && existing.length > 0) {
      if (existing[0].active) {
        return NextResponse.json({ message: "Already subscribed", status: "exists" });
      }
      // Reactivate
      await supabase
        .from("digest_subscribers")
        .update({ active: true })
        .eq("id", existing[0].id);
      return NextResponse.json({ message: "Subscription reactivated", status: "reactivated" });
    }

    // Insert new subscriber
    const { error } = await supabase
      .from("digest_subscribers")
      .insert({ email: email.toLowerCase().trim(), active: true });

    if (error) {
      console.error("Subscribe error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Subscribed successfully", status: "subscribed" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Unsubscribe an email
export async function DELETE(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("digest_subscribers")
      .update({ active: false })
      .eq("email", email.toLowerCase().trim());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Unsubscribed" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";

export async function POST() {
  try {
    console.log("🧹 Starting database cleanup...");

    if (!supabaseAdmin) {
      console.error("❌ Admin client not available");
      return NextResponse.json(
        { error: "Admin client not available" },
        { status: 500 }
      );
    }

    // Delete all data in correct order (due to foreign key constraints)
    console.log("🗑️ Deleting events...");
    const { error: eventsError } = await supabaseAdmin
      .from("events")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (eventsError) {
      console.error("❌ Failed to delete events:", eventsError.message);
      return NextResponse.json(
        { error: "Failed to delete events", details: eventsError.message },
        { status: 500 }
      );
    }

    console.log("🗑️ Deleting goals...");
    const { error: goalsError } = await supabaseAdmin
      .from("goals")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (goalsError) {
      console.error("❌ Failed to delete goals:", goalsError.message);
      return NextResponse.json(
        { error: "Failed to delete goals", details: goalsError.message },
        { status: 500 }
      );
    }

    console.log("🗑️ Deleting sites...");
    const { error: sitesError } = await supabaseAdmin
      .from("sites")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (sitesError) {
      console.error("❌ Failed to delete sites:", sitesError.message);
      return NextResponse.json(
        { error: "Failed to delete sites", details: sitesError.message },
        { status: 500 }
      );
    }

    console.log("🗑️ Deleting users...");
    const { error: usersError } = await supabaseAdmin
      .from("users")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (usersError) {
      console.error("❌ Failed to delete users:", usersError.message);
      return NextResponse.json(
        { error: "Failed to delete users", details: usersError.message },
        { status: 500 }
      );
    }

    // Recreate demo data
    console.log("👤 Creating demo user...");
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "demo@fastinsight.dev",
      name: "Demo User",
      role: "OWNER",
    });

    if (userError) {
      console.error("❌ Failed to create demo user:", userError.message);
      return NextResponse.json(
        { error: "Failed to create demo user", details: userError.message },
        { status: 500 }
      );
    }

    console.log("🌐 Creating demo site...");
    const { error: siteError } = await supabaseAdmin.from("sites").insert({
      id: "550e8400-e29b-41d4-a716-446655440001",
      website_id: "demo-site-123",
      domain: "demo.fastinsight.dev",
      name: "Demo Site",
      user_id: "550e8400-e29b-41d4-a716-446655440000",
    });

    if (siteError) {
      console.error("❌ Failed to create demo site:", siteError.message);
      return NextResponse.json(
        { error: "Failed to create demo site", details: siteError.message },
        { status: 500 }
      );
    }

    console.log("📊 Creating sample events...");
    const { error: eventsInsertError } = await supabaseAdmin
      .from("events")
      .insert([
        {
          site_id: "550e8400-e29b-41d4-a716-446655440001",
          session_id: "session-1",
          visitor_id: "visitor-1",
          type: "PAGEVIEW",
          name: "Homepage View",
          url: "/",
          referrer: "https://google.com",
          properties: { browser: "Chrome", os: "Linux" },
        },
        {
          site_id: "550e8400-e29b-41d4-a716-446655440001",
          session_id: "session-1",
          visitor_id: "visitor-1",
          type: "PAGEVIEW",
          name: "About View",
          url: "/about",
          referrer: "/",
          properties: { browser: "Chrome", os: "Linux" },
        },
        {
          site_id: "550e8400-e29b-41d4-a716-446655440001",
          session_id: "session-2",
          visitor_id: "visitor-2",
          type: "PAGEVIEW",
          name: "Homepage View",
          url: "/",
          referrer: "https://twitter.com",
          properties: { browser: "Firefox", os: "Windows" },
        },
        {
          site_id: "550e8400-e29b-41d4-a716-446655440001",
          session_id: "session-2",
          visitor_id: "visitor-2",
          type: "REVENUE",
          name: "Purchase",
          url: "/checkout",
          referrer: "/pricing",
          properties: {
            product: "Pro Plan",
            browser: "Firefox",
            os: "Windows",
          },
          revenue: 99.0,
          currency: "USD",
        },
        {
          site_id: "550e8400-e29b-41d4-a716-446655440001",
          session_id: "session-3",
          visitor_id: "visitor-3",
          type: "PAGEVIEW",
          name: "Documentation",
          url: "/docs",
          referrer: "https://github.com",
          properties: { browser: "Safari", os: "macOS" },
        },
      ]);

    if (eventsInsertError) {
      console.error(
        "❌ Failed to create sample events:",
        eventsInsertError.message
      );
      return NextResponse.json(
        {
          error: "Failed to create sample events",
          details: eventsInsertError.message,
        },
        { status: 500 }
      );
    }

    // Get final counts
    const { count: userCount } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: siteCount } = await supabaseAdmin
      .from("sites")
      .select("*", { count: "exact", head: true });

    const { count: eventCount } = await supabaseAdmin
      .from("events")
      .select("*", { count: "exact", head: true });

    console.log("✅ Database cleanup completed successfully!");
    console.log(
      `📊 Final counts - Users: ${userCount}, Sites: ${siteCount}, Events: ${eventCount}`
    );

    return NextResponse.json({
      success: true,
      message: "Database cleaned and reset successfully",
      counts: {
        users: userCount,
        sites: siteCount,
        events: eventCount,
      },
    });
  } catch (error) {
    console.error("❌ Database cleanup error:", error);
    return NextResponse.json(
      { error: "Database cleanup failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Database clean endpoint",
    usage: "POST to /api/clean to reset the database",
    warning: "This will delete all data and recreate demo data",
  });
}

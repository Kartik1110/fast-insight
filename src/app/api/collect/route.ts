import { NextRequest, NextResponse } from 'next/server'
import { supabase } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log("📥 Received tracking data:", JSON.stringify(data, null, 2));

    // Handle the new tracking script format
    const websiteId = data.websiteId;
    const visitorId = data.visitorId;
    const sessionId = data.sessionId;
    const eventType = data.type;
    const url = data.url;

    // Validate required fields
    if (!websiteId || !visitorId || !eventType) {
      console.error("❌ Missing required fields:", {
        websiteId,
        visitorId,
        eventType,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the site by websiteId using Supabase (using snake_case column names)
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("*")
      .eq("website_id", websiteId)
      .single();

    if (siteError || !site) {
      console.error("❌ Site not found for ID:", websiteId, siteError?.message);
      return NextResponse.json({ error: "Invalid site ID" }, { status: 404 });
    }

    console.log("✅ Found site:", site.name);

    // Map event types to our enum
    let eventTypeEnum:
      | "PAGEVIEW"
      | "REVENUE"
      | "OUTBOUND"
      | "DOWNLOAD"
      | "CUSTOM" = "PAGEVIEW";
    if (eventType === "pageview") eventTypeEnum = "PAGEVIEW";
    else if (eventType === "revenue" || data.amount) eventTypeEnum = "REVENUE";
    else if (eventType === "outbound") eventTypeEnum = "OUTBOUND";
    else if (eventType === "download") eventTypeEnum = "DOWNLOAD";
    else if (eventType === "custom" || eventType === "engagement")
      eventTypeEnum = "CUSTOM";
    else eventTypeEnum = "CUSTOM";

    // Extract revenue data
    const revenue = data.amount || null;
    const currency = data.currency || null;

    // Get properties from the tracking data
    const properties = {
      ...(data.properties || {}),
      viewport: data.viewport,
      domain: data.domain,
    };

    // Create the event record using Supabase (using snake_case column names)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        site_id: site.id,
        visitor_id: visitorId,
        session_id: sessionId || visitorId,
        type: eventTypeEnum,
        name: data.name || eventType,
        url: url || "unknown",
        referrer: data.referrer,
        properties: JSON.stringify(properties),
        revenue: revenue ? parseFloat(revenue.toString()) : null,
        currency: currency,
        timestamp: data.timestamp
          ? new Date(data.timestamp).toISOString()
          : new Date().toISOString(),
      })
      .select()
      .single();

    if (eventError) {
      console.error("❌ Failed to create event:", eventError.message);
      return NextResponse.json(
        { error: "Failed to create event", details: eventError.message },
        { status: 500 }
      );
    }

    console.log("✅ Event created successfully:", event.id);
    console.log("📊 Event details:", {
      type: eventTypeEnum,
      url: url,
      visitor: visitorId,
      site: site.name,
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("❌ Analytics collection error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 
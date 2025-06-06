import { NextResponse } from "next/server";
import {
  testDirectConnection,
  testSupabaseConnection,
  testSupabaseAdminConnection,
} from "@/lib/db";

export async function GET() {
  try {
    // Test all database connections
    const [directResult, supabaseResult, supabaseAdminResult] =
      await Promise.all([
        testDirectConnection(),
        testSupabaseConnection(),
        testSupabaseAdminConnection(),
      ]);

    // Determine overall status
    const hasWorkingConnection =
      directResult.status === "connected" ||
      supabaseResult.status === "connected" ||
      supabaseAdminResult.status === "connected";

    const overallStatus = hasWorkingConnection ? "connected" : "error";

    // Build response
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      database: {
        direct: directResult,
        supabase: supabaseResult,
        supabaseAdmin: supabaseAdminResult,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        hasDirectConnection: !!process.env.DATABASE_URL,
        hasSupabaseConnection: !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ),
        hasSupabaseAdmin: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    };

    // Return appropriate HTTP status
    const httpStatus = overallStatus === "connected" ? 200 : 503;

    return NextResponse.json(response, { status: httpStatus });
  } catch (error) {
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

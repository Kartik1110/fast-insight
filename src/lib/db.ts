import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

// Environment validation
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
};

// Configuration logging
console.log("🔧 Database Configuration:", {
  useDirectConnection: !!requiredEnvVars.DATABASE_URL,
  hasSupabaseUrl: !!requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  hasServiceKey: !!requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY,
  environment: process.env.NODE_ENV || "development",
});

// Determine connection method
const useDirectConnection = !!requiredEnvVars.DATABASE_URL;
const useSupabaseAPI = !!(
  requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL &&
  requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

if (useDirectConnection) {
  console.log("🗄️ Using Direct PostgreSQL Connection");
} else if (useSupabaseAPI) {
  console.log("🌐 Using Supabase HTTP API");
} else {
  console.log("⚠️ No database connection method available");
}

// Validate required environment variables
const missingVars = [];
if (!requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL)
  missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
if (!requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

if (missingVars.length > 0) {
  console.error(
    "❌ Missing required Supabase environment variables:",
    missingVars.join(", ")
  );
  console.log(
    "📝 Please check your .env.local file and ensure these variables are set correctly"
  );
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
}

// Initialize PostgreSQL connection pool (if available)
let pgPool: Pool | null = null;
if (useDirectConnection) {
  try {
    pgPool = new Pool({
      connectionString: requiredEnvVars.DATABASE_URL,
      ssl:
        process.env.DATABASE_SSL === "true"
          ? { rejectUnauthorized: false }
          : false,
      min: parseInt(process.env.DATABASE_POOL_MIN || "2"),
      max: parseInt(process.env.DATABASE_POOL_MAX || "10"),
      idleTimeoutMillis: parseInt(process.env.DATABASE_TIMEOUT || "10000"),
    });

    console.log("✅ PostgreSQL connection pool initialized");
  } catch (error) {
    console.error("❌ Failed to initialize PostgreSQL pool:", error);
    pgPool = null;
  }
}

// Initialize Supabase clients
const supabaseUrl = requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (if service role key is available)
export const supabaseAdmin = requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Database connection functions
export async function testDirectConnection(): Promise<{
  status: "connected" | "error";
  error?: string;
  code?: string;
}> {
  if (!pgPool) {
    return {
      status: "error",
      error: "PostgreSQL pool not initialized",
      code: "NO_POOL",
    };
  }

  try {
    const client = await pgPool.connect();
    await client.query("SELECT 1");
    client.release();
    return { status: "connected" };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
      code: error.code || "UNKNOWN",
    };
  }
}

export async function testSupabaseConnection(): Promise<{
  status: "connected" | "error";
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);
    if (error) throw error;
    return { status: "connected" };
  } catch (error: any) {
    return { status: "error", error: error.message };
  }
}

export async function testSupabaseAdminConnection(): Promise<{
  status: "connected" | "error";
  error?: string;
}> {
  if (!supabaseAdmin) {
    return { status: "error", error: "Admin client not available" };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("count")
      .limit(1);
    if (error) throw error;
    return { status: "connected" };
  } catch (error: any) {
    return { status: "error", error: error.message };
  }
}

// Export PostgreSQL pool for direct queries
export { pgPool };

// Legacy Prisma compatibility (if needed)
export const db = {
  // Add any Prisma-compatible methods here if needed for backward compatibility
};

console.log("🚀 Database clients initialized successfully");

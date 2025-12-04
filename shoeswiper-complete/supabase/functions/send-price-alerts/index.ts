// Supabase Edge Function: supabase/functions/send-price-alerts/index.ts
// Deploy with: supabase functions deploy send-price-alerts
// Schedule with: Create a cron job in Supabase Dashboard or use external scheduler
//
// Purpose: Sends email notifications for triggered price alerts
// Integrates with email service (template for future implementation)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface PriceNotification {
  id: string;
  user_id: string;
  shoe_id: string;
  shoe_name: string;
  shoe_brand: string;
  shoe_image: string;
  amazon_url: string;
  old_price: number;
  new_price: number;
  saved_amount: number;
  percent_off: number;
  notification_sent: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
}

interface EmailResult {
  notificationId: string;
  userId: string;
  success: boolean;
  error?: string;
}

/**
 * Sends email notification for a price drop
 * Currently a template - implement with your email service (SendGrid, Resend, etc.)
 */
async function sendPriceDropEmail(
  userEmail: string,
  userName: string | undefined,
  notification: PriceNotification
): Promise<boolean> {
  // TODO: Implement email sending with your preferred email service
  // 
  // Example with Resend:
  // const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  // if (!RESEND_API_KEY) return false;
  //
  // const response = await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${RESEND_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     from: "ShoeSwiper <alerts@shoeswiper.com>",
  //     to: [userEmail],
  //     subject: `Price Drop Alert: ${notification.shoe_name}`,
  //     html: generateEmailHtml(userName, notification),
  //   }),
  // });
  // return response.ok;
  //
  // Example with SendGrid:
  // const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
  // ...similar implementation...

  // For now, log the email that would be sent
  console.log(`[Email] Would send to ${userEmail}:`, {
    subject: `Price Drop Alert: ${notification.shoe_name}`,
    userName,
    oldPrice: notification.old_price,
    newPrice: notification.new_price,
    savedAmount: notification.saved_amount,
    percentOff: notification.percent_off,
  });

  // Return true to simulate successful email send for testing
  // In production, this should return the actual result of the email API call
  return true;
}

/**
 * Generates HTML email content for price drop notification.
 * Note: Prefixed with underscore as this is prepared for future email service integration.
 * Will be used when Resend/SendGrid is configured via RESEND_API_KEY or SENDGRID_API_KEY.
 */
function _generateEmailHtml(
  userName: string | undefined,
  notification: PriceNotification
): string {
  const greeting = userName ? `Hi ${userName}` : "Hi there";
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Price Drop Alert</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎉 Price Drop Alert!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 24px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            ${greeting}, great news! A sneaker you've been watching just dropped in price.
          </p>
          
          <!-- Product Card -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center;">
              <img src="${notification.shoe_image}" alt="${notification.shoe_name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-right: 16px;">
              <div>
                <h2 style="color: #111827; font-size: 18px; margin: 0 0 4px 0;">${notification.shoe_name}</h2>
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 12px 0;">${notification.shoe_brand}</p>
                <div>
                  <span style="color: #DC2626; text-decoration: line-through; font-size: 14px;">$${notification.old_price.toFixed(2)}</span>
                  <span style="color: #059669; font-size: 20px; font-weight: bold; margin-left: 8px;">$${notification.new_price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Savings Badge -->
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
            <p style="color: #ffffff; font-size: 14px; margin: 0 0 4px 0;">You Save</p>
            <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">
              $${notification.saved_amount.toFixed(2)} (${notification.percent_off}% OFF)
            </p>
          </div>
          
          <!-- CTA Button -->
          <a href="${notification.amazon_url}" style="display: block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #ffffff; text-decoration: none; text-align: center; padding: 16px 24px; border-radius: 8px; font-size: 16px; font-weight: bold;">
            Shop Now on Amazon →
          </a>
          
          <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
            Prices may change. Act fast to lock in your savings!
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6B7280; font-size: 12px; margin: 0;">
            You're receiving this because you set a price alert on ShoeSwiper.<br>
            <a href="#" style="color: #3B82F6;">Manage your alerts</a> | <a href="#" style="color: #3B82F6;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();
  const results: EmailResult[] = [];
  let processedCount = 0;
  let sentCount = 0;
  let errorCount = 0;

  try {
    // Validate environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch notifications that haven't been sent
    const { data: notifications, error: fetchError } = await supabase
      .from("price_notifications")
      .select("*")
      .eq("notification_sent", false)
      .order("created_at", { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch notifications: ${fetchError.message}`);
    }

    if (!notifications || notifications.length === 0) {
      // Log monitoring activity
      await supabase.from("price_monitoring_logs").insert({
        check_type: "email_send",
        alerts_processed: 0,
        alerts_triggered: 0,
        errors: 0,
        duration_ms: Date.now() - startTime,
        metadata: { message: "No pending notifications to send" },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "No pending notifications to send",
          processed: 0,
          sent: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get unique user IDs
    const userIds = [...new Set(notifications.map((n: PriceNotification) => n.user_id))];

    // Fetch user profiles (emails)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    // Create a map of user_id to email
    const userEmailMap = new Map<string, { email: string; name?: string }>();
    for (const user of users.users) {
      if (userIds.includes(user.id)) {
        userEmailMap.set(user.id, {
          email: user.email || "",
          name: user.user_metadata?.display_name || user.user_metadata?.full_name,
        });
      }
    }

    // Process each notification
    for (const notification of notifications as PriceNotification[]) {
      try {
        const userInfo = userEmailMap.get(notification.user_id);
        
        if (!userInfo || !userInfo.email) {
          console.error(`No email found for user ${notification.user_id}`);
          errorCount++;
          results.push({
            notificationId: notification.id,
            userId: notification.user_id,
            success: false,
            error: "User email not found",
          });
          continue;
        }

        // Send the email
        const emailSent = await sendPriceDropEmail(
          userInfo.email,
          userInfo.name,
          notification
        );

        if (emailSent) {
          // Mark notification as sent
          await supabase
            .from("price_notifications")
            .update({ notification_sent: true })
            .eq("id", notification.id);

          sentCount++;
          results.push({
            notificationId: notification.id,
            userId: notification.user_id,
            success: true,
          });
        } else {
          errorCount++;
          results.push({
            notificationId: notification.id,
            userId: notification.user_id,
            success: false,
            error: "Email service failed",
          });
        }

        processedCount++;
      } catch (notifError) {
        console.error(`Error processing notification ${notification.id}:`, notifError);
        errorCount++;
        results.push({
          notificationId: notification.id,
          userId: notification.user_id,
          success: false,
          error: notifError instanceof Error ? notifError.message : String(notifError),
        });
      }
    }

    // Log monitoring results
    await supabase.from("price_monitoring_logs").insert({
      check_type: "email_send",
      alerts_processed: processedCount,
      alerts_triggered: sentCount,
      errors: errorCount,
      duration_ms: Date.now() - startTime,
      metadata: {
        results_summary: results.map((r) => ({
          notification_id: r.notificationId,
          success: r.success,
        })),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        sent: sentCount,
        errors: errorCount,
        durationMs: Date.now() - startTime,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-price-alerts function:", error);

    // Try to log the error
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from("price_monitoring_logs").insert({
          check_type: "email_send",
          alerts_processed: processedCount,
          alerts_triggered: sentCount,
          errors: errorCount + 1,
          duration_ms: Date.now() - startTime,
          metadata: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    } catch {
      // Ignore logging errors
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { productId, quantity } = await req.json();
    
    // Validate input
    if (!productId || quantity === undefined || quantity === null) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields: productId and quantity are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Get current inventory
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .single();
    
    if (inventoryError) {
      console.error("Error fetching inventory:", inventoryError);
      return new Response(
        JSON.stringify({ success: false, message: "Error fetching inventory", error: inventoryError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Calculate new quantity
    const currentQuantity = inventoryData?.quantity || 0;
    const newQuantity = currentQuantity + quantity;
    
    // Update inventory
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId);
    
    if (error) {
      console.error("Error updating inventory:", error);
      return new Response(
        JSON.stringify({ success: false, message: "Error updating inventory", error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Inventory updated for product ${productId}. New quantity: ${newQuantity}`,
        data: { productId, newQuantity }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Unexpected error occurred", error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});


import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default when deployed.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API SERVICE ROLE KEY - env var exported by default when deployed.
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Cleaning up data for user: ${userId}`);
    
    // Delete all reviews for the user to allow user deletion
    try {
      const { error: reviewsDeleteError } = await supabaseClient
        .from('reviews')
        .delete()
        .eq('user_id', userId);
        
      if (reviewsDeleteError) {
        console.error('Error deleting reviews:', reviewsDeleteError);
      } else {
        console.log('Successfully deleted reviews');
      }
    } catch (error) {
      console.error('Error in reviews deletion:', error);
    }
    
    // Delete cart items
    try {
      const { error: cartDeleteError } = await supabaseClient
        .from('cart')
        .delete()
        .eq('user_id', userId);
        
      if (cartDeleteError) {
        console.error('Error deleting cart items:', cartDeleteError);
      } else {
        console.log('Successfully deleted cart items');
      }
    } catch (error) {
      console.error('Error in cart deletion:', error);
    }
    
    // We'll continue even if some deletions fail, as we want to clean up as much as possible
    
    return new Response(
      JSON.stringify({ success: true, message: 'User data cleaned up successfully' }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})

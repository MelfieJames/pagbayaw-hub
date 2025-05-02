
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { productId, quantity } = await req.json()
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // First, get the current inventory
    const { data: inventoryData, error: fetchError } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .single()
      
    if (fetchError) {
      throw new Error(`Failed to fetch inventory: ${fetchError.message}`)
    }
    
    // Calculate new quantity
    const currentQuantity = inventoryData?.quantity || 0
    const newQuantity = currentQuantity + quantity
    
    // Update the inventory
    const { data, error: updateError } = await supabase
      .from('inventory')
      .update({ 
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId)
      
    if (updateError) {
      throw new Error(`Failed to update inventory: ${updateError.message}`)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Inventory updated. Added ${quantity} items to product ${productId}.`,
        previousQuantity: currentQuantity,
        newQuantity
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error processing inventory update:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

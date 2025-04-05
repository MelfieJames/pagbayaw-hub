
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Failed to get user', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if it's a POST request with profile data to update
    if (req.method === 'POST') {
      try {
        const profileData = await req.json();
        
        // Create or update the profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            first_name: profileData.first_name || '',
            middle_name: profileData.middle_name || '',
            last_name: profileData.last_name || '',
            location: profileData.location || '',
            phone_number: profileData.phone_number || '',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .select();
          
        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update profile', details: updateError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ message: 'Profile updated', profile: updatedProfile }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid profile data', details: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GET request - fetch the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, middle_name, last_name, location, phone_number')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      // Create profile if it doesn't exist (and it's not another error)
      if (profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ 
            id: user.id,
            email: user.email,
            first_name: "",
            middle_name: "",
            last_name: "",
            location: "",
            phone_number: ""
          })
          .select('first_name, middle_name, last_name, location, phone_number')
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ error: 'Failed to create profile', details: createError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Profile created', profile: newProfile }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to get profile', details: profileError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If profile doesn't exist, create it
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({ 
          id: user.id,
          email: user.email,
          first_name: "",
          middle_name: "",
          last_name: "",
          location: "",
          phone_number: ""
        })
        .select('first_name, middle_name, last_name, location, phone_number')
        .single()

      if (createError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create profile', details: createError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Profile created', profile: newProfile }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Profile exists', profile }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

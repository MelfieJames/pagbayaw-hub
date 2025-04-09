
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

    console.log(`Processing request for user ID: ${user.id}`)

    // Check if it's a POST request with profile data to update
    if (req.method === 'POST') {
      try {
        const profileData = await req.json();
        console.log("Received profile data:", profileData);
        
        // Validate required fields
        if (!profileData.first_name || !profileData.first_name.trim()) {
          return new Response(
            JSON.stringify({ error: 'First name is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!profileData.last_name || !profileData.last_name.trim()) {
          return new Response(
            JSON.stringify({ error: 'Last name is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!profileData.location || !profileData.location.trim()) {
          return new Response(
            JSON.stringify({ error: 'Location is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!profileData.phone_number || !profileData.phone_number.trim()) {
          return new Response(
            JSON.stringify({ error: 'Phone number is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // First check if profile exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking profile:", checkError);
          return new Response(
            JSON.stringify({ error: 'Failed to check profile', details: checkError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        let profileOp;
        if (!existingProfile) {
          console.log("Profile doesn't exist, creating new profile");
          // Insert new profile
          profileOp = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              first_name: profileData.first_name,
              middle_name: profileData.middle_name || '',
              last_name: profileData.last_name,
              location: profileData.location,
              phone_number: profileData.phone_number,
              updated_at: new Date().toISOString()
            })
            .select();
        } else {
          console.log("Profile exists, updating profile");
          // Update existing profile
          profileOp = await supabase
            .from('profiles')
            .update({
              first_name: profileData.first_name,
              middle_name: profileData.middle_name || '',
              last_name: profileData.last_name,
              location: profileData.location,
              phone_number: profileData.phone_number,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select();
        }
        
        if (profileOp.error) {
          console.error("Error updating profile:", profileOp.error);
          return new Response(
            JSON.stringify({ error: 'Failed to update profile', details: profileOp.error }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!profileOp.data || profileOp.data.length === 0) {
          console.error("No data returned after profile operation");
          return new Response(
            JSON.stringify({ error: 'No data returned after profile operation' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log("Profile updated successfully:", profileOp.data[0]);
        return new Response(
          JSON.stringify({ message: 'Profile updated', profile: profileOp.data[0] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error("Error processing profile data:", error);
        return new Response(
          JSON.stringify({ error: 'Invalid profile data', details: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // For GET requests - fetch the profile
    console.log("Fetching profile for user ID:", user.id);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, middle_name, last_name, location, phone_number')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to get profile', details: profileError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If profile doesn't exist, create it
    if (!profile) {
      console.log("Profile doesn't exist, creating new profile");
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
        .single();

      if (createError) {
        console.error("Error creating profile:", createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create profile', details: createError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log("New profile created:", newProfile);
      return new Response(
        JSON.stringify({ message: 'Profile created', profile: newProfile }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Profile found:", profile);
    return new Response(
      JSON.stringify({ message: 'Profile exists', profile }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

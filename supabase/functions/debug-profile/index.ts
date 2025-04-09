
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://msvlqapipscspxukbhyb.supabase.co';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdmxxYXBpcHNjc3B4dWtiaHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MDMwODUsImV4cCI6MjA1MTQ3OTA4NX0.-n2HKDfTo-57F8vY0f03-2KUUzxegVYsZ6qOn5RSIe4';
    
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
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
        
        try {
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
          
          let profileResult;
          
          if (!existingProfile) {
            console.log("Profile doesn't exist, creating new profile");
            // Insert new profile
            const { data, error } = await supabase
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
              
            if (error) {
              console.error("Error creating profile:", error);
              throw error;
            }
            
            if (!data || data.length === 0) {
              console.error("No data returned after profile creation");
              throw new Error("No data returned after profile creation");
            }
            
            profileResult = data[0];
          } else {
            console.log("Profile exists, updating profile");
            // Update existing profile
            const { data, error } = await supabase
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
              
            if (error) {
              console.error("Error updating profile:", error);
              throw error;
            }
            
            if (!data || data.length === 0) {
              console.error("No data returned after profile update");
              throw new Error("No data returned after profile update");
            }
            
            profileResult = data[0];
          }
          
          console.log("Profile updated successfully:", profileResult);
          
          return new Response(
            JSON.stringify({ message: 'Profile updated', profile: profileResult }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (dbError) {
          console.error("Database error:", dbError);
          return new Response(
            JSON.stringify({ error: dbError.message || 'Database error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
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
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, middle_name, last_name, location, phone_number')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
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
          throw createError;
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
    } catch (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: dbError.message || 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

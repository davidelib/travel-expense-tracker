import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const authorization = request.headers.get('Authorization')
  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  try {
    const { tripId, email: rawEmail } = await request.json()
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : ''
    if (!tripId || !email) {
      return new Response(JSON.stringify({ error: 'tripId and email are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, { db: { schema: 'travel_expenses' } })
    const { data: trip, error: tripError } = await adminClient.from('trips').select('id, user_id').eq('id', tripId).single()
    if (tripError || !trip) {
      return new Response(JSON.stringify({ error: 'Trip not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (trip.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Only the trip owner can invite members' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: existingUser } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const invitee = existingUser?.users.find((candidate) => candidate.email?.toLowerCase() === email)
    if (invitee?.id === user.id) {
      return new Response(JSON.stringify({ error: 'You cannot invite yourself' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = crypto.randomUUID()
    const { error: inviteError } = await adminClient.from('trip_invitations').insert({
      trip_id: tripId,
      invited_email: email,
      token,
      invited_by: user.id,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    if (inviteError) {
      return new Response(JSON.stringify({ error: inviteError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const resendFrom = Deno.env.get('RESEND_FROM_EMAIL')
    const appUrl = Deno.env.get('APP_URL')
    if (!resendApiKey || !resendFrom || !appUrl) {
      return new Response(JSON.stringify({ error: 'The invitation was saved, but email delivery is not configured. Set RESEND_API_KEY, RESEND_FROM_EMAIL, and APP_URL.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const inviteUrl = `${appUrl.replace(/\/$/, '')}/?invite=${encodeURIComponent(token)}`
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: resendFrom,
        to: [email],
        subject: 'You have been invited to a shared trip',
        html: `<p>You have been invited to join a shared trip.</p><p><a href="${inviteUrl}">Accept invitation</a></p><p>This invitation expires in 7 days.</p>`,
      }),
    })
    if (!emailResponse.ok) {
      return new Response(JSON.stringify({ error: 'The invitation was saved, but sending the email failed.' }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to invite trip member' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

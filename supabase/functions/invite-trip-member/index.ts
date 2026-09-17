import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const authorization = request.headers.get('Authorization')
  if (!authorization) return jsonResponse({ error: 'Missing authorization' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  try {
    const rawBody = await request.text()
    let body: Record<string, unknown>

    try {
      body = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : {}
    } catch {
      return jsonResponse({ error: 'Request body must be valid JSON' }, 400)
    }

    // Accept both camelCase and snake_case to avoid client/deployment mismatches.
    const tripId = typeof body.tripId === 'string'
      ? body.tripId.trim()
      : typeof body.trip_id === 'string'
        ? body.trip_id.trim()
        : ''
    const emailValue = body.email ?? body.invited_email
    const email = typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : ''

    if (!tripId || !email) {
      return jsonResponse({
        error: 'tripId and email are required',
        received: {
          hasTripId: Boolean(tripId),
          hasEmail: Boolean(email),
          bodyKeys: Object.keys(body),
        },
      }, 400)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) return jsonResponse({ error: 'Invalid session' }, 401)

    if (!serviceRoleKey) return jsonResponse({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' }, 500)

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: 'travel_expenses' },
    })
    const { data: trip, error: tripError } = await adminClient
      .from('trips')
      .select('id, user_id')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) return jsonResponse({ error: 'Trip not found' }, 404)
    if (trip.user_id !== user.id) return jsonResponse({ error: 'Only the trip owner can invite members' }, 403)

    const { data: existingUser } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const invitee = existingUser?.users.find((candidate) => candidate.email?.toLowerCase() === email)
    if (invitee?.id === user.id) return jsonResponse({ error: 'You cannot invite yourself' }, 400)

    const token = crypto.randomUUID()
    const { error: inviteError } = await adminClient.from('trip_invitations').insert({
      trip_id: tripId,
      invited_email: email,
      token,
      invited_by: user.id,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    if (inviteError) return jsonResponse({ error: inviteError.message }, 500)

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const resendFrom = Deno.env.get('RESEND_FROM_EMAIL')
    const appUrl = Deno.env.get('APP_URL')
    if (!resendApiKey || !resendFrom || !appUrl) {
      return jsonResponse({
        error: 'The invitation was saved, but email delivery is not configured. Set RESEND_API_KEY, RESEND_FROM_EMAIL, and APP_URL.',
      }, 500)
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

    if (!emailResponse.ok) return jsonResponse({ error: 'The invitation was saved, but sending the email failed.' }, 502)
    return jsonResponse({ success: true })
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Failed to invite trip member' }, 500)
  }
})

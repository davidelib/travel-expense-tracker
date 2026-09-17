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
    console.log('[1] Parsing request body...')
    const rawBody = await request.text()
    let body: Record<string, unknown>

    try {
      body = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : {}
    } catch {
      console.log('[ERROR] Invalid JSON in request body')
      return jsonResponse({ error: 'Request body must be valid JSON' }, 400)
    }

    const tripId = typeof body.tripId === 'string' ? body.tripId.trim() : ''
    const emailValue = body.email ?? body.invited_email
    const email = typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : ''

    console.log(`[2] Received: tripId="${tripId}", email="${email}"`)

    if (!tripId || !email) {
      console.log('[ERROR] Missing tripId or email')
      return jsonResponse({ error: 'tripId and email are required' }, 400)
    }

    console.log('[3] Authenticating user...')
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError) {
      console.log(`[ERROR] Auth error: ${userError.message}`)
      return jsonResponse({ error: 'Invalid session' }, 401)
    }
    if (!user) {
      console.log('[ERROR] No user found')
      return jsonResponse({ error: 'Invalid session' }, 401)
    }

    console.log(`[4] User authenticated: ${user.id}`)

    if (!serviceRoleKey) {
      console.log('[ERROR] SUPABASE_SERVICE_ROLE_KEY not set')
      return jsonResponse({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' }, 500)
    }

    console.log('[5] Fetching trip...')
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: 'travel_expenses' },
    })
    const { data: trip, error: tripError } = await adminClient
      .from('trips')
      .select('id, user_id')
      .eq('id', tripId)
      .single()

    if (tripError) {
      console.log(`[ERROR] Trip fetch error: ${tripError.message}`)
      return jsonResponse({ error: 'Trip not found' }, 404)
    }
    if (!trip) {
      console.log('[ERROR] Trip not found')
      return jsonResponse({ error: 'Trip not found' }, 404)
    }

    console.log(`[6] Trip found. Owner: ${trip.user_id}, Current user: ${user.id}`)

    if (trip.user_id !== user.id) {
      console.log('[ERROR] User is not trip owner')
      return jsonResponse({ error: 'Only the trip owner can invite members' }, 403)
    }

    console.log('[7] Checking for existing users...')
    const { data: existingUser, error: listError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (listError) {
      console.log(`[ERROR] List users error: ${listError.message}`)
    }

    const invitee = existingUser?.users.find((candidate) => candidate.email?.toLowerCase() === email)
    if (invitee?.id === user.id) {
      console.log('[ERROR] User trying to invite themselves')
      return jsonResponse({ error: 'You cannot invite yourself' }, 400)
    }

    console.log('[8] Creating invitation token...')
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
      console.log(`[ERROR] Insert invitation error: ${inviteError.message}`)
      return jsonResponse({ error: `Failed to create invitation: ${inviteError.message}` }, 500)
    }

    console.log(`[9] Invitation created with token: ${token}`)

    console.log('[10] Checking email config...')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const resendFrom = Deno.env.get('RESEND_FROM_EMAIL')
    const appUrl = Deno.env.get('APP_URL')

    console.log(`[11] Config: hasApiKey=${Boolean(resendApiKey)}, hasFrom=${Boolean(resendFrom)}, hasUrl=${Boolean(appUrl)}`)

    if (!resendApiKey || !resendFrom || !appUrl) {
      console.log('[ERROR] Email config incomplete')
      return jsonResponse({
        error: 'The invitation was saved, but email delivery is not configured. Set RESEND_API_KEY, RESEND_FROM_EMAIL, and APP_URL.',
      }, 500)
    }

    console.log('[12] Building invite URL...')
    const inviteUrl = `${appUrl.replace(/\/$/, '')}/?invite=${encodeURIComponent(token)}`
    console.log(`[13] Invite URL: ${inviteUrl}`)

    console.log('[14] Sending email via Resend...')
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

    console.log(`[15] Resend response status: ${emailResponse.status}`)

    if (!emailResponse.ok) {
      const resendError = await emailResponse.text()
      console.log(`[ERROR] Resend error: ${resendError}`)
      return jsonResponse({ error: 'The invitation was saved, but sending the email failed.' }, 502)
    }

    console.log('[16] Email sent successfully')
    return jsonResponse({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.log(`[EXCEPTION] ${errorMessage}`)
    console.log(`[STACK] ${errorStack}`)
    return jsonResponse({ error: errorMessage }, 500)
  }
})

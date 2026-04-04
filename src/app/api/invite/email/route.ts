import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()

function inviteEmailHtml({
  inviterName,
  tripName,
  inviteLink,
}: {
  inviterName: string
  tripName: string
  inviteLink: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to ${tripName}</title>
</head>
<body style="margin:0;padding:0;background:#FFFCF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFCF7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1A1A3E;border-radius:16px;padding:12px 20px;">
                    <span style="font-family:Georgia,serif;font-weight:700;font-size:20px;color:#ffffff;letter-spacing:-0.02em;">Voypack</span>
                    <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#FF6B4A;margin-left:4px;vertical-align:middle;"></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:24px;border:1.5px solid rgba(26,26,62,0.08);box-shadow:0 4px 24px rgba(26,26,62,0.07);overflow:hidden;">

              <!-- Top accent bar -->
              <div style="height:4px;background:linear-gradient(90deg,#FF6B4A,#FF9A7A);"></div>

              <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 40px 36px;">

                <!-- Emoji -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="width:64px;height:64px;background:#FFF0EB;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;line-height:64px;text-align:center;">✈️</div>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1A1A3E;letter-spacing:-0.02em;line-height:1.2;">You're invited!</h1>
                  </td>
                </tr>

                <!-- Subtext -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:15px;color:#5C5C7A;line-height:1.6;">
                      <strong style="color:#1A1A3E;">${inviterName}</strong> has invited you to join
                      <strong style="color:#FF6B4A;">${tripName}</strong> on Voypack.<br/>
                      Vote on dates, pick a destination, and plan together.
                    </p>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${inviteLink}"
                      style="display:inline-block;background:#FF6B4A;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:9999px;box-shadow:0 8px 24px rgba(255,107,74,0.30);letter-spacing:0.01em;">
                      Join the trip →
                    </a>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <div style="height:1px;background:rgba(26,26,62,0.07);"></div>
                  </td>
                </tr>

                <!-- Link fallback -->
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;font-size:12px;color:#9898B0;">Or copy this link into your browser:</p>
                    <p style="margin:0;font-size:12px;color:#5C5C7A;word-break:break-all;font-family:'Courier New',monospace;">${inviteLink}</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:11px;color:#9898B0;line-height:1.7;">
                Voypack · Free to plan. Always.<br/>
                You received this because someone invited you to a trip.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Validate token + get user name
  const authClient = createClient(SUPABASE_URL, ANON_KEY)
  const { data: { user } } = await authClient.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const inviterName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Someone'

  const { emails, tripName, inviteLink } = await request.json()
  if (!emails?.length || !tripName || !inviteLink) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const results = await Promise.allSettled(
    emails.map((to: string) =>
      resend.emails.send({
        from: 'Voypack <invite@voypack.in>',
        to,
        subject: `${inviterName} invited you to ${tripName} on Voypack`,
        html: inviteEmailHtml({ inviterName, tripName, inviteLink }),
      })
    )
  )

  const failed = results
    .map((r, i) => ({ email: emails[i], ok: r.status === 'fulfilled' }))
    .filter(r => !r.ok)
    .map(r => r.email)

  return NextResponse.json({ ok: true, failed })
}

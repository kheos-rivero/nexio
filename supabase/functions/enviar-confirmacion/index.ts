import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cliente_nombre, cliente_email, negocio_nombre, servicio_nombre, fecha, hora } = await req.json()

    if (!cliente_email) {
      return new Response(JSON.stringify({ error: 'Email requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Nexio <onboarding@resend.dev>',
        to: [cliente_email],
        subject: `Reserva confirmada - ${negocio_nombre}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
            <h2 style="color: #1E1B4B; margin: 0 0 0.5rem;">Reserva recibida</h2>
            <p style="color: #64748B; margin: 0 0 2rem;">Hola ${cliente_nombre}, tu reserva ha sido registrada correctamente.</p>
            <div style="background: #F8FAFC; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
              <p style="margin: 0 0 0.5rem; font-size: 0.8rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">Detalles de tu reserva</p>
              <p style="margin: 0 0 0.25rem; font-weight: 600; color: #1E293B;">${negocio_nombre}</p>
              <p style="margin: 0 0 0.25rem; color: #475569;">${servicio_nombre}</p>
              <p style="margin: 0; color: #475569;">${fecha} - ${hora}</p>
            </div>
            <p style="color: #94A3B8; font-size: 0.875rem; margin: 0;">
              El negocio se pondra en contacto contigo para confirmar la cita.
            </p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 2rem 0;" />
            <p style="color: #CBD5E1; font-size: 0.75rem; margin: 0; text-align: center;">
              Gestionado con nexio
            </p>
          </div>
        `
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
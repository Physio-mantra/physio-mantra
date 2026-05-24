// api/submit.js (Netlify Serverless Function)
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    
    try {
        const body = JSON.parse(event.body);
        const { name, phone, address, visit_type, service, preferred_date, preferred_time, notes } = body;
        
        if (!name || !phone || !address || !visit_type || !service || !preferred_date || !preferred_time) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
        }
        
        // Insert into Supabase
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/requests`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                name,
                phone,
                address,
                visit_type,
                service,
                preferred_date,
                preferred_time,
                notes: notes || '',
                status: 'new',
                created_at: new Date().toISOString()
            })
        });
        
        if (!insertResponse.ok) {
            throw new Error('Failed to insert into Supabase');
        }
        
        // Send Telegram notification (fire and forget)
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;
        if (telegramToken && telegramChatId) {
            const message = `🆕 <b>New Physio मंत्र Request</b>\n\n👤 <b>Name:</b> ${name}\n📞 <b>Phone:</b> ${phone}\n📍 <b>Address:</b> ${address}\n🏠 <b>Visit Type:</b> ${visit_type}\n💊 <b>Service:</b> ${service}\n📅 <b>Date:</b> ${preferred_date}\n🕐 <b>Time:</b> ${preferred_time}\n📝 <b>Notes:</b> ${notes || 'None'}\n\n⏰ <b>Submitted:</b> ${new Date().toLocaleString('en-IN')}`;
            
            fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: telegramChatId, parse_mode: 'HTML', text: message })
            }).catch(err => console.error('Telegram error:', err));
        }
        
        // Send email notification via Resend (fire and forget)
        const resendKey = process.env.RESEND_API_KEY;
        const adminEmail = process.env.ADMIN_EMAIL;
        if (resendKey && adminEmail) {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #C8622A;">New Physio मंत्र Request</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Name:</strong></td><td style="padding: 8px;">${name}</td></tr>
                        <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Phone:</strong></td><td style="padding: 8px;">${phone}</td></tr>
                        <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Address:</strong></td><td style="padding: 8px;">${address}</td></tr>
                        <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Visit Type:</strong></td><td style="padding: 8px;">${visit_type}</td></tr>
                        <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Service:</strong></td><td style="padding: 8px;">${service}</td></tr>
                        <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Preferred Date:</strong></td><td style="padding: 8px;">${preferred_date}</td></tr>
                        <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Preferred Time:</strong></td><td style="padding: 8px;">${preferred_time}</td></tr>
                        <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Notes:</strong></td><td style="padding: 8px;">${notes || 'None'}</td></tr>
                    </table>
                </div>
            `;
            
            fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Physio मंत्र <noreply@physiomantra.in>',
                    to: [adminEmail],
                    subject: `New Request — ${name} — ${service}`,
                    html: emailHtml
                })
            }).catch(err => console.error('Resend error:', err));
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Request received successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error', message: error.message })
        };
    }
};
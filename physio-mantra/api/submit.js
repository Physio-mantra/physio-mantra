module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { name, phone, address, visit_type, service, preferred_date, preferred_time, notes } = req.body;
        
        // Validate required fields
        if (!name || !phone || !address || !visit_type || !service || !preferred_date || !preferred_time) {
            return res.status(400).json({ error: 'Missing required fields' });
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
        
        return res.status(200).json({ success: true, message: 'Request received successfully' });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};
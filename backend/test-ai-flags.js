require('dotenv').config();
const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'test-backend' });
});

// Simple AI flags test route
app.get('/api/admin/ai-flags', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://sjkonmnratfouliovoes.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqa29ubW5yYXRmb3VsaW92b2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NzgwMDEsImV4cCI6MjEwNDQ1NDAwMX0.ppA8EqYl6PmoXivtmVFhoxzzTFpl-PLZRj30pqDPbG4'
    );
    
    const { data, error } = await supabase.from('ai_flags').select('*').order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('AI flags fetched:', data?.length ?? 0);
    res.json({ flags: data ?? [] });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Test backend running on port ${PORT}`);
});
require('dotenv').config();
const config = require('./src/config');
console.log('Config OK:', typeof config.supabase);
console.log('Supabase URL:', config.supabase.url);
console.log('Supabase Anon Key:', config.supabase.anonKey ? 'present' : 'missing');
console.log('Service Role Key:', config.supabase.serviceKey ? 'present' : 'missing');
console.log('CORS allowAll:', config.cors.allowAll);
console.log('CORS origins:', config.cors.origins);
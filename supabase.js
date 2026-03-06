const SUPABASE_URL = 'https://lqujarddqwbpcnpqychc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdWphcmRkcXdicGNucHF5Y2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTMwODIsImV4cCI6MjA4ODM4OTA4Mn0.T-1cQvckiPKq8nX3rqLfMkmjm9-DwjyeywDTHN6-Rms';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
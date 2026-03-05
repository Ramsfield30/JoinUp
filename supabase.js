const SUPABASE_URL = 'https://qmcjuwmqicdbuefxvfta.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtY2p1d21xaWNkYnVlZnh2ZnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Mjc1MzEsImV4cCI6MjA4ODIwMzUzMX0.CeLSsqV6m69N_48MiFibXGk-NRDuByweiczE5NN6FEs';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
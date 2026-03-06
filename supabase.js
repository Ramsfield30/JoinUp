const SUPABASE_URL = 'https://gjdnkxonwdncksabmzty.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZG5reG9ud2RuY2tzYWJtenR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NDI5NzYsImV4cCI6MjA4ODMxODk3Nn0.zECDi6zm776FPM5MWFq3QpzgbZ9f9FLh8tIli74aokY';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
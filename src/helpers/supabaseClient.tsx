import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://coyqqljvrqspcnxjhohk.supabase.co";

const supabaseAnonkey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNveXFxbGp2cnFzcGNueGpob2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTAxNzQsImV4cCI6MjA2NTM4NjE3NH0.kZ_QfOLx4tea-hiPgBQUuBexmU9brcDW2DnY-x506_c";

// const supabaseUrl = "https://dxgdrckdqjvbybhekcgc.supabase.co";

// const supabaseAnonkey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2RyY2tkcWp2YnliaGVrY2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjMyNzIsImV4cCI6MjA2NTUzOTI3Mn0.-u_vcpp9jrYl818_hKIl5PSXmiEtuEGqVO7-bmBH7V8";

const supabase = createClient(supabaseUrl, supabaseAnonkey);

export default supabase;
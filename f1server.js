const express = require('express'); 
const supa = require('@supabase/supabase-js'); 
const app = express(); 
 
const supaUrl = 'https://yqreijpcopwdytpyjcli.supabase.co'; 
const supaAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcmVpanBjb3B3ZHl0cHlqY2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0NjU0NDcsImV4cCI6MjAyMzA0MTQ0N30.EgR1kdtciSUWqlAODYFuTpi9Wco63UU3TEIyoG6AAO8'; 
 
const supabase = supa.createClient(supaUrl, supaAnonKey);
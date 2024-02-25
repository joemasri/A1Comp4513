const express = require('express'); 
const supa = require('@supabase/supabase-js'); 
const app = express(); 
 
const supaUrl = 'https://yqreijpcopwdytpyjcli.supabase.co'; 
const supaAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcmVpanBjb3B3ZHl0cHlqY2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0NjU0NDcsImV4cCI6MjAyMzA0MTQ0N30.EgR1kdtciSUWqlAODYFuTpi9Wco63UU3TEIyoG6AAO8'; 
 
const supabase = supa.createClient(supaUrl, supaAnonKey);

// Returns all data in seasons table
app.get('/api/seasons', async (req, res) => { 
    const {data, error} = await supabase 
    .from('seasons') 
    .select(); 
    res.send(data); 
});

// Returns all data in circuits table
app.get('/api/circuits', async (req, res) => { 
    const {data, error} = await supabase 
    .from('circuits') 
    .select(); 
    res.send(data); 
});

// Return specified circuitRef field
app.get('/api/circuits/:ref', async (req, res) => {
    const { data, error } = await supabase
    .from('circuits')
    .select()
    .eq('circuitRef', req.params.ref);
    
    if (data && data.length > 0) {
        res.send(data);
    } else {
        res.json({error: `circuit '${req.params.ref}' not found`});
    }
})

// Return circuits used in a given season (ascending order)
app.get('/api/circuits/season/:year', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select(`round, circuits!inner(*)`)
    .eq('year', req.params.year)
    .order('round', { ascending: true });
    
    if (data && data.length > 0) {
        res.send(data);
    } else {
        res.json({error: `year '${req.params.year}' not found`});
    }
})

// Returns all constructors
app.get('/api/constructors', async (req, res) => { 
    const {data, error} = await supabase 
    .from('constructors') 
    .select(); 
    res.send(data); 
});




// Server Listening   
app.listen(8080, () => { 
    console.log('listening on port 8080'); 
    console.log('http://localhost:8080/f1/status'); 
}); 
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
    
    // Check for errors
    handleError(error, data, res, `Circuit '${req.params.ref}' not found`);
})

// Return circuits used in a given season (ascending order)
app.get('/api/circuits/season/:year', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select(`round, circuits!inner(*)`)
    .eq('year', req.params.year)
    .order('round', { ascending: true });
    
    // Check for errors
    handleError(error, data, res, `Year '${req.params.year}' not found`);
})

// Returns all constructors
app.get('/api/constructors', async (req, res) => { 
    const {data, error} = await supabase 
    .from('constructors') 
    .select(); 
    res.send(data); 
});

// Return specified constructors ref
app.get('/api/constructors/:ref', async (req, res) => {
    const { data, error } = await supabase
    .from('constructors')
    .select()
    .eq('constructorRef', req.params.ref);
    
    // Check for errors
    handleError(error, data, res, `Constructor ref '${req.params.ref}' not found`);
})

// Returns all drivers
app.get('/api/drivers', async (req, res) => { 
    const {data, error} = await supabase 
    .from('drivers') 
    .select(); 
    res.send(data); 
});

// Return specified driverRef field
app.get('/api/drivers/:ref', async (req, res) => {
    const { data, error } = await supabase
    .from('drivers')
    .select()
    .eq('driverRef', req.params.ref);
    
    // Check for errors
    handleError(error, data, res, `Driver '${req.params.ref}' not found`);
})

// Return driver whose surnmane begins with provided substring
app.get('/api/drivers/search/:substring', async (req, res) => {
    const { data, error } = await supabase
    .from('drivers')
    .select()
    .ilike('surname', `${req.params.substring}%`);
    
    // Check for errors
    handleError(error, data, res, `Driver starting with surname '${req.params.substring}' not found`);
})

// Return drivers within a given raceId
app.get('/api/drivers/race/:raceId', async (req, res) => {
    const { data, error } = await supabase
    .from('results')
    .select(`drivers(forename, surname, dob)`)
    .eq('raceId', req.params.raceId);
    
    // Check for errors
    handleError(error, data, res, `Race ID:'${req.params.raceId}' not found`);
})

// Return just specified race
app.get('/api/races/:raceId', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select(`circuits(name, location, country)`)
    .eq('raceId', req.params.raceId);
    
    // Check for errors
    handleError(error, data, res, `Race ID:'${req.params.raceId}' not found`);
})

// Return specified driverRef field
app.get('/api/races/season/:year', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select()
    .eq('year', req.params.year)
    .order('round', { ascending: true })
    
    // Check for errors
    handleError(error, data, res, `Races for season '${req.params.year}' not found`);
})

// Return specific race within a given season, specified by round number
app.get('/api/races/season/:year/:round', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select()
    .eq('year', req.params.year)
    .eq('round', req.params.round);

    // Check for errors
    handleError(error, data, res, `No race found for year '${req.params.year}' and round '${req.params.round}'`);
})

// Return all races for a given circuit
app.get('/api/races/circuits/:ref', async (req, res) => {
    const { data, error } = await supabase
        .from('circuits')
        .select('races(url, date, name, year, round, raceId, circuitId)')
        .eq('circuitRef', req.params.ref)
        .order('year', {
            referencedTable: 'races', 
            ascending: true});

    // Check for errors
    handleError(error, data, res, `No races found for circuit '${req.params.ref}'`);
});


// Return all races for given circuit between two years
app.get('/api/races/circuits/:ref/season/:start/:end', async (req, res) => {

const startYear = req.params.start;
const endYear = req.params.end;

const { data, error } = await supabase
    .from('circuits')
    .select(`races(year, round, name, date, time, url), name, location, country`)
    .gte('races.year', startYear)
    .lte('races.year', endYear)

    if(startYear > endYear) {
        res.json({error: "Start year cannot be greater than end year"})
    }

    // Check for errors
    handleError(error, data, res, `No races found for circuit '${req.params.ref}' between years ${req.params.start} and ${req.params.end}`);
})

// Return results for specified race
app.get('/api/results/:raceId', async (req, res) => {
        const { data, error } = await supabase
            .from('results')
            .select(`
                drivers(driverRef, code, forename, surname), 
                races(name, round, year, date), 
                constructors(name, constructorRef, nationality), 
                grid, position, positionText, points, laps`)
            .eq('raceId', req.params.raceId)
            .order('grid', { ascending: true });

        // Check for errors
        handleError(error, data, res, `No results found for race ID '${req.params.raceId}'`);
});


// Return all results for a given driver
app.get('/api/results/driver/:ref', async (req, res) => {
    const { data, error } = await supabase
    .from('results')
    .select(`*, drivers!inner(driverRef)`)
    .eq('drivers.driverRef', req.params.ref);

    // Check for errors
    handleError(error, data, res, `No results found for driver '${req.params.ref}'`);
})


// Return all results for a given driver between two years
app.get('/api/results/drivers/:ref/seasons/:start/:end', async (req, res) => {
    
        const startYear = req.params.start;
        const endYear = req.params.end;

        const { data, error } = await supabase
            .from('results')
            .select(`*, drivers!inner(driverRef), races!inner(year)`)            
            .eq('drivers.driverRef', req.params.ref)
            .lte('races.year', endYear)
            .gte('races.year', startYear);

        // Check for errors
        handleError(error, data, res, `No results found for driver '${req.params.ref}' between years ${startYear} and ${endYear}`);
});

// Returns qualifying results for specified race
app.get('/api/qualifying/:raceId', async (req, res) => {
    
        const raceId = req.params.raceId;
        const { data, error } = await supabase
            .from('qualifying')
            .select(`raceId, driverId, constructorId, 
            drivers(driverRef, code, forename, surname),
            races(name, round, year, date),
            constructors(name, constructorRef, nationality)
            `)
            .eq('raceId', raceId)
            .order('position', { ascending: true }); 

        handleError(error, data, res, `Qualifying results with raceId: '${raceId}' not found`);
});

// Returns current season driver standings table for specified race
app.get('/api/standings/:raceId/drivers', async (req, res) => {
    
        const raceId = req.params.raceId;
        const { data, error } = await supabase
            .from('driverStandings')
            .select('*, drivers!inner(driverRef)')
            .eq('raceId', raceId)
            .order('position', { ascending: true });

        // Check for errors
        handleError(error, data, res, `Standings with raceId: '${raceId}' not found`);
});

// Returnss current season constructors standings table for specified race
app.get('/api/standings/:raceId/constructors', async (req, res) => {
    
        const raceId = req.params.raceId;
        const { data, error } = await supabase
            .from('constructorStandings')
            .select(`raceId, constructorId, position, wins, 
                    constructors(name, constructorRef, nationality)`)
            .eq('raceId', raceId)
            .order('position', { ascending: true }); 

        // Check for errors
        handleError(error, data, res, `No standings found for race with id '${raceId}'`);
});

// Handles error
const handleError = (error, data, res, errMessage = null) => {
    if (error) {
        throw error;
    } else if (data && data.length > 0) {
        res.send(data);
    } else {
        const errorMessage = errMessage || 'No data found';
        res.status(404).json({ error: errorMessage });
    }
}

// Server Listening   
app.listen(8080, () => { 
    console.log('listening on port 8080'); 
    console.log('http://localhost:8080/f1/status'); 
}); 
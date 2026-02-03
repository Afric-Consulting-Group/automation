/**
 * Football Live Score Worker
 * Monitors live football matches and sends notifications
 */

require('total5');

const worker = NEWFORK();

// rewrite worker.send to make the message is stringified first

// Worker configuration
const WORKER_NAME = 'football-livescore';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const FIXTURE_CHECK_INTERVAL = 30000; // 1 minute
const LIVE_SCORE_INTERVAL = 15000; // 15 seconds
const EVENT_CHECK_INTERVAL = 10000; // 10 seconds

// Worker state
let state = {
    isRunning: false,
    isPaused: false,
    config: {},
    activeMatches: new Map(),
    processedEvents: new Set(),
    stats: {
        matchesProcessed: 0,
        eventsProcessed: 0,
        notificationsSent: 0,
        errors: 0
    }
};

// Initialize worker
async function init() {
    try {
        // Load configuration from database
        await loadConfig();
        
        // Register worker status
        await registerWorker();
        
        // Start heartbeat
        startHeartbeat();
        
        // Start main loops
        if (state.config.power === 'on' || state.config.testmode === 'on') {
            state.isRunning = true;
            startFixtureMonitor();
            startLiveScoreMonitor();
            startScheduledTasks();
        }
        
        await log('info', 'Worker initialized successfully');
    } catch (err) {
        await log('error', 'Worker initialization failed', { error: err.message });
        throw err;
    }
}

// Load configuration from database
async function loadConfig() {
    return new Promise((resolve, reject) => {
        QB.find('config').callback((err, response) => {
            if (err) return reject(err);
            state.config = {};
            response.forEach(cfg => {
                state.config[cfg.name] = cfg.value;
            });
            
            resolve(state.config);
        });
    });
}

// Register worker in database
async function registerWorker() {
    return new Promise(async (resolve, reject) => {

        // Insert or update worker status
        let status = await QB.read('worker_status')
            .where('worker_name', WORKER_NAME)
            .promise();
            !status && QB.insert('worker_status', {
            worker_name: WORKER_NAME,
            status: 'running',
            last_heartbeat: new Date(),
            stats: state.stats
        }).callback((err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
}

// Heartbeat to show worker is alive
function startHeartbeat() {
    setInterval(async () => {
        try {
            await new Promise((resolve, reject) => {
                QB.modify('worker_status', {
                    last_heartbeat: new Date(),
                    stats: state.stats,
                    status: state.isPaused ? 'paused' : 'running'
                }).where('worker_name', WORKER_NAME).callback((err, response) => {
                    if (err) return reject(err);
                    resolve(response);
                });
            });
        } catch (err) {
            await log('error', 'Heartbeat failed', { error: err.message });
        }
    }, HEARTBEAT_INTERVAL);
}

// Fixture monitor - fetches and stores fixtures
function startFixtureMonitor() {
    const checkTime = () => {
        const now = new Date();
        const currentTime = now.format('HH:mm');
        
        // Check if it's time to fetch fixtures
        if (currentTime === state.config.fixture_time) {
            fetchAndStoreFixtures();
        }

        state.config.testmode === 'on' && fetchAndStoreFixtures();
    };
    
    setInterval(checkTime, FIXTURE_CHECK_INTERVAL);
}

// Fetch fixtures from API
async function fetchAndStoreFixtures() {
    try {
        await log('info', 'Fetching fixtures');
        
        REQUEST({
            url: state.config.fixtures_url,
            query: {
                key: state.config.api_key,
                secret: state.config.api_secret,
                competition_id: state.config.competition_id,
                date: 'today'
            }, 
            callback: async function(err, response) {
                log('info', 'Fixtures fetched', { response: response });
                if (err) {
                    log('error', 'Failed to fetch fixtures', { error: err.message });
                    state.stats.errors++;
                    return;
                }

                const data = response.body;
                const fixtures = data.data.fixtures;
                if (!fixtures || fixtures.length === 0) {
                    await log('warn', 'No fixtures found');
                    return;
                }
                
                // Store fixtures
                for (const fixture of fixtures) {
                    await storeFixture(fixture);
                }
                
                await log('info', `Stored ${fixtures.length} fixtures`);
                
                // Send daily summary
                await sendDailySummary();

            }
        });
        
    } catch (err) {
        state.stats.errors++;
        await log('error', 'Failed to fetch fixtures', { error: err.message });
    }
}

// Store individual fixture
async function storeFixture(fixture) {
    return new Promise(async (resolve, reject) => {
        const match = {
            fixture_id: fixture.id,
            homeid_awayid: `${fixture.home_id}_${fixture.away_id}`,
            time: fixture.time,
            home_name: fixture.home_name,
            away_name: fixture.away_name,
            away_id: fixture.away_id,
            home_id: fixture.home_id,
            date: new Date().format('yyyy-MM-dd')
        };

        let response = await QB.read('matches', match)
            .where('fixture_id', fixture.id)
            .promise();

        !response && QB.insert('matches', match)
            .callback((err, response) => {
                if (err) return reject(err);
                
                state.stats.matchesProcessed++;
                worker.send({
                    type: 'match_stored',
                    data: { fixture, match }
                });
                
                resolve(response);
            });
    });
}

// Send daily summary
async function sendDailySummary() {
    return new Promise((resolve, reject) => {
        QB.find('matches')
            .where('date', new Date().format('yyyy-MM-dd'))
            .callback(async (err, matches) => {
                if (err) return reject(err);
                if (matches.length > 0) {
                    await queueNotification('daily_matches', { matchs: matches });
                }
                resolve();
            });
    });
}

// Live score monitor - checks match status
function startLiveScoreMonitor() {
    setInterval(async () => {
        if (!state.isRunning || state.isPaused) return;
        
        try {
            await checkLiveScores();
        } catch (err) {
            state.stats.errors++;
            await log('error', 'Live score check failed', { error: err.message });
        }
    }, LIVE_SCORE_INTERVAL);
}

// Check live scores
async function checkLiveScores() {
    REQUEST({
        url: state.config.live_score_url,
        query: {
            key: state.config.api_key,
            secret: state.config.api_secret,
            competition_id: state.config.competition_id
        },
        callback: async function(err, response) {
            log('info', 'Live scores fetched', { statusCode: response.statusCode });    
            if (err) {
                log('error', 'Failed to fetch live scores', { error: err.message });
                state.stats.errors++;
                return;
            }

            const data = response.body;

            if (!data.data || !data.data.match) {
                await log('warn', 'No live matches');
                return;
            }
            const matches = Array.isArray(data.data.match) ? data.data.match : [data.data.match];
            // Process each match based on status
            for (const match of matches) {
                await processMatchStatus(match);
            }
        }
    });
}

// Process match based on status
async function processMatchStatus(match) {
    const status = match.status;
    
    switch (status) {
        case 'NOT STARTED':
            await handleNotStarted(match);
            break;
        case 'IN PLAY':
            await handleInPlay(match);
            break;
        case 'ADDED TIME':
            await handleAddedTime(match);
            break;
        case 'HALF TIME BREAK':
            await handleHalfTime(match);
            break;
        case 'FINISHED':
            await handleFinished(match);
            break;
        default:
            await log('debug', 'Unknown match status', { status, match });
    }
}

// Handle NOT STARTED status - check if starting soon
async function handleNotStarted(match) {
    const scheduledTime = match.scheduled.parseDate();
    const warningTime = scheduledTime.add('-5 minutes');
    const now = new Date();
    
    if (now.format('HH:mm') === warningTime.format('HH:mm')) {
        const uniqueKey = `${match.id}_${match.fixture_id}`;
        
        // Check if already notified
        const exists = await checkEventExists('match_events_notstarted', uniqueKey);
        if (exists) return;
        
        // Store event
        await storeMatchEvent('match_events_notstarted', match, 'notstarted', uniqueKey);
        
        // Queue notification
        await queueNotification('match_starting_soon', match);
    }
}

// Handle IN PLAY status - monitor events
async function handleInPlay(match) {
    const uniqueKey = `${match.id}_${match.fixture_id}`;
    
    // Check if we've sent "started" notification
    const started = await checkEventExists('match_events_started', uniqueKey);
    if (!started) {
        await storeMatchEvent('match_events_started', match, 'started', uniqueKey);
        await queueNotification('match_started', match);
    }
    
    // Track this as active match
    state.activeMatches.set(match.id, match);
    
    // Fetch and process events
    if (match.events && match.events.isURL()) {
        await processMatchEvents(match);
    }
}

// Handle ADDED TIME status
async function handleAddedTime(match) {
    const uniqueKey = `${match.id}_${match.fixture_id}`;
    
    const exists = await checkEventExists('match_events_addedtime', uniqueKey);
    if (!exists) {
        await storeMatchEvent('match_events_addedtime', match, 'addedtime', uniqueKey);
        await queueNotification('added_time', match);
    }
}

// Handle HALF TIME status
async function handleHalfTime(match) {
    const uniqueKey = `${match.id}_${match.fixture_id}`;
    
    const exists = await checkEventExists('match_events_halftime', uniqueKey);
    if (!exists) {
        await storeMatchEvent('match_events_halftime', match, 'halftime', uniqueKey);
        await queueNotification('halftime', match);
    }
}

// Handle FINISHED status
async function handleFinished(match) {
    const uniqueKey = `${match.id}_${match.fixture_id}`;
    
    const exists = await checkEventExists('match_events_finished', uniqueKey);
    if (!exists) {
        await storeMatchEvent('match_events_finished', match, 'finished', uniqueKey);
        await queueNotification('match_finished', match);
        
        // Remove from active matches
        state.activeMatches.delete(match.id);
    }
}

// Process match events (goals, cards, etc.)
async function processMatchEvents(match) {
    try {
        REQUEST({
            url: state.config.events_url,
            query: {
                key: state.config.api_key,
                secret: state.config.api_secret,
                id: match.id
            },
            callback: async function(err, response) {
                log('info', 'Match events fetched', { matchId: match.id, statusCode: response.statusCode });        
                if (err) {
                    log('error', 'Failed to fetch match events', { matchId: match.id, error: err.message });
                    state.stats.errors++;
                    return;
                }   
                
                const data = response.body;
                if (!data.data || !data.data.event) return;
                
                const events = data.data.event;
                
                // Get previously stored events
                const storedEvents = await getStoredEvents(match.id);
                
                // Find new events
                const newEvents = events.filter(e => {
                    const eventKey = `${e.id}_${match.id}`;
                    return !state.processedEvents.has(eventKey);
                });
                
                // Process new events
                for (const event of newEvents) {
                    await processLiveEvent(event, match);
                }
            }
        });
        
    } catch (err) {
        await log('error', 'Failed to process match events', { 
            matchId: match.id, 
            error: err.message 
        });
    }
}

// Get stored events for a match
async function getStoredEvents(matchId) {
    return new Promise((resolve, reject) => {
        QB.find('live_events')
            .where('match_id', matchId)
            .where('date', new Date().format('yyyy-MM-dd'))
            .callback((err, response) => {
                if (err) return reject(err);
                resolve(response || []);
            });
    });
}

// Process individual live event
async function processLiveEvent(event, match) {
    const uniqueKey = `${event.id}_${match.id}`;
    
    // Check if already processed
    if (state.processedEvents.has(uniqueKey)) return;
    
    // Store event
    await storeLiveEvent(event, match, uniqueKey);
    
    // Mark as processed
    state.processedEvents.add(uniqueKey);
    state.stats.eventsProcessed++;
    
    // Queue notification based on event type
    const eventData = {
        ...event,
        match: {
            id: match.id,
            home_name: match.home_name,
            away_name: match.away_name,
            score: match.score,
            time: match.time,
            status: match.status
        }
    };
    
    switch (event.event) {
        case 'GOAL':
            await queueNotification('goal', eventData);
            break;
        case 'GOAL_PENALTY':
            await queueNotification('goal_penalty', eventData);
            break;
        case 'YELLOW_CARD':
            await queueNotification('yellow_card', eventData);
            break;
        case 'RED_CARD':
            await queueNotification('red_card', eventData);
            break;
        case 'SUBSTITUTION':
            await queueNotification('substitution', eventData);
            break;
        default:
            await log('debug', 'Unhandled event type', { event: event.event });
    }
    
    // Send realtime update to parent
    worker.send({
        type: 'live_event',
        data: eventData
    });
}

// Store match event
async function storeMatchEvent(table, match, eventName, uniqueKey) {
    return new Promise(async (resolve, reject) => {
        const data = {
            unique_key: uniqueKey,
            event_name: eventName,
            match_id: match.id,
            date: new Date().format('yyyy-MM-dd'),
            home_name: match.home_name,
            away_name: match.away_name,
            homeid_awayid: `${match.home_id}_${match.away_id}`,
            score: match.score
        };

        // try to read first
        let response = await QB.read(table)
            .where('unique_key', uniqueKey)
            .promise();     
        
        !response && QB.insert(table, data)
            .callback((err, response) => {
                if (err) return reject(err);
                resolve(response);
            });
    });
}

// Store live event
async function storeLiveEvent(event, match, uniqueKey) {
    return new Promise(async (resolve, reject) => {
        const data = {
            unique_key: uniqueKey,
            external_id: event.id,
            match_id: match.id,
            player: event.player,
            time: event.time,
            event: event.event,
            sort: event.sort,
            home_away: event.home_away,
            info: event.info,
            date: new Date().format('yyyy-MM-dd'),
            homeid_awayid: `${match.home_id}_${match.away_id}`,
            match_data: match
        };

        // try to read first
            let response = await QB.read('live_events')  
            .where('unique_key', uniqueKey)
            .promise();     
        
        !response && QB.insert('live_events', data)
            .callback((err, response) => {
                if (err) return reject(err);
                resolve(response);
            });
    });
}

// Check if event exists
async function checkEventExists(table, uniqueKey) {
    return new Promise((resolve, reject) => {
        QB.find(table)
            .where('unique_key', uniqueKey)
            .callback((err, response) => {
                if (err) return reject(err);
                resolve(response && response.length > 0);
            });
    });
}

// Queue notification
async function queueNotification(templateName, data) {
    return new Promise((resolve, reject) => {
        // Get template
        QB.find('message_templates')
            .where('name', templateName)
            .where('active', true)
            .callback((err, templates) => {
                if (err) return reject(err);
                
                if (!templates || templates.length === 0) {
                    log('warn', `Template not found: ${templateName}`);
                    return resolve();
                }
                
                const template = templates[0];
                
                // Render template
                const rendered = VIEWCOMPILE(template.template, data);
                
                // Queue notification
                QB.insert('notification_queue', {
                    template: rendered,
                    data: data,
                    date: new Date().format('yyyy-MM-dd'),
                    sent: false
                }).callback((err, response) => {
                    if (err) return reject(err);
                    // Send notification immediately
                    sendNotification(rendered);
                    resolve(response);
                });
            });
    });
}

// Mark notification as sent in the database
async function markNotificationSent(content) {
    return new Promise((resolve, reject) => {
        QB.modify('notification_queue', {
            sent: true,
            sent_at: new Date()
        }).where('template', content).where('sent', false).callback((err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
}

// Send notification via SMS
async function sendNotification(content) {
    try {
        REQUEST({
            url: state.config.sms_endpoint,
            query: {
                content: content,
                from: state.config.sms_from,
                cible: state.config.sms_target
            }, 
            callback: async function(err, response) {
                log('info', 'Notification sent', { statusCode: response.statusCode });
                if (err) {
                    log('error', 'Failed to send notification', { error: err.message });
                    state.stats.errors++;
                    return;
                }
                await markNotificationSent(content);
            }
        });

        state.stats.notificationsSent++;
        
        worker.send({
            type: 'notification_sent',
            data: { content }
        });
        
    } catch (err) {
        await log('error', 'Failed to send notification', { error: err.message });
    }
}

// Scheduled tasks
function startScheduledTasks() {
    setInterval(() => {
        const now = new Date().format('HH:mm');
        
        // Morning program
        if (now === state.config.morning_program) {
            sendDailySummary();
        }
    }, 60000);
}

// Logging function
async function log(level, message, data = {}) {
    console.log(`[${level.toUpperCase()}] ${message}`, data);
    return new Promise((resolve, reject) => {
        QB.insert('worker_logs', {
            worker_name: WORKER_NAME,
            event_type: level,
            message: message,
            data: data,
            level: level
        }).callback((err, response) => {

            // log error to console as well
            if (err) return reject(err);
            
            // Send to parent for realtime display
            worker.send({
                type: 'log',
                level: level,
                message: message,
                data: data,
                timestamp: new Date()
            });
            
            resolve(response);
        });
    });
}

// Handle messages from parent process
worker.message = async function(msg) {
    try {
        switch (msg.command) {
            case 'init':
                global.QB = DB(); // Total.js QueryBuilder for PostgreSQL
                require('querybuilderpg').init('default', msg.database);
                // fetch fixtures and start monitorin
                await init(msg);
                break;
            case 'pause':
                state.isPaused = true;
                await log('info', 'Worker paused');
                worker.send({ type: 'status', status: 'paused' });
                break;
                
            case 'resume':
                state.isPaused = false;
                await log('info', 'Worker resumed');
                worker.send({ type: 'status', status: 'running' });
                break;
                
            case 'stop':
                state.isRunning = false;
                await log('info', 'Worker stopping');
                worker.send({ type: 'status', status: 'stopped' });
                process.exit(0);
                break;
                
            case 'reload_config':
                await loadConfig();
                await log('info', 'Configuration reloaded');
                worker.send({ type: 'config_reloaded', config: state.config });
                break;
                
            case 'get_stats':
                worker.send({ type: 'stats', data: state.stats });
                break;
                
            case 'get_matches':
                QB.find('matches')
                    .where('date', new Date().format('yyyy-MM-dd'))
                    .callback((err, response) => {
                        worker.send({ type: 'matches', data: response || [] });
                    });
                break;

            case 'get_active_match':
                worker.send({ 
                    type: 'active_match', 
                    data: Array.from(state.activeMatches.values())[0] || null 
                });
                break;

            case 'get_match_events':
                QB.find('live_events')
                    .where('match_id', msg.match_id)
                    .sort('sort_desc')
                    .callback((err, response) => {
                        worker.send({ type: 'match_events', match_id: msg.match_id, data: response || [] });
                    });
                break;

            case 'get_logs':
                QB.find('worker_logs')
                    .where('worker_name', WORKER_NAME)
                    .where('level', msg.level)
                    .take(msg.limit)
                    .sort('created_at_desc')
                    .callback((err, response) => {
                        worker.send({ type: 'logs', level: msg.level, data: response || [] });
                    });
                break;
                
            default:
                await log('warn', 'Unknown command', { command: msg.command });
        }
    } catch (err) {
        await log('error', 'Error handling message', { 
            command: msg.command, 
            error: err.message 
        });
    }
};

// Handle errors
process.on('uncaughtException', async (err) => {
    await log('error', 'Uncaught exception', { error: err.message, stack: err.stack });
    state.stats.errors++;
});

process.on('unhandledRejection', async (reason, promise) => {
    await log('error', 'Unhandled rejection', { reason: reason });
    state.stats.errors++;
});


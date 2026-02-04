MAIN.footballWorker = null;
MAIN.footballWorderLogs = [];

// create initWorker function
function initWorker() {
    if (MAIN.footballWorker) {
        MAIN.footballWorker.terminate();
    }
    MAIN.footballWorker = NEWFORK('~' + PATH.join(__dirname, '../workers/servicefoot.js'));

    MAIN.footballWorker.on('message', (msg) => {
        // Broadcast to all WebSocket clients
        if (MAIN.wsConnections) {
            MAIN.wsConnections.forEach(client => {
                client.send(JSON.stringify(msg));
            });
        }
    });
    // Initialize worker with database config
    MAIN.footballWorker.postMessage({ 
        command: 'init', 
        database: CONF.database 
    });
}

MAIN.initWorker = initWorker;

// Initialize the worker and database at startup
ON('ready', async function() {
    try {
        let table = await DATA.check('information_schema.tables').where('table_schema', 'public').where('table_name', 'matches').promise();
        if (!table) {
            let sql = await Total.readfile(PATH.join(__dirname, '../db.sql'), 'utf8');
            await DATA.query(sql).promise();
            console.log('✅ ServiceFoot database initialized');
        }
        MAIN.initWorker();
    } catch (e) {
        console.error('❌ ServiceFoot initialization error:', e);
    }
});
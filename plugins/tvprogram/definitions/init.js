MAIN.tvWorker = null;

// create initWorker function
function initWorker() {
    if (MAIN.tvWorker) {
        MAIN.tvWorker.terminate();
    }
    MAIN.tvWorker = NEWFORK('tvprogram');

    MAIN.tvWorker.on('message', (msg) => {
        // Broadcast to all WebSocket clients
        if (MAIN.wsConnections) {
            MAIN.wsConnections.forEach(client => {
                client.send(JSON.stringify(msg));
            });
        }
    });

    // Initialize worker with database config
    MAIN.tvWorker.postMessage({ 
        command: 'init', 
        database: CONF.database 
    });
}

MAIN.initTVWorker = initWorker;

// Initialize the worker and database at startup
ON('ready', async function() {
    try {
        let table = await DATA.check('information_schema.tables').where('table_schema', 'public').where('table_name', 'tv_channels').promise();
        if (!table) {
            let sql = await Total.readfile(PATH.join(__dirname, '../db.sql'), 'utf8');
            await DATA.query(sql).promise();
            console.log('✅ TVProgram database initialized');
        }
        MAIN.initTVWorker();
    } catch (e) {
        console.error('❌ TVProgram initialization error:', e);
    }
});

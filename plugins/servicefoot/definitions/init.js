MAIN.footballWorker = NEWFORK('servicefoot');
MAIN.footballWorderLogs = [];

// create initWorker function
function initWorker() {
    if (MAIN.footballWorker) {
        MAIN.footballWorker.terminate();
    }
    MAIN.footballWorker = NEWFORK('servicefoot');

    MAIN.footballWorker.on('message', (msg) => {
        // Broadcast to all WebSocket clients
        MAIN.wsConnections.forEach(client => {
            client.send(JSON.stringify(msg));
        });
}    );
    // Initialize worker with database config
    MAIN.footballWorker.postMessage({ 
        command: 'init', 
        database: CONF.database 
    });
}


MAIN.initWorker = initWorker;

// Initialize the worker at startup
MAIN.initWorker();
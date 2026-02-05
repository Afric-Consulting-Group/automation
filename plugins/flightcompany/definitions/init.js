MAIN.flightWorker = null;

function initFlightWorker() {
    if (MAIN.flightWorker)
        MAIN.flightWorker.terminate();

    MAIN.flightWorker = NEWFORK('~' + PATH.join(__dirname, '../workers/flightcompany.js'));

    MAIN.flightWorker.on('message', msg => {
        if (MAIN.wsConnections)
            MAIN.wsConnections.forEach(client => client.send(JSON.stringify(msg)));
    });

    MAIN.flightWorker.postMessage({
        command: 'init',
        database: CONF.database
    });
}

MAIN.initFlightWorker = initFlightWorker;

ON('ready', async function() {
    try {
        await DATA.query(`
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_queue') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_queue' AND column_name='service') THEN
            ALTER TABLE notification_queue ADD COLUMN service VARCHAR(50);
        END IF;
    END IF;
END $$;
        `).promise();

        let table = await DATA.check('information_schema.tables').where('table_schema', 'public').where('table_name', 'flight_companies').promise();
        if (!table) {
            let sql = await Total.readfile(PATH.join(__dirname, '../db.sql'), 'utf8');
            await DATA.query(sql).promise();
            console.log('✅ FlightCompany database initialized');
        }

        MAIN.initFlightWorker();
    } catch (e) {
        console.error('❌ FlightCompany initialization error:', e);
    }
});

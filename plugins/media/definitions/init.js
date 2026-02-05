MAIN.mediaWorker = null;

function initMediaWorker() {
    if (MAIN.mediaWorker)
        MAIN.mediaWorker.terminate();

    MAIN.mediaWorker = NEWFORK('~' + PATH.join(__dirname, '../workers/media.js'));

    MAIN.mediaWorker.on('message', msg => {
        if (MAIN.wsConnections)
            MAIN.wsConnections.forEach(client => client.send(JSON.stringify(msg)));
    });

    MAIN.mediaWorker.postMessage({
        command: 'init',
        database: CONF.database
    });
}

MAIN.initMediaWorker = initMediaWorker;

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

        let table = await DATA.check('information_schema.tables').where('table_schema', 'public').where('table_name', 'media_companies').promise();
        if (!table) {
            let sql = await Total.readfile(PATH.join(__dirname, '../db.sql'), 'utf8');
            await DATA.query(sql).promise();
            console.log('✅ Media database initialized');
        }

        MAIN.initMediaWorker();
    } catch (e) {
        console.error('❌ Media initialization error:', e);
    }
});

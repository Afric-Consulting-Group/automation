MAIN.wsConnections = [];

// DANGER: Set CONF.truncate_on_start=true in `automation/config` to wipe all data on startup.
ON('ready', async function() {
	if (!CONF.truncate_on_start)
		return;

	const sql = `
DO $$
DECLARE r RECORD;
BEGIN
	FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
		EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
	END LOOP;
END $$;
`;
	await DATA.query(sql).promise();
});

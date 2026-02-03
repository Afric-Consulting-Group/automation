require('querybuilderpg').init('default', CONF.database);

// USE DATA.query('') to check if tables are created and read file PATH.root('database.sql') creating all tables if necessary.
ON('ready', async function() {
	let table = await DATA.check('information_schema.tables').where('table_schema', 'public').where('table_name', 'config').promise();
	if (!table) {
		let sql = await Total.readfile(PATH.root('database.sql'), 'utf8');
		await DATA.query(sql).promise();
	}
});
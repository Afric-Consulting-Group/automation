exports.icon = 'ti ti-docker';
exports.name = '@(USSD Apps)';
exports.position = 1;
exports.permissions = [{ id: 'ussdapp', name: 'USSD App' }];
exports.visible = user => user.sa || user.permissions.includes('ussdapp');
exports.hidden = true;
// Routes pour les pages de détails
exports.routes = [
	{ url: '/ussdapp/{name}/', html: 'simulator' }
];

exports.install = function() {
	ROUTE('+API  ?    -ussdapp_list            --> USSDApp/list');
	ROUTE('+API  ?    -ussdapp_read/{name}     --> USSDApp/read');
	ROUTE('+API  ?    -ussdapp_status/{name}   --> USSDApp/status');
	ROUTE('+API  ?    -ussdapp_logs/{name}     --> USSDApp/logs');
	ROUTE('+API  ?    -ussdapp_stats/{name}    --> USSDApp/stats');
	ROUTE('+API  ?    -ussdapp_containers      --> USSDApp/containers');
	ROUTE('+API  ?    +ussdapp_deploy          --> USSDApp/deploy');
	ROUTE('+API  ?    +ussdapp_start/{name}    --> USSDApp/start');
	ROUTE('+API  ?    +ussdapp_stop/{name}     --> USSDApp/stop');
	ROUTE('+API  ?    +ussdapp_toggle/{name}   --> USSDApp/toggle');
	ROUTE('+API  ?    +ussdapp_delete/{name}   --> USSDApp/delete');
	ROUTE('+API  ?    +ussdapp_monitor         --> USSDApp/monitor');
	ROUTE('+API  ?    +ussdapp_activate/{name}   --> USSDApp/start');
	ROUTE('+API  ?    +ussdapp_deactivate/{name} --> USSDApp/stop');
};

console.log('✅ Routes USSDApp configurées');
exports.icon = 'ti ti-plane';
exports.name = '@(Flight Companies)';
exports.position = 5;
exports.permissions = [{ id: 'flightcompany', name: 'Flight Companies' }];
exports.visible = user => user.sa || user.permissions.includes('flightcompany');

exports.install = function() {
	ROUTE('+API  ?    -flightcompany_worker_status     --> FlightCompany/worker_status');
	ROUTE('+API  ?    -flightcompany_stats             --> FlightCompany/stats');
	ROUTE('+API  ?    -flightcompany_get_companies     --> FlightCompany/get_companies');
	ROUTE('+API  ?    -flightcompany_get_notifications --> FlightCompany/get_notifications');
	ROUTE('+API  ?    -flightcompany_get_templates     --> FlightCompany/get_templates');
	ROUTE('+API  ?    -flightcompany_get_template/{id} --> FlightCompany/get_template');
	ROUTE('+API  ?    +flightcompany_save_template     --> FlightCompany/save_template');
	ROUTE('+API  ?    -flightcompany_remove_template/{id} --> FlightCompany/remove_template');
	ROUTE('+API  ?    +flightcompany_start_worker      --> FlightCompany/start_worker');
	ROUTE('+API  ?    +flightcompany_stop_worker       --> FlightCompany/stop_worker');
	ROUTE('+API  ?    +flightcompany_restart_worker    --> FlightCompany/restart_worker');
};

console.log('✅ Routes FlightCompany configurées');

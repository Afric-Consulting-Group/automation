exports.icon = 'ti ti-pennant';
exports.name = '@(Football Service)';
exports.position = 2;
exports.permissions = [{ id: 'servicefoot', name: 'Football Service' }];
exports.visible = user => user.sa || user.permissions.includes('servicefoot');

exports.install = function() {
	ROUTE('+API  ?    -servicefoot_worker_status      --> ServiceFoot/worker_status');
	ROUTE('+API  ?    -servicefoot_stats              --> ServiceFoot/stats');
	ROUTE('+API  ?    -servicefoot_get_matches        --> ServiceFoot/get_matches');
	ROUTE('+API  ?    -servicefoot_get_active_match   --> ServiceFoot/get_active_match');
	ROUTE('+API  ?    -servicefoot_get_match_events   --> ServiceFoot/get_match_events');
	ROUTE('+API  ?    -servicefoot_get_logs           --> ServiceFoot/get_logs');
	ROUTE('+API  ?    -servicefoot_get_templates      --> ServiceFoot/get_templates');
	ROUTE('+API  ?    -servicefoot_get_template/{id}  --> ServiceFoot/get_template');
	ROUTE('+API  ?    +servicefoot_save_template      --> ServiceFoot/save_template');
	ROUTE('+API  ?    -servicefoot_remove_template    --> ServiceFoot/remove_template');
	ROUTE('+API  ?    +servicefoot_start_worker       --> ServiceFoot/start_worker');
	ROUTE('+API  ?    +servicefoot_stop_worker        --> ServiceFoot/stop_worker');
	ROUTE('+API  ?    +servicefoot_restart_worker     --> ServiceFoot/restart_worker');
	ROUTE('+API  ?    +servicefoot_reload_worker      --> ServiceFoot/reload_worker');
};

console.log('✅ Routes ServiceFoot configurées');

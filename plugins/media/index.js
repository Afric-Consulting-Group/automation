exports.icon = 'ti ti-photo';
exports.name = '@(Media Companies)';
exports.position = 4;
exports.permissions = [{ id: 'media', name: 'Media Companies' }];
exports.visible = user => user.sa || user.permissions.includes('media');

exports.install = function() {
	ROUTE('+API  ?    -media_worker_status        --> Media/worker_status');
	ROUTE('+API  ?    -media_stats                --> Media/stats');
	ROUTE('+API  ?    -media_get_companies        --> Media/get_companies');
	ROUTE('+API  ?    -media_get_notifications    --> Media/get_notifications');
	ROUTE('+API  ?    -media_get_templates        --> Media/get_templates');
	ROUTE('+API  ?    -media_get_template/{id}    --> Media/get_template');
	ROUTE('+API  ?    +media_save_template        --> Media/save_template');
	ROUTE('+API  ?    -media_remove_template/{id} --> Media/remove_template');
	ROUTE('+API  ?    +media_start_worker         --> Media/start_worker');
	ROUTE('+API  ?    +media_stop_worker          --> Media/stop_worker');
	ROUTE('+API  ?    +media_restart_worker       --> Media/restart_worker');
};

console.log('✅ Routes Media configurées');

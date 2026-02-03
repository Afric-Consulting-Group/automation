exports.icon = 'ti ti-tv';
exports.name = '@(TV Program)';
exports.position = 3;
exports.permissions = [{ id: 'tvprogram', name: 'TV Program' }];
exports.visible = user => user.sa || user.permissions.includes('tvprogram');

exports.install = function() {
    ROUTE('+API  ?    -tvprogram_worker_status      --> TVProgram/worker_status');
    ROUTE('+API  ?    -tvprogram_stats              --> TVProgram/stats');
    ROUTE('+API  ?    -tvprogram_get_programs       --> TVProgram/get_programs');
    ROUTE('+API  ?    -tvprogram_get_channels       --> TVProgram/get_channels');
    ROUTE('+API  ?    -tvprogram_get_logs           --> TVProgram/get_logs');
    ROUTE('+API  ?    +tvprogram_start_worker       --> TVProgram/start_worker');
    ROUTE('+API  ?    +tvprogram_stop_worker        --> TVProgram/stop_worker');
    ROUTE('+API  ?    +tvprogram_restart_worker     --> TVProgram/restart_worker');
    ROUTE('+API  ?    +tvprogram_scrape_now         --> TVProgram/scrape_now');
};

console.log('✅ Routes TVProgram configurées');

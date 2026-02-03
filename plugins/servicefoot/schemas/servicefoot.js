let servivename  = 'servicefoot';

NEWSCHEMA('ServiceFoot', function (schema) {
    schema.action('worker_status', {
        name: 'Get Football Worker Status',
        action: function ($) {
            $.callback({
                worker_running: MAIN.footballWorker !== null
            });
        }
    });

    schema.action('stats', {
        name: 'Get Football Service Statistics',
        action: async function ($) {
            if (!MAIN.footballWorker) return $.callback({ success: false, error: 'Worker is not running' });
            MAIN.footballWorker.postMessage({ command: 'get_stats' });
            // Wait for response
            const timeout = setTimeout(() => {
                MAIN.footballWorker.off('message', handler);
                $.callback({ success: false, error: 'Timeout waiting for football worker response' });
            }, 5000);

            const handler = (msg) => {
                if (msg.type === 'stats') {
                    clearTimeout(timeout);
                    MAIN.footballWorker.off('message', handler);
                    $.callback({ success: true, data: msg.data });
                }
            };

            MAIN.footballWorker.on('message', handler);
        }
    });

    schema.action('restart_worker', {
        name: 'Restart Football Worker',
        action: function ($) {
            const self = $;
            // restart the worker
            MAIN.initWorker();
            self.callback({ success: true, message: 'Worker restarted' });
        }
    });

    schema.action('stop_worker', {
        name: 'Stop Football Worker',
        action: function ($) {
            const self = $;
            if (MAIN.footballWorker) {
                MAIN.footballWorker.terminate();
                MAIN.footballWorker = null;
                self.callback({ success: true, message: 'Worker stopped' });
            } else {
                self.callback({ success: false, message: 'Worker is not running' });
            }   
        }
    });

    schema.action('start_worker', {
        name: 'Start Football Worker',
        action: function ($) {  
            const self = $;
            if (!MAIN.footballWorker) {
                MAIN.initWorker();
                self.callback({ success: true, message: 'Worker started' });
            } else {
                self.callback({ success: false, message: 'Worker is already running' });
            }   
        }
    });

    // reload worker
    schema.action('reload_worker', {
        name: 'Reload Football Worker',
        action: function ($) {
            const self = $;
            if (MAIN.footballWorker) {
                MAIN.initWorker();
                self.callback({ success: true, message: 'Worker reloaded' });
            } else {
                self.callback({ success: false, message: 'Worker is not running' });
            }   
        }
    });

    // get the match list
    schema.action('get_matches', {
        name: 'Get Football Matches',
        action: function ($) {
            const self = $;
            if (!MAIN.footballWorker) return self.callback({ success: false, error: 'Worker is not running' });
            MAIN.footballWorker.postMessage({ command: 'get_matches' });    
            // Wait for response
            const timeout = setTimeout(() => {
                MAIN.footballWorker.off('message', handler);
                self.callback({ success: false, error: 'Timeout waiting for football worker response' });
            }, 5000);
            const handler = (msg) => {
                if (msg.type === 'matches') {
                    clearTimeout(timeout);
                    MAIN.footballWorker.off('message', handler);
                    self.callback({ success: true, data: msg.data });
                }   
            };
            MAIN.footballWorker.on('message', handler);
        }   
    });

    // get active match
    schema.action('get_active_match', {
        name: 'Get Active Football Match',
        action: function ($) {  
            const self = $;
            if (!MAIN.footballWorker) return self.callback({ success: false, error: 'Worker is not running' });
            MAIN.footballWorker.postMessage({ command: 'get_active_match' });
            // Wait for response
            const timeout = setTimeout(() => {
                MAIN.footballWorker.off('message', handler);
                self.callback({ success: false, error: 'Timeout waiting for football worker response' });
            }, 5000);
            const handler = (msg) => {
                if (msg.type === 'active_match') {
                    clearTimeout(timeout);
                    MAIN.footballWorker.off('message', handler);
                    self.callback({ success: true, data: msg.data });
                }
            };
            MAIN.footballWorker.on('message', handler);
        }
    });

    // get events for a match
    schema.action('get_match_events', {
        name: 'Get Football Match Events',
        query: 'match_id:String',
        action: function ($) {
            const self = $;
            const matchId = $.query.match_id;
            if (!MAIN.footballWorker) return self.callback({ success: false, error: 'Worker is not running' });
            MAIN.footballWorker.postMessage({ command: 'get_match_events', match_id: matchId });
            // Wait for response
            const timeout = setTimeout(() => {
                MAIN.footballWorker.off('message', handler);
                self.callback({ success: false, error: 'Timeout waiting for football worker response' });
            }, 5000);
            const handler = (msg) => {
                if (msg.type === 'match_events' && msg.match_id === matchId) {
                    clearTimeout(timeout);
                    MAIN.footballWorker.off('message', handler);
                    self.callback({ success: true, data: msg.data });
                }
            };
            MAIN.footballWorker.on('message', handler);
        }
    });

    // get logs
    schema.action('get_logs', {
        name: 'Get Football Service Logs',
        query: 'level:String,limit:Number',
        action: function ($) {
            const self = $;
            const level = $.query.level || 'info';
            const limit = $.query.limit || 100;
            if (!MAIN.footballWorker) return self.callback({ success: false, error: 'Worker is not running' });
            MAIN.footballWorker.postMessage({ command: 'get_logs', level: level, limit: limit });   
            // Wait for response
            const timeout = setTimeout(() => {
                MAIN.footballWorker.off('message', handler);
                self.callback({ success: false, error: 'Timeout waiting for football worker response' });
            }, 5000);
            const handler = (msg) => {  
                if (msg.type === 'logs' && msg.level === level) {
                    clearTimeout(timeout);
                    MAIN.footballWorker.off('message', handler);
                    self.callback({ success: true, data: msg.data });
                }
            };
            MAIN.footballWorker.on('message', handler);
        }   
    });

    // templates list
    schema.action('get_templates', {
        name: 'Get Football Service Templates',
        query: 'search:String',
        action: function ($) {
            const self = $;
                    
        let builder = DB().find('message_templates');
            // search query
            self.query.search && builder.search('name', self.query.search);

            // servicename filter
            builder.where('service', servivename);
            builder.sort('event_type');


            builder.callback((err, response) => {
                if (err) return self.invalid(err);
                self.callback({ success: true, data: response });
            });
            }
        });
    
    // get template by id
    schema.action('get_template', {
        name: 'Get Football Service Template by ID',
        params: '*id:String',
        action: function ($) {
            const self = $;
            const templateId = $.params.id;
            let builder = DB().read('message_templates');
            
            builder.where('service', servivename);

            builder.where('id', templateId).callback((err, response) => {
                if (err) return self.invalid(err);
                if (!response) return self.notfound();
                self.callback({ success: true, data: response });
            });
        }
    });


    schema.action('get_template_by_event', {
        name: 'Get Football Service Template by Event Type',
        params: '*event_type:String',
        action: function ($) {
            const self = $;
            const eventType = $.params.event_type;
            let builder = DB().read('message_templates');
            builder.where('service', servivename);
            builder.where('event_type', eventType).callback((err, response) => {
                if (err) return self.invalid(err);
                if (!response) return self.notfound();
                self.callback({ success: true, data: response });
            });
        }
    });

    // tempalate save (create or update) inpire from /controllers/default.js
    schema.action('save_template', {
        name: 'Save Football Service Template',
        input: 'name:String, event_type:String, content:String',
        action: function ($, model) {
            const self = $;
            model.service = servivename; // set service name
            let builder = DB().save('message_templates', model);
            builder.callback((err, response) => {
                if (err) return self.invalid(err);
                self.callback({ success: true, data: response });
            });
        }
    });

    // remove template
    schema.action('remove_template', {
        name: 'Remove Football Service Template',
        query: 'id:String',
        action: function ($) {
            const self = $;
            const templateId = $.query.id || UID();
            let builder = DB().remove('message_templates');
            builder.where('service', servivename);
            builder.where('id', templateId).callback((err, response) => {
                if (err) return self.invalid(err);
                self.callback({ success: true, data: response });
            });
        }
    });


    
    
});
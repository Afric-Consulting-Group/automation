NEWSCHEMA('TVProgram', function (schema) {
    schema.action('worker_status', {
        name: 'Get TV Worker Status',
        action: function ($) {
            $.callback({
                worker_running: MAIN.tvWorker !== null
            });
        }
    });

    schema.action('stats', {
        name: 'Get TV Service Statistics',
        action: async function ($) {
            if (!MAIN.tvWorker) return $.callback({ success: false, error: 'Worker is not running' });
            MAIN.tvWorker.postMessage({ command: 'get_stats' });
            
            const timeout = setTimeout(() => {
                MAIN.tvWorker.off('message', handler);
                $.callback({ success: false, error: 'Timeout waiting for TV worker response' });
            }, 5000);

            const handler = (msg) => {
                if (msg.type === 'stats') {
                    clearTimeout(timeout);
                    MAIN.tvWorker.off('message', handler);
                    $.callback({ success: true, data: msg.data });
                }
            };

            MAIN.tvWorker.on('message', handler);
        }
    });

    schema.action('restart_worker', {
        name: 'Restart TV Worker',
        action: function ($) {
            MAIN.initTVWorker();
            $.callback({ success: true, message: 'Worker restarted' });
        }
    });

    schema.action('stop_worker', {
        name: 'Stop TV Worker',
        action: function ($) {
            if (MAIN.tvWorker) {
                MAIN.tvWorker.terminate();
                MAIN.tvWorker = null;
                $.callback({ success: true, message: 'Worker stopped' });
            } else {
                $.callback({ success: false, message: 'Worker is not running' });
            }   
        }
    });

    schema.action('start_worker', {
        name: 'Start TV Worker',
        action: function ($) {  
            if (!MAIN.tvWorker) {
                MAIN.initTVWorker();
                $.callback({ success: true, message: 'Worker started' });
            } else {
                $.callback({ success: false, message: 'Worker is already running' });
            }   
        }
    });

    schema.action('scrape_now', {
        name: 'Trigger Scraping Now',
        action: function ($) {
            if (!MAIN.tvWorker) return $.callback({ success: false, error: 'Worker is not running' });
            MAIN.tvWorker.postMessage({ command: 'scrape' });
            $.callback({ success: true, message: 'Scraping triggered' });
        }
    });

    schema.action('get_channels', {
        name: 'Get TV Channels',
        action: function ($) {
            QB.find('tv_channels').sort('name').callback($.callback);
        }
    });

    schema.action('get_programs', {
        name: 'Get TV Programs',
        query: 'channel_id:Number,date:Date',
        action: function ($) {
            let builder = QB.find('tv_programs');
            
            if ($.query.channel_id)
                builder.where('channel_id', $.query.channel_id);
            
            if ($.query.date)
                builder.where('date', $.query.date);
            else
                builder.where('date', NOW);

            builder.sort('start_time').callback($.callback);
        }
    });

    schema.action('get_logs', {
        name: 'Get TV Service Logs',
        query: 'level:String,limit:Number',
        action: function ($) {
            const level = $.query.level || 'info';
            const limit = $.query.limit || 100;
            
            if (!MAIN.tvWorker) return $.callback({ success: false, error: 'Worker is not running' });
            
            MAIN.tvWorker.postMessage({ command: 'get_logs', level: level, limit: limit });
            
            const timeout = setTimeout(() => {
                MAIN.tvWorker.off('message', handler);
                $.callback({ success: false, error: 'Timeout waiting for TV worker response' });
            }, 5000);

            const handler = (msg) => {
                if (msg.type === 'logs' && msg.level === level) {
                    clearTimeout(timeout);
                    MAIN.tvWorker.off('message', handler);
                    $.callback({ success: true, data: msg.data });
                }
            };
            MAIN.tvWorker.on('message', handler);
        }
    });
});

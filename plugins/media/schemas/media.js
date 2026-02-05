NEWSCHEMA('Media', function(schema) {
    const QB = DB();
    const SERVICE = 'media';

    schema.action('worker_status', {
        name: 'Get Media Worker Status',
        action: function($) {
            $.callback({ worker_running: MAIN.mediaWorker !== null });
        }
    });

    schema.action('stats', {
        name: 'Get Media Service Statistics',
        action: function($) {
            if (!MAIN.mediaWorker)
                return $.callback({ success: false, error: 'Worker is not running' });

            MAIN.mediaWorker.postMessage({ command: 'get_stats' });

            const timeout = setTimeout(() => {
                MAIN.mediaWorker.off('message', handler);
                $.callback({ success: false, error: 'Timeout waiting for media worker response' });
            }, 4000);

            const handler = msg => {
                if (msg.type === 'stats') {
                    clearTimeout(timeout);
                    MAIN.mediaWorker.off('message', handler);
                    $.callback({ success: true, data: msg.data });
                }
            };

            MAIN.mediaWorker.on('message', handler);
        }
    });

    schema.action('restart_worker', {
        name: 'Restart Media Worker',
        action: function($) {
            MAIN.initMediaWorker();
            $.callback({ success: true, message: 'Worker restarted' });
        }
    });

    schema.action('stop_worker', {
        name: 'Stop Media Worker',
        action: function($) {
            if (MAIN.mediaWorker) {
                MAIN.mediaWorker.terminate();
                MAIN.mediaWorker = null;
                $.callback({ success: true, message: 'Worker stopped' });
            } else {
                $.callback({ success: false, message: 'Worker is not running' });
            }
        }
    });

    schema.action('start_worker', {
        name: 'Start Media Worker',
        action: function($) {
            if (!MAIN.mediaWorker) {
                MAIN.initMediaWorker();
                $.callback({ success: true, message: 'Worker started' });
            } else {
                $.callback({ success: false, message: 'Worker is already running' });
            }
        }
    });

    schema.action('get_companies', {
        name: 'Get Media Companies',
        action: function($) {
            QB.find('media_companies').sort('name').callback($.callback());
        }
    });

    schema.action('get_notifications', {
        name: 'Get Notifications',
        query: 'date:Date',
        action: function($) {
            let builder = QB.find('notification_queue').where('service', SERVICE);
            if ($.query.date)
                builder.where('date', $.query.date);
            builder.sort('created_at', true).callback($.callback());
        }
    });

    schema.action('get_templates', {
        name: 'Get Templates',
        action: function($) {
            QB.find('message_templates').where('service', SERVICE).sort('updated_at', true).callback($.callback());
        }
    });

    schema.action('get_template', {
        name: 'Get Template',
        params: 'id:Number',
        action: function($) {
            QB.read('message_templates').id($.params.id).callback($.callback());
        }
    });

    schema.action('save_template', {
        name: 'Save Template',
        input: 'id:Number,name:String,event_type:String,content:String,description:String,active:Boolean',
        action: function($) {
            const model = $.model;
            const data = {
                name: model.name,
                event_type: model.event_type,
                template: model.content,
                description: model.description,
                active: model.active !== false,
                updated_at: new Date()
            };

            if (model.id) {
                QB.modify('message_templates', data).id(model.id).callback($.callback());
            } else {
                data.service = SERVICE;
                QB.insert('message_templates', data).callback($.callback());
            }
        }
    });

    schema.action('remove_template', {
        name: 'Remove Template',
        params: 'id:Number',
        action: function($) {
            QB.remove('message_templates').id($.params.id).callback($.callback());
        }
    });
});


// ============================================================================
// API ENDPOINTS
// ============================================================================

// Get worker status
exports.install = function() {
    
    // Dashboard page
    ROUTE('GET /', view_dashboard);
    ROUTE('GET /api/config', api_config);
    ROUTE('POST /api/config', api_config_update);
    // Notifications
    ROUTE('GET /api/notifications', api_notifications);
    ROUTE('POST /api/notifications/retry', api_notifications_retry);
    // WebSocket for realtime updates
    ROUTE('SOCKET /', ws_realtime);
};

// ============================================================================
// VIEW
// ============================================================================

function view_dashboard($) {
    const self = $;

    // Plugins
    self.view('dashboard');
}

// ============================================================================
// API HANDLERS
// ============================================================================


// Get configuration
function api_config($) {
    const self = $;
    
    DB().find('config')
        .sort('name')
        .callback((err, response) => {
            if (err) return self.invalid(err);
            self.json({ success: true, data: response });
        });
}

// Update configuration
function api_config_update($) {
    const self = $;
    const body = self.body;
    
    if (!body.name || !body.value) {
        return self.invalid('Name and value are required');
    }
    
    DB().modify('config', {
        value: body.value,
        description: body.description
    })
    .where('name', body.name)
    .callback((err, response) => {
        if (err) return self.invalid(err);
        
        // Reload worker config
        footballWorker.postMessage({ command: 'reload_config' });
        
        self.json({ success: true, message: 'Configuration updated' });
    });
}

// Get templates
function api_templates($) {
    const self = $;
    
    DB().find('message_templates')
        .sort('event_type')
        .callback((err, response) => {
            if (err) return self.invalid(err);
            self.json({ success: true, data: response });
        });
}

// Get single template
function api_template_get($) {
    const self = $;
    var id = self.params.id;
    DB().find('message_templates')
        .where('id', parseInt(id))
        .callback((err, response) => {
            if (err) return self.invalid(err);
            
            if (!response || response.length === 0) {
                return self.invalid('Template not found');
            }
            
            self.json({ success: true, data: response[0] });
        });
}

// Create template
function api_template_create($) {
    const self = $;
    const body = self.body;
    
    DB().insert('message_templates', {
        name: body.name,
        event_type: body.event_type,
        template: body.template,
        description: body.description,
        active: body.active !== false
    })
    .callback((err, response) => {
        if (err) return self.invalid(err);
        self.json({ success: true, message: 'Template created', data: response });
    });
}

// Update template
function api_template_update($) {
    const self = $;
    const body = self.body;
    var id = self.params.id;
    DB().modify('message_templates', {
        name: body.name,
        event_type: body.event_type,
        template: body.template,
        description: body.description,
        active: body.active
    })
    .where('id', parseInt(id))
    .callback((err, response) => {
        if (err) return self.invalid(err);
        self.json({ success: true, message: 'Template updated' });
    });
}

// Delete template
function api_template_delete($) {
    const self = $;
    var id = self.params.id;
    
    DB().remove('message_templates')
        .where('id', parseInt(id))
        .callback((err, response) => {
            if (err) return self.invalid(err);
            self.json({ success: true, message: 'Template deleted' });
        });
}

// Worker control - pause
function api_worker_pause($) {
    const self = $;
    footballWorker.postMessage({ command: 'pause' });
    self.json({ success: true, message: 'Worker paused' });
}

// Worker control - resume
function api_worker_resume($) {
    const self = $;
    footballWorker.postMessage({ command: 'resume' });
    self.json({ success: true, message: 'Worker resumed' });
}

// Worker control - restart
function api_worker_restart($) {
    const self = $;
    initWorker();
    self.json({ success: true, message: 'Worker restarted' });
}

// Worker control - reload config
function api_worker_reload($) {
    const self = $;
    footballWorker.postMessage({ command: 'reload_config' });
    self.json({ success: true, message: 'Configuration reloaded' });
}

// Get notifications
function api_notifications($) {
    const self = $;
    const sent = self.query.sent === 'true';
    const limit = parseInt(self.query.limit) || 50;
    
    DB().find('notification_queue')
        .where('sent', sent)
        .sort('created_at', true)
        .take(limit)
        .callback((err, response) => {
            if (err) return self.invalid(err);
            self.json({ success: true, data: response });
        });
}

// Retry failed notifications
function api_notifications_retry($) {
    const self = $;
    const id = self.body.id;
    
    if (!id) {
        return self.invalid('Notification ID required');
    }
    
    DB().modify('notification_queue', {
        sent: false,
        error: null,
        retry_count: 0
    })
    .where('id', parseInt(id))
    .callback((err, response) => {
        if (err) return self.invalid(err);
        self.json({ success: true, message: 'Notification queued for retry' });
    });
}

// ============================================================================
// WEBSOCKET
// ============================================================================

function ws_realtime($) {
    const self = $;
    
    self.on('open', (client) => {
        wsConnections.push(client);
        
        // Send current status
        client.send(JSON.stringify({
            type: 'connected',
            message: 'Connected to live updates',
            timestamp: new Date()
        }));
    });
    
    self.on('close', (client) => {
        const index = wsConnections.indexOf(client);
        if (index > -1) {
            wsConnections.splice(index, 1);
        }
    });
    
    self.on('message', (client, message) => {
        // Handle client messages if needed
        console.log('Client message:', message);
    });
}

// ============================================================================
// SCHEMAS
// ============================================================================

// inline schema declarations can be placed here 
NEWSCHEMA('Template', 'name:String(100), event_type:String(50), template:String, description:String, active:Boolean');  

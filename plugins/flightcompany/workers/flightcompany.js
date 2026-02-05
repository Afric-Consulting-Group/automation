require('total5');

const worker = NEWFORK();

const state = {
    stats: {
        companies_total: 0,
        routes_monitored: 0,
        notifications_queued: 0,
        errors: 0
    },
    logs: []
};

function addLog(level, message, data) {
    const entry = {
        time: new Date().format('HH:mm:ss'),
        level: level,
        message: message,
        data: data || null
    };

    state.logs.unshift(entry);
    if (state.logs.length > 200)
        state.logs.pop();

    worker.send({ type: 'log', data: entry });
}

worker.message = function(msg) {
    switch (msg.command) {
        case 'init':
            addLog('info', 'Flight worker initialized');
            break;
        case 'get_stats':
            worker.send({ type: 'stats', data: state.stats });
            break;
        case 'get_logs': {
            const level = msg.level || 'info';
            const limit = msg.limit || 100;
            const filtered = state.logs.filter(l => level === 'all' || l.level === level).slice(0, limit);
            worker.send({ type: 'logs', level: level, data: filtered });
            break;
        }
    }
};

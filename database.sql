-- Configuration table
CREATE TABLE IF NOT EXISTS config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message templates
CREATE TABLE IF NOT EXISTS message_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    service VARCHAR(100),
    event_type VARCHAR(50) NOT NULL,
    template TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Worker activity log for debugging
CREATE TABLE IF NOT EXISTS worker_logs (
    id SERIAL PRIMARY KEY,
    worker_name VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    message TEXT,
    data JSONB,
    level VARCHAR(20) DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker status for realtime monitoring
CREATE TABLE IF NOT EXISTS worker_status (
    id SERIAL PRIMARY KEY,
    worker_name VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    last_heartbeat TIMESTAMP NOT NULL,
    last_error TEXT,
    stats JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Total.js OpenPlatform config table (used by modules/openplatform.js)
CREATE TABLE IF NOT EXISTS tbl_config (
    id VARCHAR(60) PRIMARY KEY,
    value TEXT,
    type VARCHAR(50),
    dtcreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dtupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

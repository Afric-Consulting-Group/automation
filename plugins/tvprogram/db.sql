-- Notification queue (shared)
CREATE TABLE IF NOT EXISTS notification_queue (
    id SERIAL PRIMARY KEY,
    service VARCHAR(50),
    template TEXT NOT NULL,
    data JSONB NOT NULL,
    date DATE NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure service column exists (if table was created by another plugin without it)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_queue' AND column_name='service') THEN
        ALTER TABLE notification_queue ADD COLUMN service VARCHAR(50);
    END IF;
END $$;

-- Message templates (shared)
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

-- TV specific notification tracker
CREATE TABLE IF NOT EXISTS tv_programs_queue (
    id SERIAL PRIMARY KEY,
    program_id INTEGER REFERENCES tv_programs(id) ON DELETE CASCADE,
    event_type VARCHAR(50), -- 'starting', 'started'
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, event_type)
);

-- Insert TV templates
INSERT INTO message_templates (name, service, event_type, template, description) VALUES
    ('tv_program_starting', 'tvprogram', 'starting', 
     '*** TV Program ***
Le programme @{model.title} va commencer dans 5 minutes sur @{model.channel_name}.
Categorie: @{model.category}', 
     'TV Program starting notification')
ON CONFLICT (name) DO NOTHING;

-- TV Channels
CREATE TABLE IF NOT EXISTS tv_channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(255),
    source_id VARCHAR(100), -- ID used by the source (e.g., 205, 201)
    source_type VARCHAR(50), -- 'canalplus' or 'arte'
    group_name VARCHAR(100), -- e.g., PROGRAMME_TV_AUTRES
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TV Programs
CREATE TABLE IF NOT EXISTS tv_programs (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES tv_channels(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    stop_time TIMESTAMP,
    category VARCHAR(100),
    description TEXT,
    image VARCHAR(255),
    external_id VARCHAR(100),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, start_time)
);

-- Worker logs (copied from servicefoot structure)
CREATE TABLE IF NOT EXISTS tv_worker_logs (
    id SERIAL PRIMARY KEY,
    worker_name VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    message TEXT,
    data JSONB,
    level VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_tv_programs_date ON tv_programs(date);
CREATE INDEX idx_tv_programs_channel ON tv_programs(channel_id);
CREATE INDEX idx_tv_worker_logs_created_at ON tv_worker_logs(created_at DESC);

-- Default configuration for TV Program plugin
INSERT INTO config (name, value, description) VALUES
    ('tvprogram_url_canal', 'https://www.canalplus.com/bf/programme-tv/', 'Canal+ TV Program URL'),
    ('tvprogram_url_arte', 'https://www.arte.tv/fr/guide/', 'Arte TV Program URL'),
    ('tvprogram_interval', '3600000', 'TV Program scrape interval in ms (default 1 hour)'),
    ('tvprogram_power', 'on', 'Master switch for TV Program scraper')
ON CONFLICT (name) DO NOTHING;

-- Insert Channels
INSERT INTO tv_channels (name, source_id, source_type, group_name) VALUES
    ('Tv France 3', '205', 'canalplus', 'PROGRAMME_TV_AUTRES'),
    ('Tv tf1', '201', 'canalplus', 'PROGRAMME_TV_AUTRES'),
    ('Tv France 2', '203', 'canalplus', 'PROGRAMME_TV_AUTRES'),
    ('Tv canal +', '206', 'canalplus', 'PROGRAMME_TV_AUTRES'),
    ('Tv Itele', '202', 'canalplus', 'PROGRAMME_TV_AUTRES'),
    ('Tv France 5', '204', 'canalplus', 'PROGRAMME_TV_AUTRES'),
    ('Tv canal3', '183', 'canalplus', 'PROGRAMME_TV_BURKINABE'),
    ('Tv arte', '207', 'arte', 'PROGRAMME_TV_AUTRES')
ON CONFLICT (name) DO UPDATE SET 
    source_id = EXCLUDED.source_id,
    source_type = EXCLUDED.source_type,
    group_name = EXCLUDED.group_name;
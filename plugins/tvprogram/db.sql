-- TV Channels
CREATE TABLE tv_channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TV Programs
CREATE TABLE tv_programs (
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
    UNIQUE(channel_id, start_time, title)
);

-- Create index for faster queries
CREATE INDEX idx_tv_programs_date ON tv_programs(date);
CREATE INDEX idx_tv_programs_channel ON tv_programs(channel_id);

-- Default configuration for TV Program plugin
INSERT INTO config (name, value, description) VALUES
    ('tvprogram_url', 'https://www.canalplus.com/bf/programme-tv/', 'Canal+ TV Program URL'),
    ('tvprogram_interval', '3600000', 'TV Program scrape interval in ms (default 1 hour)'),
    ('tvprogram_power', 'on', 'Master switch for TV Program scraper');


-- Teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    unique_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    external_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    fixture_id INTEGER UNIQUE NOT NULL,
    homeid_awayid VARCHAR(100) NOT NULL,
    time TIME NOT NULL,
    home_name VARCHAR(255) NOT NULL,
    away_name VARCHAR(255) NOT NULL,
    home_id INTEGER NOT NULL,
    away_id INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match events tracking tables
CREATE TABLE match_events_notstarted (
    id SERIAL PRIMARY KEY,
    unique_key VARCHAR(100) UNIQUE NOT NULL,
    event_name VARCHAR(50) NOT NULL,
    match_id INTEGER NOT NULL,
    date DATE NOT NULL,
    home_name VARCHAR(255) NOT NULL,
    away_name VARCHAR(255) NOT NULL,
    homeid_awayid VARCHAR(100) NOT NULL,
    score VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_events_started (
    id SERIAL PRIMARY KEY,
    unique_key VARCHAR(100) UNIQUE NOT NULL,
    event_name VARCHAR(50) NOT NULL,
    match_id INTEGER NOT NULL,
    date DATE NOT NULL,
    home_name VARCHAR(255) NOT NULL,
    away_name VARCHAR(255) NOT NULL,
    homeid_awayid VARCHAR(100) NOT NULL,
    score VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_events_addedtime (
    id SERIAL PRIMARY KEY,
    unique_key VARCHAR(100) UNIQUE NOT NULL,
    event_name VARCHAR(50) NOT NULL,
    match_id INTEGER NOT NULL,
    date DATE NOT NULL,
    home_name VARCHAR(255) NOT NULL,
    away_name VARCHAR(255) NOT NULL,
    homeid_awayid VARCHAR(100) NOT NULL,
    score VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_events_halftime (
    id SERIAL PRIMARY KEY,
    unique_key VARCHAR(100) UNIQUE NOT NULL,
    event_name VARCHAR(50) NOT NULL,
    match_id INTEGER NOT NULL,
    date DATE NOT NULL,
    home_name VARCHAR(255) NOT NULL,
    away_name VARCHAR(255) NOT NULL,
    homeid_awayid VARCHAR(100) NOT NULL,
    score VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_events_finished (
    id SERIAL PRIMARY KEY,
    unique_key VARCHAR(100) UNIQUE NOT NULL,
    event_name VARCHAR(50) NOT NULL,
    match_id INTEGER NOT NULL,
    date DATE NOT NULL,
    home_name VARCHAR(255) NOT NULL,
    away_name VARCHAR(255) NOT NULL,
    homeid_awayid VARCHAR(100) NOT NULL,
    score VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Live events (goals, cards, substitutions)
CREATE TABLE live_events (
    id SERIAL PRIMARY KEY,
    unique_key VARCHAR(100) UNIQUE NOT NULL,
    external_id VARCHAR(50) NOT NULL,
    match_id INTEGER NOT NULL,
    player VARCHAR(255),
    time VARCHAR(10),
    event VARCHAR(50) NOT NULL,
    sort INTEGER,
    home_away CHAR(1),
    info TEXT,
    date DATE NOT NULL,
    homeid_awayid VARCHAR(100),
    match_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- General events log
CREATE TABLE events_log (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification queue
CREATE TABLE notification_queue (
    id SERIAL PRIMARY KEY,
    template TEXT NOT NULL,
    data JSONB NOT NULL,
    date DATE NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Insert default configuration
INSERT INTO config (name, value, description) VALUES
    ('power', 'on', 'Master switch for the service'),
    ('api_key', 'eXOv8YQzPrtdesCF', 'LiveScore API Key'),
    ('api_secret', '9dCd3fFKo22cGq9VnYrwXh6MJz0X2CCb', 'LiveScore API Secret'),
    ('competition_id', '227', 'Competition ID to track'),
    ('fixtures_url', 'https://livescore-api.com/api-client/fixtures/matches.json', 'Fixtures API endpoint'),
    ('events_url', 'https://livescore-api.com/api-client/scores/events.json', 'Events API endpoint'),
    ('live_score_url', 'https://livescore-api.com/api-client/scores/live.json', 'Live scores API endpoint'),
    ('fixture_time', '05:34', 'Time to fetch fixtures'),
    ('morning_program', '08:00', 'Morning program time'),
    ('sms_endpoint', 'http://213.246.36.116/smsbillingtelecelbf/euro_sub_broadcast.php', 'SMS broadcast endpoint'),
    ('sms_from', '821', 'SMS sender ID'),
    ('sms_target', 'can', 'SMS target group')
ON CONFLICT (name) DO NOTHING;

-- Insert default message templates
INSERT INTO message_templates (name, event_type, template, description) VALUES
    ('daily_matches', 'daily_summary', 
     '*** Service Foot ***
CAN 2022
Bonjour, les matchs du jour 
@{foreach m in model.matchs}
    @{m.home_name} vs @{m.away_name} a @{m.time}
@{end}', 
     'Daily matches summary'),
    
    ('match_starting_soon', 'notstarted',
     '*** Service Foot ***
CAN 2022
Le match : @{model.home_name} vs @{model.away_name}
Commence dans 5 minutes.',
     'Match starting in 5 minutes notification'),
    
    ('match_started', 'started',
     '*** Service Foot ***
CAN 2022
Le match : @{model.home_name} vs @{model.away_name} a commence.
Score : @{model.score}',
     'Match started notification'),
    
    ('added_time', 'addedtime',
     '*** Service Foot ***
CAN 2022
@{model.home_name} vs @{model.away_name}
TEMPS ADDITIONNEL
score : @{model.score}',
     'Added time notification'),
    
    ('halftime', 'halftime',
     '*** Service Foot ***
CAN 2022
@{model.home_name} vs @{model.away_name}
MI-TEMPS
score : @{model.score}',
     'Halftime notification'),
    
    ('match_finished', 'finished',
     '*** Service Foot ***
CAN 2022
@{model.home_name} vs @{model.away_name}
MATCH TERMINE
score final : @{model.score}',
     'Match finished notification'),
    
    ('goal', 'goal',
     '*** Service Foot ***
CAN 2022
@{model.match.home_name} VS @{model.match.away_name}
*@{if model.home_away === "h"} @{model.match.home_name} @{else} @{model.match.away_name} @{fi}* :
NOUVEAU BUT
Par : @{model.player}
Temps : @{model.time} eme minute
Nouveau Score : @{model.match.score}',
     'Goal notification'),
    
    ('goal_penalty', 'goalpenalty',
     '*** Service Foot ***
CAN 2022
@{model.match.home_name} VS @{model.match.away_name}
*@{if model.home_away === "h"} @{model.match.home_name} @{else} @{model.match.away_name} @{fi}* : 
NOUVEAU BUT DE PENALTY
Par : @{model.player}
Temps : @{model.time} eme minute
Nouveau Score : @{model.match.score}',
     'Penalty goal notification'),
    
    ('yellow_card', 'yellowcard',
     '*** Service Foot ***
CAN 2022
@{model.match.home_name} VS @{model.match.away_name}
*@{if model.home_away === "h"} @{model.match.home_name} @{else} @{model.match.away_name} @{fi}* :
CARTON JAUNE
Pour : @{model.player}
Temps : @{model.time} eme minute
Nouveau Score : @{model.match.score}',
     'Yellow card notification'),
    
    ('red_card', 'redcard',
     '*** Service Foot ***
@{model.match.home_name} VS @{model.match.away_name}
@{if model.home_away === "h"} @{model.match.home_name} @{else} @{model.match.away_name} @{fi}* :
CARTON ROUGE
Pour : @{model.player}
Temps : @{model.time} eme minute
Nouveau Score : @{model.match.score}',
     'Red card notification'),
    
    ('substitution', 'substitution',
     '*** Service Foot ***
CAN 2022
@{model.match.home_name} VS @{model.match.away_name}
*@{if model.home_away === "h"} @{model.match.home_name} @{else} @{model.match.away_name} @{fi}* :
REMPLACEMENT
Entrant : @{model.player}
Sortant : @{model.info}
Temps : @{model.time} eme minute
Nouveau Score : @{model.match.score}',
     'Substitution notification'),
    
    ('data_unavailable', 'error',
     'LIVE SCORE API
----CAN 2022------
Données indisponibles pour l''instant.
Revenir à @{model.time_left}, le temps que notre équipe de donnée s''installe
https://live-score-api.com/',
     'Data unavailable message')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_notification_queue_processing ON notification_queue(sent, created_at) WHERE sent = FALSE;
CREATE INDEX idx_worker_logs_recent ON worker_logs(created_at DESC, level);
CREATE INDEX idx_worker_status_active ON worker_status(status, last_heartbeat);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_status_updated_at BEFORE UPDATE ON worker_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
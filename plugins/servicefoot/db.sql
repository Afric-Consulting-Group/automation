-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    unique_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    external_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
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
CREATE TABLE IF NOT EXISTS match_events_notstarted (
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

CREATE TABLE IF NOT EXISTS match_events_started (
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

CREATE TABLE IF NOT EXISTS match_events_addedtime (
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

CREATE TABLE IF NOT EXISTS match_events_halftime (
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

CREATE TABLE IF NOT EXISTS match_events_finished (
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
CREATE TABLE IF NOT EXISTS live_events (
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
CREATE TABLE IF NOT EXISTS events_log (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification queue is now in database.sql

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
INSERT INTO message_templates (name, service, event_type, template, description) VALUES
    ('daily_matches', 'servicefoot', 'daily_summary', 
     '*** Service Foot ***
CAN 2022
Bonjour, les matchs du jour 
@{foreach m in model.matchs}
    @{m.home_name} vs @{m.away_name} a @{m.time}
@{end}', 
     'Daily matches summary'),
    
    ('match_starting_soon', 'servicefoot', 'notstarted',
     '*** Service Foot ***
CAN 2022
Le match : @{model.home_name} vs @{model.away_name}
Commence dans 5 minutes.',
     'Match starting in 5 minutes notification'),
    
    ('match_started', 'servicefoot', 'started',
     '*** Service Foot ***
CAN 2022
Le match : @{model.home_name} vs @{model.away_name} a commence.
Score : @{model.score}',
     'Match started notification'),
    
    ('added_time', 'servicefoot', 'addedtime',
     '*** Service Foot ***
CAN 2022
@{model.home_name} vs @{model.away_name}
TEMPS ADDITIONNEL
score : @{model.score}',
     'Added time notification'),
    
    ('halftime', 'servicefoot', 'halftime',
     '*** Service Foot ***
CAN 2022
@{model.home_name} vs @{model.away_name}
MI-TEMPS
score : @{model.score}',
     'Halftime notification'),
    
    ('match_finished', 'servicefoot', 'finished',
     '*** Service Foot ***
CAN 2022
@{model.home_name} vs @{model.away_name}
MATCH TERMINE
score final : @{model.score}',
     'Match finished notification'),
    
    ('goal', 'servicefoot', 'goal',
     '*** Service Foot ***
CAN 2022
@{model.match.home_name} VS @{model.match.away_name}
*@{if model.home_away === "h"} @{model.match.home_name} @{else} @{model.match.away_name} @{fi}* :
NOUVEAU BUT
Par : @{model.player}
Temps : @{model.time} eme minute
Nouveau Score : @{model.match.score}',
     'Goal notification'),
    
    ('goal_penalty', 'servicefoot', 'goalpenalty',
     '*** Service Foot ***
CAN 2022
@{model.match.home_name} VS @{model.match.away_name}
*@{if model.home_away === "h"} @{model.match.home_name} @{else} @{model.match.away_name} @{fi}* : 
NOUVEAU BUT DE PENALTY
Par : @{model.player}
Temps : @{model.time} eme minute
Nouveau Score : @{model.match.score}',
     'Penalty goal notification'),
    
    ('yellow_card', 'servicefoot', 'yellowcard',
     '*** Service Foot ***
CAN 2022
@{model.match.home_name} VS @{model.match.away_name}
*@{if model.home_away === "h"} @{model.match.home_name} @{else} @{model.match.away_name} @{fi}* :
CARTON JAUNE
Pour : @{model.player}
Temps : @{model.time} eme minute
Nouveau Score : @{model.match.score}',
     'Yellow card notification'),
    
    ('red_card', 'servicefoot', 'redcard',
     '*** Service Foot ***
@{model.match.home_name} VS @{model.match.away_name}
@{if model.home_away === "h"} @{model.match.home_name} @{else} @{model.match.away_name} @{fi}* :
CARTON ROUGE
Pour : @{model.player}
Temps : @{model.time} eme minute
Nouveau Score : @{model.match.score}',
     'Red card notification'),
    
    ('substitution', 'servicefoot', 'substitution',
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
    
    ('data_unavailable', 'servicefoot', 'error',
     'LIVE SCORE API
----CAN 2022------
Données indisponibles pour l''instant.
Revenir à @{model.time_left}, le temps que notre équipe de donnée s''installe
https://live-score-api.com/',
     'Data unavailable message')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_processing ON notification_queue(sent, created_at) WHERE sent = FALSE;
-- worker_logs and worker_status now handled in database.sql or shared

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
-- We check existence of triggers would be complex in SQL, usually they are idempotent if name is same and REPLACE is used if it was a function.
-- Triggers themselves don't have CREATE OR REPLACE.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_config_updated_at') THEN
        CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_teams_updated_at') THEN
        CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_matches_updated_at') THEN
        CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_message_templates_updated_at') THEN
        CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
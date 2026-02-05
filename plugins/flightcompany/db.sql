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

-- Flight companies
CREATE TABLE IF NOT EXISTS flight_companies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE,
    name VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flight routes or updates
CREATE TABLE IF NOT EXISTS flight_updates (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES flight_companies(id) ON DELETE SET NULL,
    route VARCHAR(100),
    status VARCHAR(50),
    date DATE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO message_templates (name, service, event_type, template, description) VALUES
    ('flight_status_update', 'flightcompany', 'status_update',
     '*** Flight Service ***\nCompagnie: @{model.company}\nRoute: @{model.route}\nStatut: @{model.status}\nDate: @{model.date}',
     'Placeholder template for flight status updates')
ON CONFLICT (name) DO NOTHING;

-- Sweety Blood Glucose Tracker Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Glucose Readings table
CREATE TABLE IF NOT EXISTS glucose_readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    glucose_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_reading_date_slot UNIQUE (user_id, reading_date, time_slot),
    CONSTRAINT check_glucose_value_range CHECK (glucose_value >= 40 AND glucose_value <= 600),
    CONSTRAINT check_valid_time_slot CHECK (time_slot IN (
        'Morning (fasting)',
        'After breakfast',
        'After lunch',
        'After dinner'
    ))
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_id ON glucose_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_glucose_readings_reading_date ON glucose_readings(reading_date);
CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_date ON glucose_readings(user_id, reading_date);

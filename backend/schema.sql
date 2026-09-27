-- Database Schema for BhoomiSetu

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    password_or_otp TEXT NOT NULL
);

CREATE TABLE lands (
    id TEXT PRIMARY KEY, -- Unified Land ID
    owner_id TEXT REFERENCES users(id),
    address TEXT,
    area_sqm REAL,
    latitude REAL,
    longitude REAL,
    status TEXT DEFAULT 'Land Identification', -- Stepper: Land Identification -> Survey -> Ownership Verification -> Document Verification -> Legal Verification -> Approval -> Compensation -> Payment -> Acquisition Completion
    risk_score INTEGER DEFAULT 0,
    delay_days INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    land_id TEXT REFERENCES lands(id),
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Aadhar', 'Title Deed', 'Survey Map'
    url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    land_id TEXT REFERENCES lands(id),
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

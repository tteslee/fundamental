-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the records table
CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    memo TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_start_time ON records(start_time);
CREATE INDEX IF NOT EXISTS idx_records_type ON records(type);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- Create RLS policies for records table
CREATE POLICY "Users can view their own records" ON records
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own records" ON records
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own records" ON records
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own records" ON records
    FOR DELETE USING (auth.uid()::text = user_id);

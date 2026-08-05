-- Create user_api_keys table for per-user Appmixer authentication
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  api_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on api_key for faster lookups during API authentication
CREATE INDEX idx_user_api_keys_api_key ON user_api_keys(api_key);

-- Create index on user_id for faster lookups
CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_user_api_keys_updated_at
  BEFORE UPDATE ON user_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own API key
CREATE POLICY "Users can read own api key" ON user_api_keys
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own API key
CREATE POLICY "Users can insert own api key" ON user_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own API key
CREATE POLICY "Users can update own api key" ON user_api_keys
  FOR UPDATE USING (auth.uid() = user_id);

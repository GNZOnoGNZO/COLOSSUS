/*
  # User Profiles Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `gold` (integer)
      - `experience` (integer)
      - `wins` (integer)
      - `losses` (integer)
      - `favorite_cards` (text array)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  gold integer DEFAULT 0,
  experience integer DEFAULT 0,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  favorite_cards text[] DEFAULT ARRAY[]::text[]
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
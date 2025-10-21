/*
  # Create Personal Calendars Schema

  1. New Tables
    - `personal_calendars`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, not null)
      - `description` (text, optional)
      - `color` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `personal_events`
      - `id` (uuid, primary key)
      - `calendar_id` (uuid, references personal_calendars)
      - `title` (text, not null)
      - `description` (text, optional)
      - `color` (text, not null)
      - `category` (text, optional)
      - `created_at` (timestamptz)
    
    - `event_time_slots`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references personal_events)
      - `day` (text, not null)
      - `start_time` (text, not null)
      - `end_time` (text, not null)
    
    - `merged_calendars`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, not null)
      - `academic_schedule_id` (text, optional)
      - `created_at` (timestamptz)
    
    - `merged_calendar_links`
      - `id` (uuid, primary key)
      - `merged_calendar_id` (uuid, references merged_calendars)
      - `personal_calendar_id` (uuid, references personal_calendars)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own calendars
    - Users can only access their own personal calendars and events
    - Proper ownership checks on all operations

  3. Important Notes
    - All timestamps use timestamptz for timezone awareness
    - Colors stored as hex strings
    - Day names stored as text for flexibility
    - Time stored as text in HH:MM format
*/

CREATE TABLE IF NOT EXISTS personal_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#4F46E5',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE personal_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendars"
  ON personal_calendars FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calendars"
  ON personal_calendars FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendars"
  ON personal_calendars FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendars"
  ON personal_calendars FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS personal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id uuid NOT NULL REFERENCES personal_calendars(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#4F46E5',
  category text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events from own calendars"
  ON personal_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personal_calendars
      WHERE personal_calendars.id = personal_events.calendar_id
      AND personal_calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events in own calendars"
  ON personal_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personal_calendars
      WHERE personal_calendars.id = personal_events.calendar_id
      AND personal_calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update events in own calendars"
  ON personal_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personal_calendars
      WHERE personal_calendars.id = personal_events.calendar_id
      AND personal_calendars.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personal_calendars
      WHERE personal_calendars.id = personal_events.calendar_id
      AND personal_calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete events from own calendars"
  ON personal_events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personal_calendars
      WHERE personal_calendars.id = personal_events.calendar_id
      AND personal_calendars.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS event_time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  day text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL
);

ALTER TABLE event_time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view time slots from own events"
  ON event_time_slots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personal_events
      JOIN personal_calendars ON personal_calendars.id = personal_events.calendar_id
      WHERE personal_events.id = event_time_slots.event_id
      AND personal_calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create time slots in own events"
  ON event_time_slots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personal_events
      JOIN personal_calendars ON personal_calendars.id = personal_events.calendar_id
      WHERE personal_events.id = event_time_slots.event_id
      AND personal_calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update time slots in own events"
  ON event_time_slots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personal_events
      JOIN personal_calendars ON personal_calendars.id = personal_events.calendar_id
      WHERE personal_events.id = event_time_slots.event_id
      AND personal_calendars.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personal_events
      JOIN personal_calendars ON personal_calendars.id = personal_events.calendar_id
      WHERE personal_events.id = event_time_slots.event_id
      AND personal_calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete time slots from own events"
  ON event_time_slots FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personal_events
      JOIN personal_calendars ON personal_calendars.id = personal_events.calendar_id
      WHERE personal_events.id = event_time_slots.event_id
      AND personal_calendars.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS merged_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  academic_schedule_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE merged_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own merged calendars"
  ON merged_calendars FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own merged calendars"
  ON merged_calendars FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own merged calendars"
  ON merged_calendars FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own merged calendars"
  ON merged_calendars FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS merged_calendar_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merged_calendar_id uuid NOT NULL REFERENCES merged_calendars(id) ON DELETE CASCADE,
  personal_calendar_id uuid NOT NULL REFERENCES personal_calendars(id) ON DELETE CASCADE,
  UNIQUE(merged_calendar_id, personal_calendar_id)
);

ALTER TABLE merged_calendar_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view links in own merged calendars"
  ON merged_calendar_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM merged_calendars
      WHERE merged_calendars.id = merged_calendar_links.merged_calendar_id
      AND merged_calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create links in own merged calendars"
  ON merged_calendar_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merged_calendars
      WHERE merged_calendars.id = merged_calendar_links.merged_calendar_id
      AND merged_calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete links from own merged calendars"
  ON merged_calendar_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM merged_calendars
      WHERE merged_calendars.id = merged_calendar_links.merged_calendar_id
      AND merged_calendars.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_personal_calendars_user_id ON personal_calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_events_calendar_id ON personal_events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_event_time_slots_event_id ON event_time_slots(event_id);
CREATE INDEX IF NOT EXISTS idx_merged_calendars_user_id ON merged_calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_merged_calendar_links_merged_id ON merged_calendar_links(merged_calendar_id);
CREATE INDEX IF NOT EXISTS idx_merged_calendar_links_personal_id ON merged_calendar_links(personal_calendar_id);

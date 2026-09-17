ALTER TABLE travel_expenses.trips
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id);

CREATE TABLE IF NOT EXISTS travel_expenses.trip_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES travel_expenses.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (trip_id, user_id)
);

CREATE TABLE IF NOT EXISTS travel_expenses.trip_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES travel_expenses.trips(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_members_trip_id ON travel_expenses.trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user_id ON travel_expenses.trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_trip_id ON travel_expenses.trip_invitations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_email ON travel_expenses.trip_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_status ON travel_expenses.trip_invitations(status);

CREATE OR REPLACE FUNCTION travel_expenses.add_trip_owner_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = travel_expenses, public
AS $$
BEGIN
  INSERT INTO travel_expenses.trip_members (trip_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner')
  ON CONFLICT (trip_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_add_trip_owner_membership ON travel_expenses.trips;
CREATE TRIGGER trg_add_trip_owner_membership
AFTER INSERT ON travel_expenses.trips
FOR EACH ROW
EXECUTE FUNCTION travel_expenses.add_trip_owner_membership();

ALTER TABLE travel_expenses.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_expenses.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_expenses.trip_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trips are visible to owner or shared members" ON travel_expenses.trips;
DROP POLICY IF EXISTS "Trips can be inserted by owner" ON travel_expenses.trips;
DROP POLICY IF EXISTS "Trips can be updated by owner or shared members" ON travel_expenses.trips;
DROP POLICY IF EXISTS "Trips can be deleted only by owner" ON travel_expenses.trips;

DROP POLICY IF EXISTS "Trip members visible to trip participants" ON travel_expenses.trip_members;
DROP POLICY IF EXISTS "Trip members can be created by owner" ON travel_expenses.trip_members;
DROP POLICY IF EXISTS "Trip members can be removed by owner or self" ON travel_expenses.trip_members;

DROP POLICY IF EXISTS "Trip invitations visible to owner or trip members" ON travel_expenses.trip_invitations;
DROP POLICY IF EXISTS "Trip invitations can be created by owner" ON travel_expenses.trip_invitations;
DROP POLICY IF EXISTS "Trip invitations can be updated by owner" ON travel_expenses.trip_invitations;

CREATE POLICY "Trips are visible to owner or shared members"
ON travel_expenses.trips
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM travel_expenses.trip_members tm
    WHERE tm.trip_id = trips.id
      AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Trips can be inserted by owner"
ON travel_expenses.trips
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trips can be updated by owner or shared members"
ON travel_expenses.trips
FOR UPDATE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM travel_expenses.trip_members tm
    WHERE tm.trip_id = trips.id
      AND tm.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM travel_expenses.trip_members tm
    WHERE tm.trip_id = trips.id
      AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Trips can be deleted only by owner"
ON travel_expenses.trips
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Trip members visible to trip participants"
ON travel_expenses.trip_members
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM travel_expenses.trip_members tm
    WHERE tm.trip_id = trip_members.trip_id
      AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Trip members can be created by owner"
ON travel_expenses.trip_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM travel_expenses.trips t
    WHERE t.id = trip_members.trip_id
      AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Trip members can be removed by owner or self"
ON travel_expenses.trip_members
FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM travel_expenses.trips t
    WHERE t.id = trip_members.trip_id
      AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Trip invitations visible to owner or trip members"
ON travel_expenses.trip_invitations
FOR SELECT
USING (
  invited_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM travel_expenses.trip_members tm
    WHERE tm.trip_id = trip_invitations.trip_id
      AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Trip invitations can be created by owner"
ON travel_expenses.trip_invitations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM travel_expenses.trips t
    WHERE t.id = trip_invitations.trip_id
      AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Trip invitations can be updated by owner"
ON travel_expenses.trip_invitations
FOR UPDATE
USING (
  invited_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM travel_expenses.trips t
    WHERE t.id = trip_invitations.trip_id
      AND t.user_id = auth.uid()
  )
)
WITH CHECK (
  invited_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM travel_expenses.trips t
    WHERE t.id = trip_invitations.trip_id
      AND t.user_id = auth.uid()
  )
);

ALTER TABLE travel_expenses.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own expenses" ON travel_expenses.expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON travel_expenses.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON travel_expenses.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON travel_expenses.expenses;

CREATE POLICY "Users can view shared trip expenses"
ON travel_expenses.expenses
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM travel_expenses.trip_members tm
    WHERE tm.trip_id = expenses.trip_id
      AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert shared trip expenses"
ON travel_expenses.expenses
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM travel_expenses.trip_members tm
    WHERE tm.trip_id = expenses.trip_id
      AND tm.user_id = auth.uid()
  )
  AND NOT EXISTS (
    SELECT 1
    FROM travel_expenses.trips t
    WHERE t.id = expenses.trip_id
      AND t.status = 'cancelled'
  )
);

CREATE POLICY "Users can update shared trip expenses"
ON travel_expenses.expenses
FOR UPDATE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM travel_expenses.trip_members tm
    WHERE tm.trip_id = expenses.trip_id
      AND tm.user_id = auth.uid()
  )
)
WITH CHECK (
  (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM travel_expenses.trip_members tm
      WHERE tm.trip_id = expenses.trip_id
        AND tm.user_id = auth.uid()
    )
  )
  AND NOT EXISTS (
    SELECT 1
    FROM travel_expenses.trips t
    WHERE t.id = expenses.trip_id
      AND t.status = 'cancelled'
  )
);

CREATE POLICY "Users can delete shared trip expenses"
ON travel_expenses.expenses
FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM travel_expenses.trip_members tm
    WHERE tm.trip_id = expenses.trip_id
      AND tm.user_id = auth.uid()
  )
);

ALTER TABLE travel_expenses.trips
ALTER COLUMN status SET DEFAULT 'active';

-- This migration repairs the initial shared-trip migration if it was only partially applied.
-- Run this migration after 003; it is safe to run once on an existing project.

INSERT INTO travel_expenses.trip_members (trip_id, user_id, role)
SELECT id, user_id, 'owner'
FROM travel_expenses.trips t
WHERE NOT EXISTS (
  SELECT 1
  FROM travel_expenses.trip_members tm
  WHERE tm.trip_id = t.id AND tm.user_id = t.user_id
)
ON CONFLICT (trip_id, user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION travel_expenses.is_trip_member(target_trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = travel_expenses, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM travel_expenses.trip_members
    WHERE trip_id = target_trip_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION travel_expenses.is_trip_owner(target_trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = travel_expenses, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM travel_expenses.trips
    WHERE id = target_trip_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION travel_expenses.trip_is_active(target_trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = travel_expenses, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM travel_expenses.trips
    WHERE id = target_trip_id
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION travel_expenses.enforce_trip_status_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = travel_expenses, public
AS $$
BEGIN
  IF (
    NEW.status IS DISTINCT FROM OLD.status
    OR NEW.cancelled_at IS DISTINCT FROM OLD.cancelled_at
    OR NEW.cancelled_by IS DISTINCT FROM OLD.cancelled_by
  ) AND NOT travel_expenses.is_trip_owner(OLD.id) THEN
    RAISE EXCEPTION 'Only the trip owner can cancel or reactivate a trip';
  END IF;

  IF OLD.status = 'cancelled' AND NEW.status = 'cancelled' THEN
    RAISE EXCEPTION 'Cancelled trips must be reactivated before they can be edited';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_trip_status_permissions ON travel_expenses.trips;
CREATE TRIGGER trg_enforce_trip_status_permissions
BEFORE UPDATE ON travel_expenses.trips
FOR EACH ROW
EXECUTE FUNCTION travel_expenses.enforce_trip_status_permissions();

GRANT USAGE ON SCHEMA travel_expenses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON travel_expenses.trip_members, travel_expenses.trip_invitations TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA travel_expenses TO anon, authenticated;
GRANT EXECUTE ON FUNCTION travel_expenses.is_trip_member(UUID), travel_expenses.is_trip_owner(UUID), travel_expenses.trip_is_active(UUID) TO anon, authenticated;

DROP POLICY IF EXISTS "Trips are visible to owner or shared members" ON travel_expenses.trips;
DROP POLICY IF EXISTS "Trips can be inserted by owner" ON travel_expenses.trips;
DROP POLICY IF EXISTS "Trips can be updated by owner or shared members" ON travel_expenses.trips;
DROP POLICY IF EXISTS "Trips can be deleted only by owner" ON travel_expenses.trips;

CREATE POLICY "Trips are visible to owner or shared members"
ON travel_expenses.trips
FOR SELECT
USING (travel_expenses.is_trip_member(id));

CREATE POLICY "Trips can be inserted by owner"
ON travel_expenses.trips
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trips can be updated by owner or shared members"
ON travel_expenses.trips
FOR UPDATE
USING (travel_expenses.is_trip_member(id))
WITH CHECK (travel_expenses.is_trip_member(id));

CREATE POLICY "Trips can be deleted only by owner"
ON travel_expenses.trips
FOR DELETE
USING (travel_expenses.is_trip_owner(id));

DROP POLICY IF EXISTS "Trip members visible to trip participants" ON travel_expenses.trip_members;
DROP POLICY IF EXISTS "Trip members can be created by owner" ON travel_expenses.trip_members;
DROP POLICY IF EXISTS "Trip members can be removed by owner or self" ON travel_expenses.trip_members;

CREATE POLICY "Trip members visible to trip participants"
ON travel_expenses.trip_members
FOR SELECT
USING (travel_expenses.is_trip_member(trip_id));

CREATE POLICY "Trip members can be created by owner"
ON travel_expenses.trip_members
FOR INSERT
WITH CHECK (travel_expenses.is_trip_owner(trip_id));

CREATE POLICY "Trip members can be removed by owner or self"
ON travel_expenses.trip_members
FOR DELETE
USING (travel_expenses.is_trip_owner(trip_id) OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Trip invitations visible to owner or trip members" ON travel_expenses.trip_invitations;
DROP POLICY IF EXISTS "Trip invitations can be created by owner" ON travel_expenses.trip_invitations;
DROP POLICY IF EXISTS "Trip invitations can be updated by owner" ON travel_expenses.trip_invitations;

CREATE POLICY "Trip invitations visible to owner or trip members"
ON travel_expenses.trip_invitations
FOR SELECT
USING (travel_expenses.is_trip_member(trip_id));

CREATE POLICY "Trip invitations can be created by owner"
ON travel_expenses.trip_invitations
FOR INSERT
WITH CHECK (travel_expenses.is_trip_owner(trip_id));

CREATE POLICY "Trip invitations can be updated by owner"
ON travel_expenses.trip_invitations
FOR UPDATE
USING (travel_expenses.is_trip_owner(trip_id))
WITH CHECK (travel_expenses.is_trip_owner(trip_id));

DROP POLICY IF EXISTS "Users can view shared trip expenses" ON travel_expenses.expenses;
DROP POLICY IF EXISTS "Users can insert shared trip expenses" ON travel_expenses.expenses;
DROP POLICY IF EXISTS "Users can update shared trip expenses" ON travel_expenses.expenses;
DROP POLICY IF EXISTS "Users can delete shared trip expenses" ON travel_expenses.expenses;

CREATE POLICY "Users can view shared trip expenses"
ON travel_expenses.expenses
FOR SELECT
USING (travel_expenses.is_trip_member(trip_id));

CREATE POLICY "Users can insert shared trip expenses"
ON travel_expenses.expenses
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND travel_expenses.is_trip_member(trip_id)
  AND travel_expenses.trip_is_active(trip_id)
);

CREATE POLICY "Users can update shared trip expenses"
ON travel_expenses.expenses
FOR UPDATE
USING (
  travel_expenses.is_trip_member(trip_id)
  AND travel_expenses.trip_is_active(trip_id)
)
WITH CHECK (
  travel_expenses.is_trip_member(trip_id)
  AND travel_expenses.trip_is_active(trip_id)
);

CREATE POLICY "Users can delete shared trip expenses"
ON travel_expenses.expenses
FOR DELETE
USING (
  travel_expenses.is_trip_member(trip_id)
  AND travel_expenses.trip_is_active(trip_id)
);

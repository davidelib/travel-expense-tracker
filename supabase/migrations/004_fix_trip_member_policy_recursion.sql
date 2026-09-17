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

GRANT EXECUTE ON FUNCTION travel_expenses.is_trip_member(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION travel_expenses.is_trip_owner(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION travel_expenses.trip_is_active(UUID) TO authenticated, anon;

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

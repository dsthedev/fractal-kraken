-- Reset PostgreSQL sequences after importing data with explicit IDs
-- Run this after importing data via SQL to sync auto-increment sequences

-- Reset Estimate sequence
SELECT setval(pg_get_serial_sequence('"Estimate"', 'id'), COALESCE(MAX(id), 1), true) FROM "Estimate";

-- Reset BillableItem sequence
SELECT setval(pg_get_serial_sequence('"BillableItem"', 'id'), COALESCE(MAX(id), 1), true) FROM "BillableItem";

-- Reset Entity sequence
SELECT setval(pg_get_serial_sequence('"Entity"', 'id'), COALESCE(MAX(id), 1), true) FROM "Entity";

-- Reset Rate sequence
SELECT setval(pg_get_serial_sequence('"Rate"', 'id'), COALESCE(MAX(id), 1), true) FROM "Rate";

-- Reset MeasurementUnit sequence
SELECT setval(pg_get_serial_sequence('"MeasurementUnit"', 'id'), COALESCE(MAX(id), 1), true) FROM "MeasurementUnit";

-- Reset Action sequence
SELECT setval(pg_get_serial_sequence('"Action"', 'id'), COALESCE(MAX(id), 1), true) FROM "Action";

-- Reset Material sequence
SELECT setval(pg_get_serial_sequence('"Material"', 'id'), COALESCE(MAX(id), 1), true) FROM "Material";

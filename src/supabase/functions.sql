
-- Create a function to insert status history records
CREATE OR REPLACE FUNCTION public.insert_status_history(
  p_appointment_id UUID,
  p_previous_status TEXT,
  p_new_status TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO public.appointment_status_history (
    appointment_id, 
    previous_status, 
    new_status
  ) VALUES (
    p_appointment_id,
    p_previous_status,
    p_new_status
  );
END;
$$ LANGUAGE plpgsql;

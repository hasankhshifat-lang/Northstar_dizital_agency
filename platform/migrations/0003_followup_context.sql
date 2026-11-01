-- Variables captured when a follow-up is scheduled ({product}, {order_number}); rendered at send time.
ALTER TABLE followup_sends ADD COLUMN context TEXT;

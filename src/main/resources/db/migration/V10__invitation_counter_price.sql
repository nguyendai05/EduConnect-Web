ALTER TABLE invitations ADD COLUMN tutor_proposed_price DECIMAL(19,0) NULL;
ALTER TABLE invitations ADD CONSTRAINT ck_invitation_counter_price CHECK (tutor_proposed_price IS NULL OR tutor_proposed_price > 0);

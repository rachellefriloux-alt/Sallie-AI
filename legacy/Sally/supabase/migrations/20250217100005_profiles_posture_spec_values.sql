-- Allow posture values from Digital Progeny v5.4 spec (COMPANION, COPILOT, PEER, EXPERT)
-- while keeping legacy values for backward compatibility.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_posture_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_posture_check CHECK (
  posture IN (
    'Strategist', 'Lioness', 'Partner', 'Friend',
    'COMPANION', 'COPILOT', 'PEER', 'EXPERT'
  )
);

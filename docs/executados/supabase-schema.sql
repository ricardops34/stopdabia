-- ============================================================
-- Bia STOP — Schema do banco de dados (Supabase)
-- Rodar em: supabase.com → projeto → SQL Editor → New query
-- ============================================================

-- Perfil do jogador (ligado ao auth.users do Supabase)
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname   TEXT NOT NULL,
  avatar_id  INT  NOT NULL DEFAULT 1 CHECK (avatar_id BETWEEN 1 AND 15),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progresso da trilha individual por letra
CREATE TABLE trail_progress (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  letter     CHAR(1) NOT NULL CHECK (letter BETWEEN 'A' AND 'Z'),
  score      INT NOT NULL DEFAULT 0,
  max_score  INT NOT NULL DEFAULT 0,
  played_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, letter)   -- upsert: uma linha por letra por jogador
);

-- Histórico de partidas multiplayer
CREATE TABLE match_results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_code  TEXT NOT NULL,
  score      INT NOT NULL DEFAULT 0,
  position   INT NOT NULL DEFAULT 1,
  played_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Ranking geral (view calculada) ──────────────────────────
CREATE VIEW ranking AS
SELECT
  p.id,
  p.nickname,
  p.avatar_id,
  COALESCE(SUM(t.score), 0)     AS total_score,
  COUNT(t.letter)               AS letters_played,
  RANK() OVER (ORDER BY COALESCE(SUM(t.score), 0) DESC) AS position
FROM profiles p
LEFT JOIN trail_progress t ON t.user_id = p.id
GROUP BY p.id, p.nickname, p.avatar_id
ORDER BY total_score DESC;

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results  ENABLE ROW LEVEL SECURITY;

-- Cada jogador só acessa seus próprios dados
CREATE POLICY "profiles: próprio" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "trail: próprio" ON trail_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "matches: próprio" ON match_results
  FOR ALL USING (auth.uid() = user_id);

-- Ranking é público (leitura)
CREATE POLICY "ranking: leitura pública" ON profiles
  FOR SELECT USING (true);

-- ── Trigger: criar perfil ao registrar ──────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    1
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

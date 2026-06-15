CREATE TABLE IF NOT EXISTS profile (
  id       INTEGER PRIMARY KEY DEFAULT 1,
  height   NUMERIC,
  weight   NUMERIC,
  age      INTEGER,
  gender   VARCHAR(10),
  activity NUMERIC,
  goal     VARCHAR(20),
  fiber_goal INTEGER NOT NULL DEFAULT 25,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS food_logs (
  id         SERIAL PRIMARY KEY,
  log_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
  meal       VARCHAR(50) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  amount     NUMERIC     NOT NULL,
  kcal       NUMERIC     NOT NULL,
  prot       NUMERIC     NOT NULL DEFAULT 0,
  karb       NUMERIC     NOT NULL DEFAULT 0,
  yag        NUMERIC     NOT NULL DEFAULT 0,
  lif        NUMERIC     NOT NULL DEFAULT 0,
  unhealthy  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs (log_date);

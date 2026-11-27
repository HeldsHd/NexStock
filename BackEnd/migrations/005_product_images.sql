BEGIN;

CREATE TABLE IF NOT EXISTS produto_imagens (
  produto_id INTEGER PRIMARY KEY REFERENCES produtos(id) ON DELETE CASCADE,
  imagem_url TEXT,
  imagem BYTEA,
  imagem_mime VARCHAR(40),
  CHECK (
    (imagem_url IS NOT NULL AND imagem IS NULL AND imagem_mime IS NULL)
    OR (imagem_url IS NULL AND imagem IS NOT NULL AND imagem_mime IS NOT NULL)
  )
);

COMMIT;

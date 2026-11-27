export function productJson(alias: string, lastMovementExpression: string, imageUrlExpression?: string) {
  const currentImageUrl = `(SELECT CASE
                              WHEN imagem.imagem IS NOT NULL
                                THEN '/produtos/' || imagem.produto_id::text || '/imagem?v=' || EXTRACT(EPOCH FROM imagem.updated_at)::text
                              ELSE imagem.imagem_url
                            END
                            FROM produto_imagens imagem
                            WHERE imagem.produto_id = ${alias}.id)`;

  return `(
    to_jsonb(${alias})
    || jsonb_build_object(
      'imagem_url',
      ${imageUrlExpression ? `COALESCE(${imageUrlExpression}, ${currentImageUrl})` : currentImageUrl},
      'ultima_movimentacao', ${lastMovementExpression}
    )
  )`;
}

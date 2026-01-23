-- Comprehensive dump of word sets with feedback and source
-- Run this in Supabase SQL Editor

-- 1. Overview: Word sets with aggregated feedback counts
SELECT
  ws.id,
  ws.source,
  ws.created_at,
  ws.quality_score,
  ws.times_used,
  COUNT(gf.id) as total_feedback_count,
  COUNT(CASE WHEN gf.rating = 'excellent' THEN 1 END) as excellent_count,
  COUNT(CASE WHEN gf.rating = 'good' THEN 1 END) as good_count,
  COUNT(CASE WHEN gf.rating = 'too_easy' THEN 1 END) as too_easy_count,
  COUNT(CASE WHEN gf.rating = 'bad' THEN 1 END) as bad_count,
  jsonb_array_length(ws.groups) as group_count
FROM word_sets ws
LEFT JOIN group_feedback gf ON gf.word_set_id = ws.id
GROUP BY ws.id, ws.source, ws.created_at, ws.quality_score, ws.times_used, ws.groups
ORDER BY ws.created_at DESC;

-- 2. Detailed: All groups with their feedback
SELECT
  ws.id as word_set_id,
  ws.source,
  ws.created_at,
  ws.quality_score,
  ws.times_used,
  g.idx as group_index,
  (ws.groups->g.idx->>'category') as category,
  (ws.groups->g.idx->>'words') as words,
  gf.rating,
  gf.feedback_text,
  gf.created_at as feedback_date
FROM word_sets ws
CROSS JOIN LATERAL generate_series(0, jsonb_array_length(ws.groups) - 1) AS g(idx)
LEFT JOIN group_feedback gf
  ON gf.word_set_id = ws.id
  AND gf.group_index = g.idx
ORDER BY ws.created_at DESC, g.idx;

-- 3. Bad groups only (for prompt improvement)
SELECT
  ws.id as word_set_id,
  ws.source,
  ws.created_at,
  (ws.groups->gf.group_index->>'category') as category,
  (ws.groups->gf.group_index->>'words') as words,
  gf.rating,
  gf.feedback_text,
  gf.created_at as feedback_date
FROM word_sets ws
JOIN group_feedback gf ON gf.word_set_id = ws.id
WHERE gf.rating = 'bad'
ORDER BY gf.created_at DESC;

-- 4. Gemini-specific groups with all ratings
SELECT
  ws.id as word_set_id,
  ws.created_at,
  ws.quality_score,
  ws.times_used,
  g.idx as group_index,
  (ws.groups->g.idx->>'category') as category,
  (ws.groups->g.idx->>'words') as words,
  gf.rating,
  gf.feedback_text
FROM word_sets ws
CROSS JOIN LATERAL generate_series(0, jsonb_array_length(ws.groups) - 1) AS g(idx)
LEFT JOIN group_feedback gf
  ON gf.word_set_id = ws.id
  AND gf.group_index = g.idx
WHERE ws.source = 'gemini'
ORDER BY ws.created_at DESC, g.idx;

-- 5. DN vs Gemini comparison
SELECT
  ws.source,
  COUNT(DISTINCT ws.id) as total_word_sets,
  AVG(ws.quality_score) as avg_quality,
  SUM(ws.times_used) as total_uses,
  COUNT(gf.id) as total_feedback,
  COUNT(CASE WHEN gf.rating = 'excellent' THEN 1 END) as excellent,
  COUNT(CASE WHEN gf.rating = 'good' THEN 1 END) as good,
  COUNT(CASE WHEN gf.rating = 'too_easy' THEN 1 END) as too_easy,
  COUNT(CASE WHEN gf.rating = 'bad' THEN 1 END) as bad,
  ROUND(100.0 * COUNT(CASE WHEN gf.rating IN ('excellent', 'good') THEN 1 END) / NULLIF(COUNT(gf.id), 0), 2) as positive_percentage
FROM word_sets ws
LEFT JOIN group_feedback gf ON gf.word_set_id = ws.id
WHERE ws.source IS NOT NULL
GROUP BY ws.source
ORDER BY ws.source;

-- 6. Export-friendly CSV format (all data)
-- Copy the results of this query and save as CSV
SELECT
  ws.id as word_set_id,
  ws.source,
  TO_CHAR(ws.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
  ws.quality_score,
  ws.times_used,
  g.idx as group_number,
  (ws.groups->g.idx->>'category') as category,
  (ws.groups->g.idx->'words'->>0) as word1,
  (ws.groups->g.idx->'words'->>1) as word2,
  (ws.groups->g.idx->'words'->>2) as word3,
  (ws.groups->g.idx->'words'->>3) as word4,
  COALESCE(gf.rating, 'no_feedback') as rating,
  COALESCE(gf.feedback_text, '') as feedback_text,
  COALESCE(TO_CHAR(gf.created_at, 'YYYY-MM-DD HH24:MI:SS'), '') as feedback_date
FROM word_sets ws
CROSS JOIN LATERAL generate_series(0, jsonb_array_length(ws.groups) - 1) AS g(idx)
LEFT JOIN group_feedback gf
  ON gf.word_set_id = ws.id
  AND gf.group_index = g.idx
ORDER BY ws.created_at DESC, g.idx;

-- 7. Bad groups from bad_groups table (negative training data)
SELECT
  bg.id,
  bg.category,
  bg.words,
  bg.reason,
  TO_CHAR(bg.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
FROM bad_groups bg
ORDER BY bg.created_at DESC;

-- A sat exam is a fourth kind of assessment, alongside the topic quiz, the chapter
-- mini exam, and the course-wide practice paper.
--
-- This is its own migration because Postgres will not let a newly added enum value
-- be used by statements in the same transaction, and 202609190002 needs to use it.
alter type public.assessment_mode add value if not exists 'exam';

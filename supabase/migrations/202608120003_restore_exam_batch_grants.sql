-- Recreating the randomized batch function reset function privileges.
-- Keep its deliberately safe question-only response available to public readers;
-- answer keys and marking contexts remain service-role only.
revoke all on function public.get_public_exam_question_batch(text, text, public.quiz_question_type, integer) from public, anon, authenticated;
grant execute on function public.get_public_exam_question_batch(text, text, public.quiz_question_type, integer) to anon, authenticated;

-- Seed achievements used by quiz submissions if they don't already exist
-- Codes: bronze_quiz (>=80%), silver_quiz (>=90%), perfect_quiz (100%)

insert into public.achievements (
   code,
   name,
   description,
   tier
)
   select 'bronze_quiz',
          'Bronze Quiz',
          'Score at least 80% on a quiz',
          'bronze'
    where not exists (
      select 1
        from public.achievements
       where code = 'bronze_quiz'
   );

insert into public.achievements (
   code,
   name,
   description,
   tier
)
   select 'silver_quiz',
          'Silver Quiz',
          'Score at least 90% on a quiz',
          'silver'
    where not exists (
      select 1
        from public.achievements
       where code = 'silver_quiz'
   );

insert into public.achievements (
   code,
   name,
   description,
   tier
)
   select 'perfect_quiz',
          'Perfect Score',
          'Score 100% on a quiz',
          'gold'
    where not exists (
      select 1
        from public.achievements
       where code = 'perfect_quiz'
   );
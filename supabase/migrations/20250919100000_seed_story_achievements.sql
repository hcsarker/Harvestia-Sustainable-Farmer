-- Seed achievements for Story Journey chapters and master badge
-- Codes created: story_ch1, story_ch2, story_ch3, story_ch4, story_master

insert into public.achievements (
   code,
   name,
   description,
   tier
)
   select 'story_ch1',
          'Story: Chapter 1',
          'Complete Story Chapter 1',
          'bronze'
    where not exists (
      select 1
        from public.achievements
       where code = 'story_ch1'
   );

insert into public.achievements (
   code,
   name,
   description,
   tier
)
   select 'story_ch2',
          'Story: Chapter 2',
          'Complete Story Chapter 2',
          'bronze'
    where not exists (
      select 1
        from public.achievements
       where code = 'story_ch2'
   );

insert into public.achievements (
   code,
   name,
   description,
   tier
)
   select 'story_ch3',
          'Story: Chapter 3',
          'Complete Story Chapter 3',
          'silver'
    where not exists (
      select 1
        from public.achievements
       where code = 'story_ch3'
   );

insert into public.achievements (
   code,
   name,
   description,
   tier
)
   select 'story_ch4',
          'Story: Chapter 4',
          'Complete Story Chapter 4',
          'gold'
    where not exists (
      select 1
        from public.achievements
       where code = 'story_ch4'
   );

insert into public.achievements (
   code,
   name,
   description,
   tier
)
   select 'story_master',
          'Story Master',
          'Complete all Story Journey chapters',
          'gold'
    where not exists (
      select 1
        from public.achievements
       where code = 'story_master'
   );
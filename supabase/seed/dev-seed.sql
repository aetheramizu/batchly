-- Batchly development seed data (CLAUDE.md §33, TEST_PLAN §5).
--
-- Loads a realistic collection for ONE existing, confirmed account and
-- replaces any data that account already has. Never run against production.
--
--   1. Create/confirm the account through the app.
--   2. Set the email below.
--   3. npx supabase db query --linked -f supabase/seed/dev-seed.sql
--
-- Runs as the database owner, so user_id is set explicitly. Schema triggers
-- and constraints (Group Order batch rules, payment ranges) still apply.
-- Dates are relative to today so stale-tracking examples stay stale.

create temp table seed_account on commit drop as
select id as user_id from auth.users where email = 'collector.test@batchly.dev';

do $$
begin
  if (select count(*) from seed_account) <> 1 then
    raise exception 'Seed account not found. Set the email in dev-seed.sql.';
  end if;
end $$;

-- Reset this account only.
delete from public.additional_costs where user_id = (select user_id from seed_account);
delete from public.purchases where user_id = (select user_id from seed_account);
delete from public.batches where user_id = (select user_id from seed_account);
delete from public.sources where user_id = (select user_id from seed_account);

-- Sources: platform is independent from type.
insert into public.sources (user_id, name, type, platform)
select a.user_id, v.name, v.type::public.source_type, v.platform
from seed_account a
cross join (values
  ('GO Seoulmate', 'GROUP_ORDER', 'WhatsApp'),
  ('Tokyopick GO', 'GROUP_ORDER', 'LINE'),
  ('Chingu Dropship', 'GROUP_ORDER', 'X'),
  ('Mandarin Merch GO', 'GROUP_ORDER', 'WhatsApp'),
  ('Bangkok Slot Club', 'GROUP_ORDER', 'LINE'),
  ('Merlion Pop GO', 'GROUP_ORDER', 'X'),
  ('Seller Jane', 'DIRECT_SELLER', 'X'),
  ('Kpop Haul ID', 'DIRECT_SELLER', 'WhatsApp'),
  ('Hana''s Closet', 'DIRECT_SELLER', 'Other'),
  ('Photocard Corner by Rina — Official Trusted Seller Account', 'DIRECT_SELLER', 'X')
) as v(name, type, platform);

-- Batches (Group Order only). Batch 42 exists under two sources on purpose.
insert into public.batches (user_id, source_id, country, batch_number, batch_date, status, last_updated_at, notes)
select a.user_id, s.id, v.country::public.country, v.num, current_date - v.age_days,
       v.status::public.tracking_status, now() - make_interval(days => v.update_days), v.notes
from seed_account a
cross join (values
  ('GO Seoulmate',      'KOREA',     '45',  34, 'IN_TRANSIT',     2,  'EMS from Seoul. Second payment (shipping + tax) announced on arrival.'),
  ('GO Seoulmate',      'KOREA',     '48',  21, 'ADMIN_RECEIVED', 1,  null),
  ('GO Seoulmate',      'KOREA',     '39',  95, 'DELIVERED',      40, null),
  ('GO Seoulmate',      'KOREA',     '51',  4,  'PURCHASED',      3,  null),
  ('GO Seoulmate',      'CHINA',     '42',  50, 'WAREHOUSE',      20, 'Waiting for the rest of the batch to arrive at the warehouse.'),
  ('Tokyopick GO',      'JAPAN',     '18',  28, 'WAREHOUSE',      5,  null),
  ('Tokyopick GO',      'JAPAN',     '42',  46, 'IN_TRANSIT',     16, null),
  ('Tokyopick GO',      'JAPAN',     '12',  120,'DELIVERED',      60, null),
  ('Chingu Dropship',   'KOREA',     '7',   40, 'INDONESIA',      9,  null),
  ('Chingu Dropship',   'KOREA',     '8',   31, 'PURCHASED',      25, null),
  ('Mandarin Merch GO', 'CHINA',     '101', 18, 'IN_TRANSIT',     4,  null),
  ('Mandarin Merch GO', 'CHINA',     '102', 44, 'WAREHOUSE',      30, null),
  ('Mandarin Merch GO', 'CHINA',     '99',  70, 'DELIVERED',      12, null),
  ('Bangkok Slot Club', 'THAILAND',  '3',   25, 'ADMIN_RECEIVED', 6,  null),
  ('Bangkok Slot Club', 'THAILAND',  '4',   6,  'PURCHASED',      1,  null),
  ('Merlion Pop GO',    'SINGAPORE', '21',  38, 'INDONESIA',      15, null)
) as v(source_name, country, num, age_days, status, update_days, notes)
join public.sources s on s.user_id = a.user_id and s.name = v.source_name;

-- Group Order purchases: tracking comes from the batch.
insert into public.purchases (
  user_id, source_id, batch_id, item_name, artist_group, price, paid_amount, purchase_date,
  purchase_origin, ownership_status, os_price, os_paid_amount, os_date, os_notes, notes
)
select a.user_id, b.source_id, b.id, v.item, v.artist, v.price, v.paid, current_date - v.age_days,
       v.origin::public.purchase_origin, v.own::public.ownership_status,
       v.os_price, v.os_paid, case when v.os_price is null then null else current_date - v.os_age end,
       v.os_notes, v.notes
from seed_account a
cross join (values
  -- source, country, batch, item, artist, price, paid, age, origin, ownership, os_price, os_paid, os_age, os_notes, notes
  ('GO Seoulmate', 'KOREA', '45', 'Wonyoung Sector 17 Weverse POB', 'IVE', 145000, 100000, 33, 'NEW', 'ACTIVE', null::numeric, null::numeric, null::int, null, 'Member slot confirmed. Second payment due on arrival.'),
  ('GO Seoulmate', 'KOREA', '45', 'Wonwoo Sector 17 Weverse POB', 'SEVENTEEN', 145000, 145000, 33, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('GO Seoulmate', 'KOREA', '45', 'Karina Armageddon Special POB', 'aespa', 220000, 220000, 32, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('GO Seoulmate', 'KOREA', '45', 'Chaewon Easy Compact Card', 'LE SSERAFIM', 95000, 0, 31, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('GO Seoulmate', 'KOREA', '45', 'Juun Lucky Draw PC', 'TWS', 90000, 90000, 30, 'NEW', 'GIVEN_OS', 80000, 40000, 10, 'OS to @minji_collects, rest paid on arrival', null),
  ('GO Seoulmate', 'KOREA', '48', 'Hanni Supernatural Bag Ver.', 'NewJeans', 480000, 480000, 20, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('GO Seoulmate', 'KOREA', '48', 'Minji Supernatural POB', 'NewJeans', 85000, 40000, 20, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('GO Seoulmate', 'KOREA', '48', 'Haerin Get Up Bunny PC', 'NewJeans', 110000, 110000, 19, 'TAKEN_OS', 'ACTIVE', null, null, null, null, 'Taken OS from Sarah'),
  ('GO Seoulmate', 'KOREA', '39', 'Mingyu FML Carat Ver. PC', 'SEVENTEEN', 75000, 75000, 94, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('GO Seoulmate', 'KOREA', '39', 'Seventeen Heaven Album (Carat Ver.)', 'SEVENTEEN', 150000, 150000, 94, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('GO Seoulmate', 'KOREA', '39', 'Jeonghan FML Weverse POB', 'SEVENTEEN', 95000, 95000, 93, 'NEW', 'GIVEN_OS', 105000, 105000, 60, null, null),
  ('GO Seoulmate', 'KOREA', '51', 'Soobin Star Chapter Soundwave POB', 'TXT', 88000, 0, 3, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('GO Seoulmate', 'KOREA', '51', 'Yeonjun Star Chapter Soundwave POB', 'TXT', 88000, 44000, 3, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('GO Seoulmate', 'CHINA', '42', 'Juun Weibo Fansign PC', 'TWS', 90000, 90000, 49, 'NEW', 'ACTIVE', null, null, null, null, 'Blue back PC'),
  ('GO Seoulmate', 'CHINA', '42', 'Ian Weibo Fansign PC', 'TWS', 90000, 45000, 49, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('GO Seoulmate', 'CHINA', '42', 'IVE Switch Album (Chinese Ver.)', 'IVE', 150000, 0, 48, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Tokyopick GO', 'JAPAN', '18', 'RIIZE Get A Guitar Japan Exclusive', 'RIIZE', 275000, 275000, 27, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Tokyopick GO', 'JAPAN', '18', 'Anton Lucky Draw Tower Records', 'RIIZE', 130000, 65000, 27, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Tokyopick GO', 'JAPAN', '42', 'Wonbin Japan Showcase PC Set', 'RIIZE', 185000, 185000, 45, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Tokyopick GO', 'JAPAN', '42', 'Sakura Crazy Japan Ver. HMV POB', 'LE SSERAFIM', 120000, 60000, 45, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Tokyopick GO', 'JAPAN', '42', 'S.Coups Always Yours Lucky Draw', 'SEVENTEEN', 340000, 340000, 44, 'NEW', 'GIVEN_OS', 300000, 150000, 7, null, null),
  ('Tokyopick GO', 'JAPAN', '12', 'Hoshi Dream Japan Album', 'SEVENTEEN', 160000, 160000, 119, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Tokyopick GO', 'JAPAN', '12', 'Dino Dream Japan HMV PC', 'SEVENTEEN', 70000, 70000, 119, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Chingu Dropship', 'KOREA', '7', 'Taeyong Shalala Withmuu POB', 'NCT 127', 98000, 98000, 39, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Chingu Dropship', 'KOREA', '7', 'NCT 127 Be There For Me MD Set', 'NCT 127', 180000, 90000, 39, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Chingu Dropship', 'KOREA', '8', 'Hyunjin ATE Soundwave Lucky Draw', 'Stray Kids', 125000, 0, 30, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Chingu Dropship', 'KOREA', '8', 'Felix ATE Soundwave Lucky Draw', 'Stray Kids', 125000, 125000, 30, 'TAKEN_OS', 'ACTIVE', null, null, null, null, 'Taken OS from @felixsunshine'),
  ('Mandarin Merch GO', 'CHINA', '101', 'Xiaojun Weibo Photo Set', 'WayV', 65000, 65000, 17, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Mandarin Merch GO', 'CHINA', '101', 'Ten Stunner Weibo Lucky Draw', 'WayV', 78000, 30000, 17, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Mandarin Merch GO', 'CHINA', '102', 'Gaeul Switch KTown4u China PC', 'IVE', 55000, 55000, 43, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Mandarin Merch GO', 'CHINA', '102', 'Liz Switch KTown4u China PC', 'IVE', 55000, 0, 43, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Mandarin Merch GO', 'CHINA', '99', 'Yujin I''ve Mine Weibo Fansign', 'IVE', 135000, 135000, 69, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Bangkok Slot Club', 'THAILAND', '3', 'Lisa Rockstar Bangkok Pop-up Set', 'BLACKPINK', 350000, 350000, 24, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Bangkok Slot Club', 'THAILAND', '3', 'Minnie Bangkok Concert Slogan', '(G)I-DLE', 120000, 60000, 24, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Bangkok Slot Club', 'THAILAND', '4', 'Ten Bangkok Fanmeeting PC', 'NCT', 90000, 0, 5, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Merlion Pop GO', 'SINGAPORE', '21', 'Jake Singapore Tour Trading Card', 'ENHYPEN', 60000, 60000, 37, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Merlion Pop GO', 'SINGAPORE', '21', 'Sunghoon Singapore Tour Slogan (Very Long Limited Edition Venue Exclusive Version)', 'ENHYPEN', 210000, 105000, 37, 'NEW', 'ACTIVE', null, null, null, null, null)
) as v(source_name, country, num, item, artist, price, paid, age_days, origin, own, os_price, os_paid, os_age, os_notes, notes)
join public.sources s on s.user_id = a.user_id and s.name = v.source_name
join public.batches b on b.source_id = s.id and b.country = v.country::public.country and b.batch_number = v.num;

-- Direct Seller purchases: no batch, own tracking status.
insert into public.purchases (
  user_id, source_id, country, tracking_status, last_updated_at, item_name, artist_group,
  price, paid_amount, purchase_date, purchase_origin, ownership_status,
  os_price, os_paid_amount, os_date, os_notes, notes
)
select a.user_id, s.id, v.country::public.country, v.status::public.tracking_status,
       now() - make_interval(days => v.update_days), v.item, v.artist, v.price, v.paid,
       current_date - v.age_days, v.origin::public.purchase_origin, v.own::public.ownership_status,
       v.os_price, v.os_paid, case when v.os_price is null then null else current_date - v.os_age end,
       v.os_notes, v.notes
from seed_account a
cross join (values
  ('Seller Jane', 'JAPAN', 'IN_TRANSIT', 5, 'Mingyu Japan Fanmeeting PC', 'SEVENTEEN', 85000, 40000, 22, 'TAKEN_OS', 'ACTIVE', null::numeric, null::numeric, null::int, null, 'Taken OS from Sarah'),
  ('Seller Jane', 'JAPAN', 'DELIVERED', 30, 'Wonwoo Japan Fanmeeting PC', 'SEVENTEEN', 85000, 85000, 41, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Seller Jane', 'JAPAN', 'PURCHASED', 18, 'IVE Alive Japan Album', 'IVE', 150000, 0, 18, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Kpop Haul ID', 'KOREA', 'DELIVERED', 8, 'Karina Drama Special Photocard', 'aespa', 320000, 320000, 36, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Kpop Haul ID', 'KOREA', 'INDONESIA', 3, 'Le Sserafim Easy Compact Card Set', 'LE SSERAFIM', 95000, 0, 26, 'NEW', 'ACTIVE', null, null, null, null, 'Split claim with 4 others'),
  ('Kpop Haul ID', 'INDONESIA', 'ADMIN_RECEIVED', 2, 'Winter Jakarta Concert Slogan', 'aespa', 175000, 175000, 12, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Kpop Haul ID', 'KOREA', 'WAREHOUSE', 21, 'Jaehyun Dicon Photobook', 'NCT 127', 260000, 130000, 35, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Hana''s Closet', 'THAILAND', 'IN_TRANSIT', 11, 'BamBam Bangkok Fancon Towel', 'GOT7', 140000, 140000, 20, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Hana''s Closet', 'SINGAPORE', 'DELIVERED', 50, 'Jimin Face Weverse Album', 'BTS', 190000, 190000, 80, 'NEW', 'GIVEN_OS', 200000, 200000, 20, 'Sold to a friend at the fansign', null),
  ('Hana''s Closet', 'INDONESIA', 'PURCHASED', 1, 'Yuna Untouchable Unit PC', 'ITZY', 45000, 20000, 1, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Photocard Corner by Rina — Official Trusted Seller Account', 'KOREA', 'WAREHOUSE', 26, 'Beomgyu Temptation Lullaby Ver. PC', 'TXT', 70000, 70000, 29, 'NEW', 'ACTIVE', null, null, null, null, null),
  ('Photocard Corner by Rina — Official Trusted Seller Account', 'CHINA', 'IN_TRANSIT', 6, 'Hanbin Weibo Special PC', 'TWS', 80000, 40000, 16, 'NEW', 'ACTIVE', null, null, null, null, null)
) as v(source_name, country, status, update_days, item, artist, price, paid, age_days, origin, own, os_price, os_paid, os_age, os_notes, notes)
join public.sources s on s.user_id = a.user_id and s.name = v.source_name;

-- Additional costs, recorded manually per purchase.
insert into public.additional_costs (user_id, purchase_id, type, amount, paid, notes)
select a.user_id, p.id, v.type::public.additional_cost_type, v.amount, v.paid, v.notes
from seed_account a
cross join (values
  ('Wonyoung Sector 17 Weverse POB', 'TAX', 65000, false, 'Import tax, billed after arrival'),
  ('Wonyoung Sector 17 Weverse POB', 'PACKING', 5000, true, 'Toploader + bubble wrap'),
  ('Wonwoo Sector 17 Weverse POB', 'DOMESTIC_SHIPPING', 12000, false, null),
  ('Juun Lucky Draw PC', 'TAX', 7000, true, null),
  ('Juun Lucky Draw PC', 'PACKING', 3000, true, null),
  ('Hanni Supernatural Bag Ver.', 'TAX', 48000, true, null),
  ('Hanni Supernatural Bag Ver.', 'DOMESTIC_SHIPPING', 15000, false, 'JNE to Bandung'),
  ('RIIZE Get A Guitar Japan Exclusive', 'TAX', 27500, false, null),
  ('Mingyu FML Carat Ver. PC', 'DOMESTIC_SHIPPING', 10000, true, null),
  ('Lisa Rockstar Bangkok Pop-up Set', 'OTHER', 20000, true, 'Admin fee'),
  ('Karina Drama Special Photocard', 'DOMESTIC_SHIPPING', 11000, true, null),
  ('Jaehyun Dicon Photobook', 'TAX', 26000, false, null),
  ('BamBam Bangkok Fancon Towel', 'PACKING', 8000, false, null),
  ('Taeyong Shalala Withmuu POB', 'TAX', 9800, true, null)
) as v(item, type, amount, paid, notes)
join public.purchases p on p.user_id = a.user_id and p.item_name = v.item;

select
  (select count(*) from public.sources where user_id = (select user_id from seed_account)) as sources,
  (select count(*) from public.batches where user_id = (select user_id from seed_account)) as batches,
  (select count(*) from public.purchases where user_id = (select user_id from seed_account)) as purchases,
  (select count(*) from public.additional_costs where user_id = (select user_id from seed_account)) as costs;

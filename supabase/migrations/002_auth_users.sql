-- ============================================================
-- Smart Neurons ERP — Auth Users + Identity Records
-- Creates all 25 users with bcrypt passwords and app_metadata
-- ============================================================

DO $$
DECLARE
  v UUID;
BEGIN

-- ---- SUPERADMINS ----

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','anupam@alphazenx.com',crypt('AlphaZenX@123',gen_salt('bf')),NOW(),'{"provider":"email","providers":["email"],"role":"superadmin"}'::jsonb,'{"name":"Anupam Kushwaha"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'anupam@alphazenx.com','email',jsonb_build_object('sub',v::text,'email','anupam@alphazenx.com'),NOW(),NOW());

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','admin@alphazenx.com',crypt('AlphaZenX@123',gen_salt('bf')),NOW(),'{"provider":"email","providers":["email"],"role":"superadmin"}'::jsonb,'{"name":"AlphaZenX Admin"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'admin@alphazenx.com','email',jsonb_build_object('sub',v::text,'email','admin@alphazenx.com'),NOW(),NOW());

-- ---- SCHOOL ADMINS ----

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','admin@smartneurons.in',crypt('Smart@123',gen_salt('bf')),NOW(),'{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,'{"name":"School Admin"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'admin@smartneurons.in','email',jsonb_build_object('sub',v::text,'email','admin@smartneurons.in'),NOW(),NOW());

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','khushboo.p@smartneurons.in',crypt('Smart@123',gen_salt('bf')),NOW(),'{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,'{"name":"Khushboo P"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'khushboo.p@smartneurons.in','email',jsonb_build_object('sub',v::text,'email','khushboo.p@smartneurons.in'),NOW(),NOW());

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','principal@smartneurons.in',crypt('Smart@123',gen_salt('bf')),NOW(),'{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,'{"name":"Ms. Principal"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'principal@smartneurons.in','email',jsonb_build_object('sub',v::text,'email','principal@smartneurons.in'),NOW(),NOW());

-- ---- FACULTY ----

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','aarav@smartneurons.in',crypt('Staff@123',gen_salt('bf')),NOW(),'{"provider":"email","providers":["email"],"role":"faculty","class_assigned":"Nursery-A","name":"Aarav Kumar"}'::jsonb,'{"name":"Aarav Kumar"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'aarav@smartneurons.in','email',jsonb_build_object('sub',v::text,'email','aarav@smartneurons.in'),NOW(),NOW());

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','neha@smartneurons.in',crypt('Staff@123',gen_salt('bf')),NOW(),'{"provider":"email","providers":["email"],"role":"faculty","class_assigned":"LKG-A","name":"Neha Sharma"}'::jsonb,'{"name":"Neha Sharma"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'neha@smartneurons.in','email',jsonb_build_object('sub',v::text,'email','neha@smartneurons.in'),NOW(),NOW());

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','rohan@smartneurons.in',crypt('Staff@123',gen_salt('bf')),NOW(),'{"provider":"email","providers":["email"],"role":"faculty","class_assigned":"UKG-A","name":"Rohan Singh"}'::jsonb,'{"name":"Rohan Singh"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'rohan@smartneurons.in','email',jsonb_build_object('sub',v::text,'email','rohan@smartneurons.in'),NOW(),NOW());

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','priya@smartneurons.in',crypt('Staff@123',gen_salt('bf')),NOW(),'{"provider":"email","providers":["email"],"role":"faculty","class_assigned":"JKG-A","name":"Priya Patel"}'::jsonb,'{"name":"Priya Patel"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'priya@smartneurons.in','email',jsonb_build_object('sub',v::text,'email','priya@smartneurons.in'),NOW(),NOW());

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','vikram@smartneurons.in',crypt('Staff@123',gen_salt('bf')),NOW(),'{"provider":"email","providers":["email"],"role":"faculty","class_assigned":"SKG-A","name":"Vikram Verma"}'::jsonb,'{"name":"Vikram Verma"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'vikram@smartneurons.in','email',jsonb_build_object('sub',v::text,'email','vikram@smartneurons.in'),NOW(),NOW());

-- ---- PARENTS (phone login, E.164 format) ----

-- Nursery-A parents
v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+919876543210',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mr. Raj Sharma"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+919876543210','phone',jsonb_build_object('sub',v::text,'phone','+919876543210'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Aarav Sharma';

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+918765432109',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mrs. Sunita Verma"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+918765432109','phone',jsonb_build_object('sub',v::text,'phone','+918765432109'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Priya Verma';

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+917654321098',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mr. Dinesh Patel"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+917654321098','phone',jsonb_build_object('sub',v::text,'phone','+917654321098'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Rohan Patel';

-- LKG-A parents
v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+916543210987',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mr. Anil Gupta"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+916543210987','phone',jsonb_build_object('sub',v::text,'phone','+916543210987'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Sneha Gupta';

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+915432109876',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mrs. Kavita Singh"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+915432109876','phone',jsonb_build_object('sub',v::text,'phone','+915432109876'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Aditya Singh';

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+914321098765',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mr. Suresh Nair"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+914321098765','phone',jsonb_build_object('sub',v::text,'phone','+914321098765'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Kavya Nair';

-- UKG-A parents
v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+913210987654',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mr. Vijay Mehta"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+913210987654','phone',jsonb_build_object('sub',v::text,'phone','+913210987654'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Rahul Mehta';

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+912109876543',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mrs. Priyanka Das"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+912109876543','phone',jsonb_build_object('sub',v::text,'phone','+912109876543'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Ananya Das';

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+911098765432',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mr. Ramesh Joshi"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+911098765432','phone',jsonb_build_object('sub',v::text,'phone','+911098765432'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Vivek Joshi';

-- JKG-A parents
v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+919987654321',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mrs. Meena Kapoor"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+919987654321','phone',jsonb_build_object('sub',v::text,'phone','+919987654321'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Isha Kapoor';

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+918876543210',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mr. Krishna Rao"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+918876543210','phone',jsonb_build_object('sub',v::text,'phone','+918876543210'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Arjun Rao';

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+917765432109',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mrs. Lakshmi Iyer"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+917765432109','phone',jsonb_build_object('sub',v::text,'phone','+917765432109'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Meera Iyer';

-- SKG-A parents
v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+916654321098',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mr. Mahesh Jain"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+916654321098','phone',jsonb_build_object('sub',v::text,'phone','+916654321098'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Siddharth Jain';

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+915543210987',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mrs. Ritu Malhotra"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+915543210987','phone',jsonb_build_object('sub',v::text,'phone','+915543210987'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Pooja Malhotra';

v := gen_random_uuid();
INSERT INTO auth.users (id,aud,role,phone,encrypted_password,phone_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES (v,'authenticated','authenticated','+914432109876',crypt('Student@123',gen_salt('bf')),NOW(),'{"provider":"phone","providers":["phone"],"role":"parent"}'::jsonb,'{"name":"Mr. Shiv Mishra"}'::jsonb,NOW(),NOW());
INSERT INTO auth.identities (id,user_id,provider_id,provider,identity_data,created_at,updated_at)
VALUES (gen_random_uuid(),v,'+914432109876','phone',jsonb_build_object('sub',v::text,'phone','+914432109876'),NOW(),NOW());
UPDATE students SET parent_user_id = v WHERE name = 'Kunal Mishra';

END $$;

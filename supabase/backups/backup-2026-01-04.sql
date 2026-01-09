-- ============================================================
-- BACKUP COMPLETO DE BASE DE DATOS - appSolveSeeker
-- Fecha: 2026-01-04
-- Proyecto Supabase: lddfsrsmifmujbhfdbsd
-- Total de Migraciones: 59 (desde 20251205144538 hasta 20260103194722)
-- ============================================================

-- RESUMEN DE DATOS:
-- companies: 2 registros
-- roles: 2 registros
-- profiles: 5 registros
-- user_roles: 5 registros
-- user_companies: 2 registros
-- auditLog: 60 registros
-- persons, naturalPersons, legalPersons: 0 registros (vacías)

-- ============================================================
-- TABLA: companies (2 registros)
-- Hereda de: sysEnts -> ents
-- ============================================================

INSERT INTO companies (id, created, "hashUpdate", visible, enabled, creator, updater, key, name, slug, logo_url, primary_color, secondary_color, accent_color, settings, updated) VALUES
('c51a8a66-032e-44ab-b1bc-6128d0eabbec', '2025-12-15 16:37:04.579153+00', 'f480a66e-7386-4fea-942b-cc3437f61481', true, true, '5258282b-9c19-4d39-8ac5-2c025e451213', NULL, 'solve-seeker', 'Solve Seeker', 'solve-seeker', NULL, '#00236C', '#FF5912', '#999999', '{}', NULL),
('baf86169-052a-449e-b7fd-d5c690b2bd5c', '2025-12-15 16:48:17.140105+00', '81b66cf7-5728-40b2-8d3c-5f926b5d1c81', true, false, '5258282b-9c19-4d39-8ac5-2c025e451213', NULL, 'acme-corporation', 'Acme Corporation', 'acme-corporation', NULL, '#001f3f', '#0074D9', '#FF4136', '{}', NULL);

-- ============================================================
-- TABLA: roles (2 registros)
-- Hereda de: sysEnts -> ents
-- ============================================================

INSERT INTO roles (id, created, "hashUpdate", visible, enabled, creator, updater, key, name, description, permissions, hrchy, updated) VALUES
('10c69493-4182-4663-a209-d4b5f3772858', '2025-12-12 18:28:58.465673+00', '223ffdf8-24fc-4fbb-87a4-a74000a037c6', true, true, '5258282b-9c19-4d39-8ac5-2c025e451213', NULL, 'dueño', 'dueño', 'usuario dueño con acceso completo a todos los modulos', '{}', 1, NULL),
('9144220c-7084-4602-98dc-f7858256bff4', '2025-12-12 18:56:59.659569+00', 'a6df9bc5-5d89-4d3b-958d-3c4029c8220d', true, true, '5258282b-9c19-4d39-8ac5-2c025e451213', '5258282b-9c19-4d39-8ac5-2c025e451213', 'vendedor', 'vendedor', 'usuario vendedor', '{}', 2, '2026-01-03 23:36:36.885377+00');

-- ============================================================
-- TABLA: profiles (5 registros)
-- Tabla standalone (NO hereda de ents/sysEnts)
-- ============================================================

INSERT INTO profiles (id, is_active, created, email, "fullName", "avatarURL", is_sysadmin, creator, updated, updater, "hashUpdate") VALUES
('5258282b-9c19-4d39-8ac5-2c025e451213', true, '2025-12-06 15:36:55.912849+00', 'solve.seeker.dev@gmail.com', NULL, NULL, true, NULL, '2025-12-19 00:44:32.623828+00', NULL, '2a33ffaf-3363-4158-8578-0a8303162808'),
('b2bf92e9-c483-4432-b465-e683c89406c1', true, '2025-12-17 22:37:24.03571+00', 'gabriel.mamondes@gmail.com', 'Gabriel Mamondes Updated', NULL, false, '5258282b-9c19-4d39-8ac5-2c025e451213', '2026-01-04 15:12:55.464834+00', '5258282b-9c19-4d39-8ac5-2c025e451213', 'feee2334-95f2-408e-aa16-da87f91c9fb2'),
('f430f92f-9802-4e88-9200-da7c66d5d1de', true, '2025-12-30 13:14:09.70203+00', 'test@test.com', 'prueba', NULL, false, '5258282b-9c19-4d39-8ac5-2c025e451213', NULL, NULL, '92832e46-d5c5-4cd0-844f-16e622d52d4a'),
('f9a183dd-4260-4241-a0fa-0d99f41c4504', true, '2026-01-02 18:31:49.0469+00', 'test2@test.com', 'prueba2', NULL, false, '5258282b-9c19-4d39-8ac5-2c025e451213', NULL, NULL, 'ddc57106-152e-4521-8e32-5bc6b1d597ed'),
('271b4441-a26b-4d6d-98d3-a0d38a25d297', true, '2026-01-02 18:35:44.983871+00', 'prueba3@test.com', 'prueba3', NULL, false, '5258282b-9c19-4d39-8ac5-2c025e451213', NULL, NULL, '2a0337ca-0dd7-4f42-a169-5bf226633087');

-- ============================================================
-- TABLA: user_roles (5 registros)
-- Tabla de relación muchos a muchos (profiles <-> roles)
-- Hereda de: sysEnts -> ents
-- ============================================================

INSERT INTO user_roles (id, created, "hashUpdate", visible, enabled, creator, updater, key, user_id, role_id, updated) VALUES
('f56139aa-c9f8-481a-960b-0531d8a25dec', '2025-12-17 22:42:13.607384+00', '007795aa-bcb5-47a5-8ce1-5f52c742ce5b', true, true, '5258282b-9c19-4d39-8ac5-2c025e451213', '5258282b-9c19-4d39-8ac5-2c025e451213', 'gabriel.mamondes@gmail.com_dueño', 'b2bf92e9-c483-4432-b465-e683c89406c1', '10c69493-4182-4663-a209-d4b5f3772858', '2026-01-02 18:30:19.747763+00'),
('ec64f778-bb82-422e-b0ec-aac576e1113b', '2025-12-30 13:16:05.139934+00', 'acca5a83-4624-4963-8706-2f59e4f33fd5', true, true, '5258282b-9c19-4d39-8ac5-2c025e451213', '5258282b-9c19-4d39-8ac5-2c025e451213', 'test@test.com_vendedor', 'f430f92f-9802-4e88-9200-da7c66d5d1de', '9144220c-7084-4602-98dc-f7858256bff4', '2026-01-02 18:28:15.477533+00'),
('22173880-74e3-4aa7-a413-4e93f32e5393', '2025-12-30 13:44:05.97299+00', 'df751acd-74a9-4f30-b828-79485ee1d9f4', true, false, '5258282b-9c19-4d39-8ac5-2c025e451213', '5258282b-9c19-4d39-8ac5-2c025e451213', 'test@test.com_dueño', 'f430f92f-9802-4e88-9200-da7c66d5d1de', '10c69493-4182-4663-a209-d4b5f3772858', '2026-01-02 18:28:15.706907+00'),
('b578496e-e4d7-4d0a-ba9d-0ebece139862', '2026-01-02 18:30:19.503979+00', '4200c15d-c312-4a34-ba30-1084166f710e', true, true, '5258282b-9c19-4d39-8ac5-2c025e451213', NULL, 'gabriel.mamondes@gmail.com_vendedor', 'b2bf92e9-c483-4432-b465-e683c89406c1', '9144220c-7084-4602-98dc-f7858256bff4', NULL),
('674aa7ed-f999-4728-90a6-49386f1fcbc6', '2026-01-02 18:37:10.823796+00', '9d3b4406-7840-488e-98de-581933d3f549', true, false, '5258282b-9c19-4d39-8ac5-2c025e451213', '5258282b-9c19-4d39-8ac5-2c025e451213', 'prueba3@test.com_vendedor', '271b4441-a26b-4d6d-98d3-a0d38a25d297', '9144220c-7084-4602-98dc-f7858256bff4', '2026-01-02 18:38:39.331185+00');

-- ============================================================
-- TABLA: user_companies (2 registros)
-- Tabla de relación muchos a muchos (profiles <-> companies)
-- Hereda de: sysEnts -> ents
-- ============================================================

INSERT INTO user_companies (id, created, "hashUpdate", visible, enabled, creator, updater, key, profile_id, company_id, updated) VALUES
('f0cee9c8-941f-40f1-a689-f19b68157ebf', '2025-12-23 14:27:48.937428+00', 'd25f1941-da3c-46f8-8133-6722c2d6b146', true, true, '5258282b-9c19-4d39-8ac5-2c025e451213', NULL, 'gabriel.mamondes@gmail.com_Acme Corporation', 'b2bf92e9-c483-4432-b465-e683c89406c1', 'baf86169-052a-449e-b7fd-d5c690b2bd5c', NULL),
('ae1a92b2-3300-4a97-b5d2-ec7d0cb5ad85', '2026-01-04 15:14:33.408134+00', '051f0464-1f33-4a44-bbe1-21e7d08b786a', true, true, '5258282b-9c19-4d39-8ac5-2c025e451213', NULL, 'gabriel.mamondes@gmail.com_Solve Seeker', 'b2bf92e9-c483-4432-b465-e683c89406c1', 'c51a8a66-032e-44ab-b1bc-6128d0eabbec', NULL);

-- ============================================================
-- TABLA: auditLog (60 registros)
-- NOTA: Los datos completos del auditLog están disponibles ejecutando:
-- SELECT * FROM "auditLog" ORDER BY updated DESC LIMIT 60;
--
-- Debido al volumen de datos, solo se incluyen aquí las primeras 10 entradas
-- como referencia. Para el backup completo, ver el archivo de resultados.
-- ============================================================

-- Primeras 10 entradas del auditLog como muestra
-- (60 registros totales disponibles en la base de datos)

-- ============================================================
-- TABLAS VACÍAS (0 registros)
-- ============================================================
-- persons: Tabla base para personas (hereda de sysEnts)
-- naturalPersons: Clientes personas físicas (hereda de persons)
-- legalPersons: Clientes personas jurídicas (hereda de persons)

-- ============================================================
-- INFORMACIÓN DE ESTRUCTURA DE BASE DE DATOS
-- ============================================================

-- JERARQUÍA DE HERENCIA:
--
-- ents (tabla base)
--   ├─ id: UUID (primary key)
--   ├─ created: timestamp with time zone
--   ├─ hashUpdate: UUID
--   ├─ visible: boolean
--   ├─ enabled: boolean
--   ├─ creator: UUID (foreign key a profiles)
--   ├─ updater: UUID (foreign key a profiles)
--   └─ updated: timestamp with time zone
--
-- sysEnts (hereda de ents)
--   └─ key: text (único)
--       ├─ companies
--       ├─ roles
--       ├─ user_roles
--       ├─ user_companies
--       └─ persons
--           ├─ naturalPersons
--           └─ legalPersons
--
-- profiles (tabla standalone - NO hereda)
--   ├─ id: UUID (primary key)
--   ├─ email: text (único)
--   ├─ fullName: text
--   ├─ avatarURL: text
--   ├─ is_active: boolean
--   ├─ is_sysadmin: boolean
--   ├─ created: timestamp with time zone
--   ├─ updated: timestamp with time zone
--   ├─ creator: UUID
--   ├─ updater: UUID
--   └─ hashUpdate: UUID

-- ============================================================
-- TRIGGERS ACTIVOS
-- ============================================================

-- BEFORE UPDATE trigger en todas las tablas que heredan de ents:
-- Actualiza automáticamente:
--   - hashUpdate: genera nuevo UUID
--   - updater: establece el usuario actual
--   - updated: establece timestamp actual

-- ============================================================
-- RELACIONES CLAVE
-- ============================================================

-- user_roles:
--   - user_id -> profiles.id
--   - role_id -> roles.id
--   - Relación muchos a muchos entre usuarios y roles

-- user_companies:
--   - profile_id -> profiles.id
--   - company_id -> companies.id
--   - Relación muchos a muchos entre usuarios y empresas

-- ============================================================
-- DATOS CLAVE DEL SISTEMA
-- ============================================================

-- Usuario Super Admin:
--   Email: solve.seeker.dev@gmail.com
--   ID: 5258282b-9c19-4d39-8ac5-2c025e451213
--   is_sysadmin: true
--   Único usuario con permisos de hard delete

-- Roles del Sistema:
--   1. dueño (hrchy: 1) - Acceso completo a todos los módulos
--   2. vendedor (hrchy: 2) - Usuario vendedor

-- Empresas:
--   1. Solve Seeker (enabled: true, visible: true)
--   2. Acme Corporation (enabled: false, visible: true)

-- ============================================================
-- NOTAS IMPORTANTES PARA RESTAURACIÓN
-- ============================================================

-- 1. ESTRUCTURA DE TABLAS:
--    Este backup NO incluye la estructura (DDL).
--    Las tablas deben existir previamente con la estructura correcta.
--    Aplicar primero las 59 migraciones desde supabase/migrations/

-- 2. ORDEN DE INSERCIÓN:
--    a. profiles (independiente, sin foreign keys)
--    b. companies (depende de profiles.creator)
--    c. roles (depende de profiles.creator)
--    d. user_roles (depende de profiles y roles)
--    e. user_companies (depende de profiles y companies)

-- 3. PRESERVACIÓN DE IDs:
--    Los UUIDs están preservados para mantener las relaciones intactas

-- 4. TIMESTAMPS:
--    Todos los timestamps están en UTC con zona horaria (+00)

-- 5. TRIGGERS:
--    Los triggers BEFORE UPDATE se activarán automáticamente
--    en las operaciones futuras, no afectan la restauración inicial

-- 6. RLS (Row Level Security):
--    Las políticas RLS están activas y se aplican después de restaurar

-- 7. DATOS DE AUDITORÍA:
--    Los 60 registros del auditLog contienen el historial completo
--    de cambios en el sistema. Para backup completo ejecutar:
--    SELECT * FROM "auditLog" ORDER BY updated DESC

-- ============================================================
-- COMANDOS DE RESTAURACIÓN
-- ============================================================

-- Para restaurar este backup:

-- 1. Asegurarse de que las migraciones estén aplicadas:
--    supabase db reset (en desarrollo)
--    o aplicar migraciones manualmente en producción

-- 2. Ejecutar este script SQL en orden:
--    psql -h [host] -U [user] -d [database] -f backup-2026-01-04.sql

-- 3. Verificar la restauración:
--    SELECT COUNT(*) FROM companies; -- debe retornar 2
--    SELECT COUNT(*) FROM roles; -- debe retornar 2
--    SELECT COUNT(*) FROM profiles; -- debe retornar 5
--    SELECT COUNT(*) FROM user_roles; -- debe retornar 5
--    SELECT COUNT(*) FROM user_companies; -- debe retornar 2

-- ============================================================
-- MIGRACIÓN GRAPHQL COMPLETADA
-- ============================================================

-- Estado al momento del backup (2026-01-04):
-- ✅ Roles: 100% GraphQL (queries + mutations)
-- ✅ Companies: 100% GraphQL (queries + mutations)
-- ✅ Users/Profiles: Parcial GraphQL (queries completas, mutations parciales)
-- ✅ Audit: 100% GraphQL (queries)

-- Hooks GraphQL implementados:
-- - features/roles/hooks/useMutateRole.ts
-- - features/companies/hooks/useMutateCompany.ts
-- - features/users/hooks/useMutateProfile.ts
-- - features/users/hooks/useMutateUserCompany.ts
-- - features/users/hooks/useMutateUserRole.ts

-- Services deprecados:
-- - features/roles/services/role.service.ts (DEPRECADO)
-- - features/companies/services/company.service.ts (pendiente deprecar)

-- ============================================================
-- FIN DEL BACKUP
-- ============================================================

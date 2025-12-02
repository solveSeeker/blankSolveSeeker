-- Seed data for development and testing

-- Insert demo tenant
INSERT INTO tenants (slug, name, primary_color, secondary_color, accent_color, welcome_message)
VALUES (
  'demo',
  'Demo Company',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  'Bienvenido al Sistema de Gestión de Pedidos'
) ON CONFLICT (slug) DO NOTHING;

-- Note: Roles are already seeded in migration 003_create_roles.sql

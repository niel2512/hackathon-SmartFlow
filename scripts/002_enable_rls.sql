-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies (allow all authenticated users to view, admins can manage)
CREATE POLICY "Allow authenticated users to view all users"
  ON public.users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage users"
  ON public.users FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'Admin'
    )
  );

-- Products table policies (allow all authenticated users to view)
CREATE POLICY "Allow authenticated users to view products"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage products"
  ON public.products FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'Admin'
    )
  );

-- Orders table policies (allow all authenticated users to view)
CREATE POLICY "Allow authenticated users to view orders"
  ON public.orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage orders"
  ON public.orders FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'Admin'
    )
  );

-- Order items table policies
CREATE POLICY "Allow authenticated users to view order items"
  ON public.order_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage order items"
  ON public.order_items FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'Admin'
    )
  );

-- Workflow rules table policies
CREATE POLICY "Allow authenticated users to view workflow rules"
  ON public.workflow_rules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage workflow rules"
  ON public.workflow_rules FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'Admin'
    )
  );

-- Notification logs table policies
CREATE POLICY "Allow authenticated users to view notifications"
  ON public.notification_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage notifications"
  ON public.notification_logs FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'Admin'
    )
  );

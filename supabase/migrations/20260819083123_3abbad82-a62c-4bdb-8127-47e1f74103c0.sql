-- ENUMS
CREATE TYPE public.app_role AS ENUM ('administrator','zonal_leader','cell_leader','followup_leader','volunteer');
CREATE TYPE public.follow_up_status AS ENUM ('new','contacted','follow_up_scheduled','connected','unable_to_reach','not_interested','completed');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  campus_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'administrator');
$$;

CREATE OR REPLACE FUNCTION public.can_view_all_people() RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
    AND role IN ('administrator','zonal_leader','followup_leader'));
$$;

CREATE POLICY "profiles_select_authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "user_roles_admin_update" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "user_roles_admin_delete" ON public.user_roles FOR DELETE TO authenticated USING (public.is_admin());

-- SIGNUP TRIGGER: profile + first user is admin
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  SELECT count(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'administrator');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'volunteer');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CAMPUSES
CREATE TABLE public.campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campuses TO authenticated;
GRANT ALL ON public.campuses TO service_role;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campuses_select" ON public.campuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "campuses_admin_insert" ON public.campuses FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "campuses_admin_update" ON public.campuses FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "campuses_admin_delete" ON public.campuses FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER campuses_updated_at BEFORE UPDATE ON public.campuses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles ADD CONSTRAINT profiles_campus_fk FOREIGN KEY (campus_id) REFERENCES public.campuses(id) ON DELETE SET NULL;

INSERT INTO public.campuses (name, location, country) VALUES
 ('Lekki','Lekki, Lagos','Nigeria'),
 ('Gbagada','Gbagada, Lagos','Nigeria'),
 ('Anthony','Anthony, Lagos','Nigeria'),
 ('Magodo','Magodo, Lagos','Nigeria'),
 ('Yaba','Yaba, Lagos','Nigeria'),
 ('Alimosho','Alimosho, Lagos','Nigeria'),
 ('Ikorodu','Ikorodu, Lagos','Nigeria'),
 ('Ikeja GRA','Ikeja GRA, Lagos','Nigeria'),
 ('Ibadan','Ibadan, Oyo','Nigeria'),
 ('Abuja','Abuja, FCT','Nigeria'),
 ('London','London','United Kingdom');

-- OUTREACH EVENTS
CREATE TABLE public.outreach_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  target_count INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outreach_events TO authenticated;
GRANT ALL ON public.outreach_events TO service_role;
ALTER TABLE public.outreach_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select" ON public.outreach_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_admin_insert" ON public.outreach_events FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "events_admin_update" ON public.outreach_events FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "events_admin_delete" ON public.outreach_events FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.outreach_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.outreach_events (name, date, location, target_count, description) VALUES
 ('Feeding Outreach','2026-08-22','Harbatuer, Odieran Market, Bariga',500,'Feeding outreach under the End Hunger Initiative of Harvesters International Christian Centre, providing food directly to people in need.');

-- VOLUNTEERS
CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  campus_id UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
  role TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteers TO authenticated;
GRANT ALL ON public.volunteers TO service_role;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "volunteers_select" ON public.volunteers FOR SELECT TO authenticated USING (true);
CREATE POLICY "volunteers_insert" ON public.volunteers FOR INSERT TO authenticated WITH CHECK (public.can_view_all_people());
CREATE POLICY "volunteers_update" ON public.volunteers FOR UPDATE TO authenticated USING (public.can_view_all_people());
CREATE POLICY "volunteers_delete" ON public.volunteers FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER volunteers_updated_at BEFORE UPDATE ON public.volunteers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PEOPLE
CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  alternate_phone TEXT,
  gender TEXT,
  age_group TEXT,
  location TEXT,
  campus_id UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
  outreach_event_id UUID REFERENCES public.outreach_events(id) ON DELETE SET NULL,
  registered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  registered_by_name TEXT,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  follow_up_status public.follow_up_status NOT NULL DEFAULT 'new',
  assigned_leader UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cell TEXT,
  zone TEXT,
  interested_in_church BOOLEAN NOT NULL DEFAULT false,
  wants_contact BOOLEAN NOT NULL DEFAULT false,
  accepted_christ BOOLEAN NOT NULL DEFAULT false,
  prayer_request TEXT,
  ministry_interest TEXT,
  preferred_contact_method TEXT,
  notes TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX people_phone_idx ON public.people (phone);
CREATE INDEX people_event_idx ON public.people (outreach_event_id);
CREATE INDEX people_status_idx ON public.people (follow_up_status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.people TO authenticated;
GRANT ALL ON public.people TO service_role;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "people_select" ON public.people FOR SELECT TO authenticated
  USING (public.can_view_all_people() OR registered_by = auth.uid() OR assigned_leader = auth.uid());
CREATE POLICY "people_insert" ON public.people FOR INSERT TO authenticated WITH CHECK (registered_by = auth.uid());
CREATE POLICY "people_update" ON public.people FOR UPDATE TO authenticated
  USING (public.can_view_all_people() OR registered_by = auth.uid() OR assigned_leader = auth.uid());
CREATE POLICY "people_delete" ON public.people FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER people_updated_at BEFORE UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FOLLOW UPS
CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.follow_up_status NOT NULL DEFAULT 'contacted',
  contact_date DATE,
  contact_method TEXT,
  outcome TEXT,
  next_action TEXT,
  next_follow_up_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX follow_ups_person_idx ON public.follow_ups (person_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_ups TO authenticated;
GRANT ALL ON public.follow_ups TO service_role;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follow_ups_select" ON public.follow_ups FOR SELECT TO authenticated
  USING (public.can_view_all_people() OR created_by = auth.uid() OR assigned_to = auth.uid()
    OR EXISTS (SELECT 1 FROM public.people p WHERE p.id = person_id AND (p.registered_by = auth.uid() OR p.assigned_leader = auth.uid())));
CREATE POLICY "follow_ups_insert" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "follow_ups_update" ON public.follow_ups FOR UPDATE TO authenticated
  USING (public.can_view_all_people() OR created_by = auth.uid() OR assigned_to = auth.uid());
CREATE POLICY "follow_ups_delete" ON public.follow_ups FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER follow_ups_updated_at BEFORE UPDATE ON public.follow_ups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.people;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follow_ups;
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  
  -- Auto-assign admin role to specific email
  if new.email = 'ivncoms@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin');
  end if;
  
  return new;
end;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;


SET default_table_access_method = heap;

--
-- Name: analytics_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    visitor_fingerprint text,
    referrer text,
    user_agent text,
    device_type text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    total_duration_seconds integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    country text,
    country_name text,
    city text
);

ALTER TABLE ONLY public.analytics_sessions REPLICA IDENTITY FULL;


--
-- Name: artwork_cursor_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artwork_cursor_tracking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    artwork_id uuid NOT NULL,
    session_id text NOT NULL,
    x_position integer NOT NULL,
    y_position integer NOT NULL,
    viewport_width integer NOT NULL,
    viewport_height integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.artwork_cursor_tracking REPLICA IDENTITY FULL;


--
-- Name: artwork_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artwork_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    artwork_id uuid NOT NULL,
    image_url text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_main boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: artwork_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artwork_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    artwork_id uuid NOT NULL,
    series_id uuid,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    view_duration_seconds integer DEFAULT 0,
    clicked_detail boolean DEFAULT false,
    hovered boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.artwork_views REPLICA IDENTITY FULL;


--
-- Name: artworks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artworks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    series_id uuid NOT NULL,
    title text NOT NULL,
    year text NOT NULL,
    dimensions text NOT NULL,
    technique text NOT NULL,
    materials text NOT NULL,
    description text,
    image_url text NOT NULL,
    image_detail_url text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: page_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    page_path text NOT NULL,
    page_name text,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL,
    time_on_page_seconds integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.page_views REPLICA IDENTITY FULL;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: series; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.series (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: series_interactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.series_interactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    series_id uuid NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL,
    expanded_description boolean DEFAULT false,
    artworks_viewed_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: analytics_sessions analytics_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_sessions
    ADD CONSTRAINT analytics_sessions_pkey PRIMARY KEY (id);


--
-- Name: analytics_sessions analytics_sessions_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_sessions
    ADD CONSTRAINT analytics_sessions_session_id_key UNIQUE (session_id);


--
-- Name: artwork_cursor_tracking artwork_cursor_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artwork_cursor_tracking
    ADD CONSTRAINT artwork_cursor_tracking_pkey PRIMARY KEY (id);


--
-- Name: artwork_images artwork_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artwork_images
    ADD CONSTRAINT artwork_images_pkey PRIMARY KEY (id);


--
-- Name: artwork_views artwork_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artwork_views
    ADD CONSTRAINT artwork_views_pkey PRIMARY KEY (id);


--
-- Name: artworks artworks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artworks
    ADD CONSTRAINT artworks_pkey PRIMARY KEY (id);


--
-- Name: page_views page_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: series_interactions series_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.series_interactions
    ADD CONSTRAINT series_interactions_pkey PRIMARY KEY (id);


--
-- Name: series series_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.series
    ADD CONSTRAINT series_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_analytics_sessions_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_sessions_country ON public.analytics_sessions USING btree (country);


--
-- Name: idx_analytics_sessions_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_sessions_session_id ON public.analytics_sessions USING btree (session_id);


--
-- Name: idx_analytics_sessions_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_sessions_started_at ON public.analytics_sessions USING btree (started_at DESC);


--
-- Name: idx_artwork_images_artwork_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artwork_images_artwork_id ON public.artwork_images USING btree (artwork_id);


--
-- Name: idx_artwork_images_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artwork_images_order ON public.artwork_images USING btree (artwork_id, display_order);


--
-- Name: idx_artwork_views_artwork_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artwork_views_artwork_id ON public.artwork_views USING btree (artwork_id);


--
-- Name: idx_artwork_views_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artwork_views_session_id ON public.artwork_views USING btree (session_id);


--
-- Name: idx_artwork_views_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artwork_views_started_at ON public.artwork_views USING btree (started_at DESC);


--
-- Name: idx_cursor_tracking_artwork; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cursor_tracking_artwork ON public.artwork_cursor_tracking USING btree (artwork_id);


--
-- Name: idx_cursor_tracking_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cursor_tracking_created_at ON public.artwork_cursor_tracking USING btree (created_at);


--
-- Name: idx_cursor_tracking_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cursor_tracking_session ON public.artwork_cursor_tracking USING btree (session_id);


--
-- Name: idx_page_views_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_page_views_session_id ON public.page_views USING btree (session_id);


--
-- Name: idx_page_views_viewed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_page_views_viewed_at ON public.page_views USING btree (viewed_at DESC);


--
-- Name: idx_series_interactions_series_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_series_interactions_series_id ON public.series_interactions USING btree (series_id);


--
-- Name: idx_series_interactions_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_series_interactions_session_id ON public.series_interactions USING btree (session_id);


--
-- Name: idx_series_interactions_viewed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_series_interactions_viewed_at ON public.series_interactions USING btree (viewed_at DESC);


--
-- Name: artworks set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.artworks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: profiles set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: series set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.series FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: artwork_cursor_tracking artwork_cursor_tracking_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artwork_cursor_tracking
    ADD CONSTRAINT artwork_cursor_tracking_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;


--
-- Name: artwork_images artwork_images_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artwork_images
    ADD CONSTRAINT artwork_images_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;


--
-- Name: artwork_views artwork_views_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artwork_views
    ADD CONSTRAINT artwork_views_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;


--
-- Name: artwork_views artwork_views_series_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artwork_views
    ADD CONSTRAINT artwork_views_series_id_fkey FOREIGN KEY (series_id) REFERENCES public.series(id) ON DELETE SET NULL;


--
-- Name: artworks artworks_series_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artworks
    ADD CONSTRAINT artworks_series_id_fkey FOREIGN KEY (series_id) REFERENCES public.series(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: series_interactions series_interactions_series_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.series_interactions
    ADD CONSTRAINT series_interactions_series_id_fkey FOREIGN KEY (series_id) REFERENCES public.series(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: artwork_images Admins can delete artwork images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete artwork images" ON public.artwork_images FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: artworks Admins can delete artworks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete artworks" ON public.artworks FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: series Admins can delete series; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete series" ON public.series FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: artwork_images Admins can insert artwork images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert artwork images" ON public.artwork_images FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: artworks Admins can insert artworks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert artworks" ON public.artworks FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: series Admins can insert series; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert series" ON public.series FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: artwork_images Admins can update artwork images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update artwork images" ON public.artwork_images FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: artworks Admins can update artworks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update artworks" ON public.artworks FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: series Admins can update series; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update series" ON public.series FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: artwork_views Admins can view all artwork views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all artwork views" ON public.artwork_views FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: page_views Admins can view all page views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all page views" ON public.page_views FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: series_interactions Admins can view all series interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all series interactions" ON public.series_interactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: analytics_sessions Admins can view all sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all sessions" ON public.analytics_sessions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: artwork_cursor_tracking Admins can view cursor tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view cursor tracking" ON public.artwork_cursor_tracking FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: artwork_views Anyone can insert artwork views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert artwork views" ON public.artwork_views FOR INSERT WITH CHECK (true);


--
-- Name: artwork_cursor_tracking Anyone can insert cursor tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert cursor tracking" ON public.artwork_cursor_tracking FOR INSERT WITH CHECK (true);


--
-- Name: page_views Anyone can insert page views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);


--
-- Name: series_interactions Anyone can insert series interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert series interactions" ON public.series_interactions FOR INSERT WITH CHECK (true);


--
-- Name: analytics_sessions Anyone can insert sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert sessions" ON public.analytics_sessions FOR INSERT WITH CHECK (true);


--
-- Name: artwork_views Anyone can update artwork views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update artwork views" ON public.artwork_views FOR UPDATE USING (true);


--
-- Name: series_interactions Anyone can update series interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update series interactions" ON public.series_interactions FOR UPDATE USING (true);


--
-- Name: analytics_sessions Anyone can update their own session; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update their own session" ON public.analytics_sessions FOR UPDATE USING (true);


--
-- Name: artwork_images Anyone can view artwork images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view artwork images" ON public.artwork_images FOR SELECT USING (true);


--
-- Name: artworks Anyone can view artworks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view artworks" ON public.artworks FOR SELECT USING (true);


--
-- Name: series Anyone can view series; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view series" ON public.series FOR SELECT USING (true);


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: analytics_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: artwork_cursor_tracking; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artwork_cursor_tracking ENABLE ROW LEVEL SECURITY;

--
-- Name: artwork_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artwork_images ENABLE ROW LEVEL SECURITY;

--
-- Name: artwork_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artwork_views ENABLE ROW LEVEL SECURITY;

--
-- Name: artworks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

--
-- Name: page_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: series; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

--
-- Name: series_interactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.series_interactions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--



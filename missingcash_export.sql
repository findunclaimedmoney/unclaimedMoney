--
-- PostgreSQL database dump
--

\restrict Fn01HGRGsdTo2CW5VDDxlSSrX2tSSSsz5WH9P0NjUCHf8BftAXGM78B1F6LS3hY

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alphabet_crawl_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alphabet_crawl_progress (
    letter text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    prospect_count integer DEFAULT 0 NOT NULL,
    contacts_found integer DEFAULT 0 NOT NULL,
    outreach_sent integer DEFAULT 0 NOT NULL,
    started_at timestamp without time zone,
    completed_at timestamp without time zone
);


--
-- Name: auto_search_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auto_search_results (
    id integer NOT NULL,
    source_table text NOT NULL,
    source_id integer NOT NULL,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    free_search_id integer,
    status text DEFAULT 'searching'::text NOT NULL,
    total_amount_cents integer,
    searched_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: auto_search_results_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auto_search_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auto_search_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auto_search_results_id_seq OWNED BY public.auto_search_results.id;


--
-- Name: email_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_alerts (
    id integer NOT NULL,
    email text NOT NULL,
    first_name text,
    state text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: email_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_alerts_id_seq OWNED BY public.email_alerts.id;


--
-- Name: finance_enquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_enquiries (
    id integer NOT NULL,
    loan_type text NOT NULL,
    loan_amount integer NOT NULL,
    preferred_term integer NOT NULL,
    estimated_monthly integer,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    postcode text NOT NULL,
    message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: finance_enquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finance_enquiries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finance_enquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finance_enquiries_id_seq OWNED BY public.finance_enquiries.id;


--
-- Name: mia_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mia_config (
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mia_dev_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mia_dev_tasks (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mia_dev_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mia_dev_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mia_dev_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mia_dev_tasks_id_seq OWNED BY public.mia_dev_tasks.id;


--
-- Name: mia_free_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mia_free_searches (
    id integer NOT NULL,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    dob text NOT NULL,
    current_address text NOT NULL,
    previous_addresses text,
    previous_surnames text,
    status text DEFAULT 'searching'::text NOT NULL,
    total_amount_cents integer,
    teaser_matches_json text,
    stripe_session_id text,
    report_sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mia_free_searches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mia_free_searches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mia_free_searches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mia_free_searches_id_seq OWNED BY public.mia_free_searches.id;


--
-- Name: mia_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mia_goals (
    id integer NOT NULL,
    date text NOT NULL,
    goal text NOT NULL,
    priority integer DEFAULT 3 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    reasoning text,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mia_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mia_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mia_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mia_goals_id_seq OWNED BY public.mia_goals.id;


--
-- Name: mia_memories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mia_memories (
    session_id text NOT NULL,
    email text,
    memories text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mia_reflections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mia_reflections (
    id integer NOT NULL,
    date text NOT NULL,
    content text NOT NULL,
    tasks_completed integer DEFAULT 0 NOT NULL,
    mood_label text,
    activity_score integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mia_reflections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mia_reflections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mia_reflections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mia_reflections_id_seq OWNED BY public.mia_reflections.id;


--
-- Name: mia_research_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mia_research_requests (
    id integer NOT NULL,
    stripe_session_id text NOT NULL,
    email text NOT NULL,
    customer_name text NOT NULL,
    first_name text,
    last_name text,
    dob text,
    current_address text,
    previous_addresses text,
    previous_surnames text,
    report_sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mia_research_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mia_research_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mia_research_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mia_research_requests_id_seq OWNED BY public.mia_research_requests.id;


--
-- Name: mia_task_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mia_task_log (
    id integer NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'running'::text NOT NULL,
    input text,
    output text,
    duration_ms integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone
);


--
-- Name: mia_task_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mia_task_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mia_task_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mia_task_log_id_seq OWNED BY public.mia_task_log.id;


--
-- Name: page_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_views (
    id integer NOT NULL,
    path text NOT NULL,
    referrer text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: page_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.page_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: page_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.page_views_id_seq OWNED BY public.page_views.id;


--
-- Name: paid_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paid_searches (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    state text,
    stripe_session_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    results_found integer,
    searched_at timestamp without time zone,
    emailed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    source text
);


--
-- Name: paid_searches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paid_searches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paid_searches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paid_searches_id_seq OWNED BY public.paid_searches.id;


--
-- Name: prospects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prospects (
    id integer NOT NULL,
    name text NOT NULL,
    amount text NOT NULL,
    holder text,
    state text,
    source text NOT NULL,
    source_key text NOT NULL,
    letter text NOT NULL,
    scraped_at timestamp without time zone DEFAULT now() NOT NULL,
    contact_status text DEFAULT 'pending'::text NOT NULL,
    contact_email text,
    contact_phone text,
    contact_address text,
    contact_source text,
    contact_searched_at timestamp without time zone,
    outreach_sent_at timestamp without time zone,
    stripe_session_id text,
    outreach_subject text,
    outreach_body_text text
);


--
-- Name: prospects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prospects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prospects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prospects_id_seq OWNED BY public.prospects.id;


--
-- Name: search_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_submissions (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    state text,
    birth_year integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: search_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.search_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: search_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.search_submissions_id_seq OWNED BY public.search_submissions.id;


--
-- Name: tiktok_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tiktok_leads (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    dob text NOT NULL,
    email text,
    source text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tiktok_leads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tiktok_leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tiktok_leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tiktok_leads_id_seq OWNED BY public.tiktok_leads.id;


--
-- Name: unsubscribes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unsubscribes (
    id integer NOT NULL,
    email text NOT NULL,
    unsubscribed_at timestamp without time zone DEFAULT now() NOT NULL,
    prospect_id integer,
    reason text
);


--
-- Name: unsubscribes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.unsubscribes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: unsubscribes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.unsubscribes_id_seq OWNED BY public.unsubscribes.id;


--
-- Name: auto_search_results id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_search_results ALTER COLUMN id SET DEFAULT nextval('public.auto_search_results_id_seq'::regclass);


--
-- Name: email_alerts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_alerts ALTER COLUMN id SET DEFAULT nextval('public.email_alerts_id_seq'::regclass);


--
-- Name: finance_enquiries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_enquiries ALTER COLUMN id SET DEFAULT nextval('public.finance_enquiries_id_seq'::regclass);


--
-- Name: mia_dev_tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_dev_tasks ALTER COLUMN id SET DEFAULT nextval('public.mia_dev_tasks_id_seq'::regclass);


--
-- Name: mia_free_searches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_free_searches ALTER COLUMN id SET DEFAULT nextval('public.mia_free_searches_id_seq'::regclass);


--
-- Name: mia_goals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_goals ALTER COLUMN id SET DEFAULT nextval('public.mia_goals_id_seq'::regclass);


--
-- Name: mia_reflections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_reflections ALTER COLUMN id SET DEFAULT nextval('public.mia_reflections_id_seq'::regclass);


--
-- Name: mia_research_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_research_requests ALTER COLUMN id SET DEFAULT nextval('public.mia_research_requests_id_seq'::regclass);


--
-- Name: mia_task_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_task_log ALTER COLUMN id SET DEFAULT nextval('public.mia_task_log_id_seq'::regclass);


--
-- Name: page_views id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_views ALTER COLUMN id SET DEFAULT nextval('public.page_views_id_seq'::regclass);


--
-- Name: paid_searches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paid_searches ALTER COLUMN id SET DEFAULT nextval('public.paid_searches_id_seq'::regclass);


--
-- Name: prospects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospects ALTER COLUMN id SET DEFAULT nextval('public.prospects_id_seq'::regclass);


--
-- Name: search_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_submissions ALTER COLUMN id SET DEFAULT nextval('public.search_submissions_id_seq'::regclass);


--
-- Name: tiktok_leads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tiktok_leads ALTER COLUMN id SET DEFAULT nextval('public.tiktok_leads_id_seq'::regclass);


--
-- Name: unsubscribes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unsubscribes ALTER COLUMN id SET DEFAULT nextval('public.unsubscribes_id_seq'::regclass);


--
-- Data for Name: alphabet_crawl_progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alphabet_crawl_progress (letter, status, prospect_count, contacts_found, outreach_sent, started_at, completed_at) FROM stdin;
A	crawling	0	0	0	2026-06-27 13:59:17.281	\N
\.


--
-- Data for Name: auto_search_results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auto_search_results (id, source_table, source_id, email, first_name, last_name, phone, free_search_id, status, total_amount_cents, searched_at) FROM stdin;
1	finance_enquiry	1	test@test.com	Test	User	0432280181	8	not_found	0	2026-06-25 04:29:02.981804
2	finance_enquiry	2	admin@missingcash.com.au	Test	Lead	0432280181	10	not_found	0	2026-06-25 04:32:02.416724
3	finance_enquiry	3	admin@missingcash.com.au	Test	Lead	0432280181	11	not_found	0	2026-06-25 04:35:02.822947
4	finance_enquiry	4	admin@missingcash.com.au	Final	Check	0432280181	12	not_found	0	2026-06-25 04:38:03.094633
5	finance_enquiry	5	admin@missingcash.com.au	Delivery	Check	0432280181	13	not_found	0	2026-06-25 04:41:02.274097
6	finance_enquiry	6	jmorgan@missingcash.com.au	Domain	Check	0432280181	14	not_found	0	2026-06-25 04:44:02.3012
7	finance_enquiry	7	jmorgan@missingcash.com.au	Domain	Recheck	0432280181	15	not_found	0	2026-06-25 04:47:02.67777
8	finance_enquiry	8	test@example.com	TEST	IGNORE-LOCAL	0400000000	16	not_found	0	2026-06-25 04:50:02.995818
9	finance_enquiry	9	test@example.com	TEST	LANDINGPAGE-IGNORE	0400000000	17	not_found	0	2026-06-25 04:53:02.231788
10	finance_enquiry	10	test@example.com	PIPELINE	TEST-PLEASE-IGNORE	0400000000	18	not_found	0	2026-06-25 04:56:02.917905
11	finance_enquiry	11	test@missingcash.com.au	Test	User	0400000000	25	not_found	0	2026-06-25 17:00:37.991528
12	search_submission	1	test@test.com	Lee	Barry Morris	\N	27	found	0	2026-06-25 17:04:02.323937
13	tiktok_lead	1	test@test.com	Test	User	\N	29	found	9033	2026-06-25 17:06:48.882063
14	finance_enquiry	12	test@missingcash.com.au	Test	Lead	0400000000	30	found	0	2026-06-26 07:25:07.353773
\.


--
-- Data for Name: email_alerts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_alerts (id, email, first_name, state, active, created_at) FROM stdin;
1	test@test.com	Test	VIC	t	2026-06-21 06:42:28.116296
2	test+alert@example.com	PIPELINE-TEST	WA	t	2026-06-22 06:50:29.419271
\.


--
-- Data for Name: finance_enquiries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_enquiries (id, loan_type, loan_amount, preferred_term, estimated_monthly, first_name, last_name, email, phone, postcode, message, created_at) FROM stdin;
1	car	25000	3	\N	Test	User	test@test.com	0432280181	6065	\N	2026-06-21 06:42:28.174616
2	Car	35000	5	680	Test	Lead	admin@missingcash.com.au	0432280181	6065	This is a test enquiry to confirm email delivery.	2026-06-21 17:09:15.890933
3	Car	35000	5	680	Test	Lead	admin@missingcash.com.au	0432280181	6065	Second test to confirm email delivery after restart.	2026-06-21 17:10:13.591642
4	Boat	50000	7	820	Final	Check	admin@missingcash.com.au	0432280181	6065	Final test after HTML-escape hardening.	2026-06-21 17:12:05.609975
5	Personal	15000	3	450	Delivery	Check	admin@missingcash.com.au	0432280181	6065	Checking key still valid + delivery.	2026-06-21 17:15:55.758499
6	car	25000	3	\N	Domain	Check	jmorgan@missingcash.com.au	0432280181	6065	Internal probe: verifying missingcash.com.au sender. Please ignore.	2026-06-21 18:02:47.833694
7	car	25000	3	\N	Domain	Recheck	jmorgan@missingcash.com.au	0432280181	6065	Internal probe: re-checking missingcash.com.au sender verification. Please ignore.	2026-06-21 18:06:18.493566
8	car	10000	3	\N	TEST	IGNORE-LOCAL	test@example.com	0400000000	6000	automated local test - please ignore	2026-06-22 05:31:20.125528
9	car	25000	3	\N	TEST	LANDINGPAGE-IGNORE	test@example.com	0400000000	6065	landing page source test	2026-06-22 06:07:24.363882
10	car	30000	4	\N	PIPELINE	TEST-PLEASE-IGNORE	test@example.com	0400000000	6065	Live pipeline test - confirms lead capture + email in production	2026-06-22 06:49:48.280491
11	personal	25000	36	\N	Test	User	test@missingcash.com.au	0400000000	6000	This is a test lead — please ignore.	2026-06-24 16:04:17.267411
12	personal	10000	3	\N	Test	Lead	test@missingcash.com.au	0400000000	6000	This is a test lead to verify the Mystro integration is working correctly.	2026-06-26 07:22:52.614392
\.


--
-- Data for Name: mia_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mia_config (key, value, updated_at) FROM stdin;
\.


--
-- Data for Name: mia_dev_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mia_dev_tasks (id, title, description, status, priority, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: mia_free_searches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mia_free_searches (id, email, first_name, last_name, dob, current_address, previous_addresses, previous_surnames, status, total_amount_cents, teaser_matches_json, stripe_session_id, report_sent_at, created_at) FROM stdin;
1	test@test.com	Lee	Morris	07/10/1969	38 Whitemoss Turn Waikiki Western Australia 6169	\N	\N	not_found	0	[]	\N	\N	2026-06-25 03:06:40.582516
2	test@test.com	Lee	Barry Morris	07/10/1969	38 Whitemoss Turn Waikiki Western Australia 6169	\N	Morris, Barry	not_found	0	[]	\N	\N	2026-06-25 03:07:12.868973
3	test@test.com	Lee Barry	Morris	07/10/1969	38 Whitemoss Turn Waikiki Western Australia 6169	\N	\N	not_found	0	[]	\N	\N	2026-06-25 03:07:47.207251
4	test@test.com	Lee	Barry Morris	07/10/1969	38 Whitemoss Turn Waikiki Western Australia 6169	\N	\N	not_found	0	[]	\N	\N	2026-06-25 03:07:47.284474
5	test@test.com	Lee Barry	Morris	07/10/1969	38 Whitemoss Turn Waikiki Western Australia 6169	\N	\N	not_found	0	[]	\N	\N	2026-06-25 03:16:47.391802
6	test@test.com	Lee Barry	Morris	07/10/1969	38 Whitemoss Turn Waikiki Western Australia 6169	\N	\N	not_found	0	[]	\N	\N	2026-06-25 03:21:33.809976
7	test@test.com	Lee Barry	Morris	07/10/1969	38 Whitemoss Turn Waikiki Western Australia 6169	\N	\N	not_found	0	[]	\N	\N	2026-06-25 03:24:30.531998
8	test@test.com	Test	User	unknown	6065	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:29:01.536295
9	admin@missingcash.com.au	Carly Catherine	Morris	07/04/1994	Australia	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:31:09.469641
10	admin@missingcash.com.au	Test	Lead	unknown	6065	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:32:01.484061
11	admin@missingcash.com.au	Test	Lead	unknown	6065	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:35:01.485418
12	admin@missingcash.com.au	Final	Check	unknown	6065	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:38:01.497582
13	admin@missingcash.com.au	Delivery	Check	unknown	6065	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:41:01.506987
14	jmorgan@missingcash.com.au	Domain	Check	unknown	6065	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:44:01.492459
15	jmorgan@missingcash.com.au	Domain	Recheck	unknown	6065	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:47:01.509069
16	test@example.com	TEST	IGNORE-LOCAL	unknown	6000	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:50:01.505278
17	test@example.com	TEST	LANDINGPAGE-IGNORE	unknown	6065	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:53:01.507116
18	test@example.com	PIPELINE	TEST-PLEASE-IGNORE	unknown	6065	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:56:01.523341
19	jmorgan@missingcash.com.au	Carly Catherine	Morris	07/04/1994	Australia	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:56:39.838309
20	jmorgan@missingcash.com.au	Carly	Morris	07/04/1994	Australia	\N	\N	not_found	0	[]	\N	\N	2026-06-25 04:58:58.780271
21	jmorgan@missingcash.com.au	Carley Catherine	Morris	07/04/1994	Australia	\N	\N	not_found	0	[]	\N	\N	2026-06-25 05:04:52.256206
22	jmorgan@missingcash.com.au	Carley	Morris	07/04/1994	Australia	\N	\N	not_found	0	[]	\N	\N	2026-06-25 05:06:38.476234
23	jmorgan@missingcash.com.au	Carley	Morris	07/04/1994	Waikiki WA 6169	\N	\N	not_found	0	[]	\N	\N	2026-06-25 05:22:17.799208
24	test@missingcash.com.au	Karen	Morris	1968-08-02	6169 WA	\N	Lee	not_found	0	[]	\N	\N	2026-06-25 05:57:23.88108
25	test@missingcash.com.au	Test	User	unknown	6000	\N	\N	not_found	0	[]	\N	\N	2026-06-25 16:59:28.118932
26	test@test.com	Lee	Barry Morris	unknown	WA	\N	\N	searching	\N	\N	\N	\N	2026-06-25 17:02:27.917371
27	test@test.com	Lee	Barry Morris	unknown	WA	\N	\N	found	0	[{"name":"Lee Barry Morris","holder":"Unclaimed Moneys Search - ACT Treasury","state":"","amount":"","source":"Google Search (gov.au)"}]	\N	\N	2026-06-25 17:02:54.674935
28	test@missingcash.com.au	Carly	Morris	1968-08-02	6169 WA	\N	Catherine	found	16870	[{"name":"Carly Morris","holder":"","state":"","amount":"$84.35","source":"WA Unclaimed Monies (DTF)"},{"name":"Carly Catherine","holder":"","state":"","amount":"$84.35","source":"WA Unclaimed Monies (DTF)"}]	\N	\N	2026-06-25 17:03:08.28821
29	test@test.com	Test	User	1990-01-15	unknown	\N	\N	found	9033	[{"name":"Test User","holder":"","state":"","amount":"$90.33","source":"WA Unclaimed Monies (DTF)"}]	\N	\N	2026-06-25 17:05:54.64124
30	test@missingcash.com.au	Test	Lead	unknown	6000	\N	\N	found	0	[{"name":"Test Lead","holder":"21.12.12 - Gazette Cover.fm","state":"","amount":"","source":"Google Search (gov.au)"}]	\N	\N	2026-06-26 07:24:04.19187
\.


--
-- Data for Name: mia_goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mia_goals (id, date, goal, priority, status, reasoning, completed_at, created_at) FROM stdin;
1	2026-06-28	Research and find contact information for at least 3 prospects	1	pending	Building connections is crucial for converting prospects.	\N	2026-06-28 06:30:05.641059
2	2026-06-28	Follow up on yesterday's two tasks to ensure all actions are recorded	2	pending	Maintaining accurate records is essential for tracking progress.	\N	2026-06-28 06:30:05.641059
3	2026-06-28	Review and analyze the current pipeline for trends and improvements	3	pending	Understanding the pipeline will help identify potential opportunities.	\N	2026-06-28 06:30:05.641059
4	2026-06-28	Prepare a brief report summarizing findings from today's activities	4	pending	Documenting results helps in refining strategies for the future.	\N	2026-06-28 06:30:05.641059
5	2026-06-28	Allocate time for professional development by reading up on unclaimed money regulations	5	pending	Staying informed will enhance service quality and compliance.	\N	2026-06-28 06:30:05.641059
6	2026-06-29	Research 5 prospects for potential contact information.	1	pending	We need to move prospects to contact stage.	\N	2026-06-29 06:30:05.253018
7	2026-06-29	Send introductory emails to 3 prospects from the pipeline.	2	pending	Initiating contact can promote engagement.	\N	2026-06-29 06:30:05.253018
8	2026-06-29	Review and update the pipeline status for all 18 prospects.	3	pending	Maintaining pipeline accuracy is crucial for tracking progress.	\N	2026-06-29 06:30:05.253018
9	2026-06-29	Reflect on lessons learned from last week’s outreach efforts.	4	pending	Reflection helps improve future strategies and tactics.	\N	2026-06-29 06:30:05.253018
10	2026-06-29	Create a report summarizing yesterday's progress and insights.	5	pending	Documentation supports accountability and planning.	\N	2026-06-29 06:30:05.253018
11	2026-06-30	Research and identify contacts for at least 5 prospects in the pipeline.	1	pending	Building connections is crucial for progress.	\N	2026-06-30 06:30:05.54058
12	2026-06-30	Follow up on any outstanding information requests from yesterday's tasks.	2	pending	Maintaining momentum helps keep tasks moving forward.	\N	2026-06-30 06:30:05.54058
13	2026-06-30	Draft a report summarizing insights from yesterday's tasks to inform future strategies.	3	pending	Reflecting on progress can improve our approach.	\N	2026-06-30 06:30:05.54058
14	2026-06-30	Allocate 30 minutes to review and refine our approach to prospect outreach.	4	pending	Optimizing outreach will enhance engagement with prospects.	\N	2026-06-30 06:30:05.54058
15	2026-07-01	Research and add contact information for 5 prospects in the pipeline	1	pending	Advancing outreach efforts to secure potential leads.	\N	2026-07-01 11:11:39.559333
16	2026-07-01	Complete follow-up tasks for any outstanding prospects from previous weeks	2	pending	Ensures no potential leads are left unattended for too long.	\N	2026-07-01 11:11:39.559333
17	2026-07-01	Review and log data from previous sessions for better tracking	3	pending	Improves understanding of past interactions and informs future strategies.	\N	2026-07-01 11:11:39.559333
18	2026-07-01	Identify and analyze trends in unclaimed money cases reported	4	pending	Enhances targeting strategies for reaching out to potential claimants.	\N	2026-07-01 11:11:39.559333
19	2026-07-01	Develop a checklist for efficient prospect outreach	5	pending	Streamlines the outreach process for better productivity moving forward.	\N	2026-07-01 11:11:39.559333
20	2026-07-02	Research and find contact information for 5 prospects in the pipeline	1	pending	Key to advancing prospects and fulfilling MissingCash's mission.	\N	2026-07-02 07:10:22.89729
21	2026-07-02	Complete 3 follow-up tasks with previous outreach contacts	2	pending	Re-engaging with contacts can yield positive results and progress.	\N	2026-07-02 07:10:22.89729
22	2026-07-02	Analyze the effectiveness of last week's outreach strategies	3	pending	Reflection will help improve future engagements and strategies with prospects.	\N	2026-07-02 07:10:22.89729
23	2026-07-02	Document and report any new insights or trends observed with prospects	4	pending	Staying informed will enhance the understanding of potential claims.	\N	2026-07-02 07:10:22.89729
24	2026-07-02	Set aside time for a team discussion on improving the outreach approach	5	pending	Collaboration can lead to better strategies and faster successes.	\N	2026-07-02 07:10:22.89729
\.


--
-- Data for Name: mia_memories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mia_memories (session_id, email, memories, updated_at) FROM stdin;
f7d51520-6479-4b34-bbc1-39dbcb867e94	\N	- Full name: Zac  \n- Preferred way to be addressed: Zac	2026-06-27 13:47:26.587
\.


--
-- Data for Name: mia_reflections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mia_reflections (id, date, content, tasks_completed, mood_label, activity_score, created_at) FROM stdin;
\.


--
-- Data for Name: mia_research_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mia_research_requests (id, stripe_session_id, email, customer_name, first_name, last_name, dob, current_address, previous_addresses, previous_surnames, report_sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: mia_task_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mia_task_log (id, type, status, input, output, duration_ms, created_at, completed_at) FROM stdin;
1	report	completed	system wake-up — starting daily lifecycle	Woke up. Starting overnight review.	183	2026-06-28 06:00:00.019321	2026-06-28 06:00:00.189
2	pipeline_check	completed	overnight review	Overnight: 2 total tasks, 0 failed. 2 entries reviewed.	42	2026-06-28 06:05:00.022914	2026-06-28 06:05:00.048
3	reflection	completed	autonomous goal setting	Set 5 goals: Research and find contact information for at least 3 prospects; Follow up on yesterday's two tasks to ensure all actions are recorded…	5640	2026-06-28 06:30:00.020779	2026-06-28 06:30:05.648
4	reflection	completed	autonomous goal setting	Set 5 goals: Research and find contact information for at least 3 prospects; Follow up on yesterday's two tasks to ensure all actions are recorded…	61	2026-06-28 08:54:48.326767	2026-06-28 08:54:48.386
5	pipeline_check	completed	scheduled pipeline health check	Pipeline: 18 prospects, 0 contacts found.	178	2026-06-28 09:00:00.018161	2026-06-28 09:00:00.18
6	pipeline_check	completed	scheduled pipeline health check	Pipeline: 18 prospects, 0 contacts found.	244	2026-06-28 13:00:00.028389	2026-06-28 13:00:00.258
7	reflection	completed	autonomous goal setting	Set 5 goals: Research and find contact information for at least 3 prospects; Follow up on yesterday's two tasks to ensure all actions are recorded…	25	2026-06-28 13:27:57.547097	2026-06-28 13:27:57.57
8	reflection	completed	autonomous goal setting	Set 5 goals: Research and find contact information for at least 3 prospects; Follow up on yesterday's two tasks to ensure all actions are recorded…	30	2026-06-28 15:14:12.627254	2026-06-28 15:14:12.652
9	report	completed	system wake-up — starting daily lifecycle	Woke up. Starting overnight review.	51	2026-06-29 06:00:00.017284	2026-06-29 06:00:00.056
10	pipeline_check	completed	overnight review	Overnight: 2 total tasks, 0 failed. 10 entries reviewed.	64	2026-06-29 06:05:00.014327	2026-06-29 06:05:00.069
11	reflection	completed	autonomous goal setting	Set 5 goals: Research 5 prospects for potential contact information.; Send introductory emails to 3 prospects from the pipeline.…	5254	2026-06-29 06:30:00.021842	2026-06-29 06:30:05.259
12	reflection	completed	autonomous goal setting	Set 5 goals: Research 5 prospects for potential contact information.; Send introductory emails to 3 prospects from the pipeline.…	225	2026-06-29 07:01:09.060493	2026-06-29 07:01:09.282
13	pipeline_check	completed	scheduled pipeline health check	Pipeline: 18 prospects, 0 contacts found.	389	2026-06-29 09:00:00.013457	2026-06-29 09:00:00.392
14	reflection	completed	autonomous goal setting	Set 5 goals: Research 5 prospects for potential contact information.; Send introductory emails to 3 prospects from the pipeline.…	15	2026-06-29 12:18:05.719331	2026-06-29 12:18:05.733
15	pipeline_check	completed	scheduled pipeline health check	Pipeline: 18 prospects, 0 contacts found.	413	2026-06-29 13:00:00.022192	2026-06-29 13:00:00.42
16	report	completed	system wake-up — starting daily lifecycle	Woke up. Starting overnight review.	318	2026-06-30 06:00:00.013678	2026-06-30 06:00:00.322
17	pipeline_check	completed	overnight review	Overnight: 2 total tasks, 0 failed. 10 entries reviewed.	37	2026-06-30 06:05:00.020808	2026-06-30 06:05:00.044
18	reflection	completed	autonomous goal setting	Set 4 goals: Research and identify contacts for at least 5 prospects in the pipeline.; Follow up on any outstanding information requests from yesterday's tasks.…	5544	2026-06-30 06:30:00.012535	2026-06-30 06:30:05.547
19	reflection	completed	autonomous goal setting	Set 4 goals: Research and identify contacts for at least 5 prospects in the pipeline.; Follow up on any outstanding information requests from yesterday's tasks.…	136	2026-06-30 07:41:56.782385	2026-06-30 07:41:56.915
20	pipeline_check	completed	scheduled pipeline health check	Pipeline: 18 prospects, 0 contacts found.	393	2026-06-30 09:00:00.005478	2026-06-30 09:00:00.396
21	reflection	completed	autonomous goal setting	Set 5 goals: Research and add contact information for 5 prospects in the pipeline; Complete follow-up tasks for any outstanding prospects from previous weeks…	4788	2026-07-01 11:11:34.780316	2026-07-01 11:11:39.566
22	reflection	completed	autonomous goal setting	Set 5 goals: Research and find contact information for 5 prospects in the pipeline; Complete 3 follow-up tasks with previous outreach contacts…	11462	2026-07-02 07:10:11.446019	2026-07-02 07:10:22.905
23	reflection	completed	autonomous goal setting	Set 5 goals: Research and find contact information for 5 prospects in the pipeline; Complete 3 follow-up tasks with previous outreach contacts…	21	2026-07-02 07:11:06.163947	2026-07-02 07:11:06.183
24	pipeline_check	completed	scheduled pipeline health check	Pipeline: 18 prospects, 0 contacts found.	193	2026-07-02 09:00:00.023624	2026-07-02 09:00:00.2
25	reflection	completed	autonomous goal setting	Set 5 goals: Research and find contact information for 5 prospects in the pipeline; Complete 3 follow-up tasks with previous outreach contacts…	17	2026-07-02 09:46:08.015984	2026-07-02 09:46:08.031
\.


--
-- Data for Name: page_views; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.page_views (id, path, referrer, user_agent, created_at) FROM stdin;
1	/admin	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-25 17:10:35.711128
2	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-25 17:11:00.931435
3	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-25 17:11:01.565365
4	/admin	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-25 17:11:06.125899
5	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-25 18:11:56.900323
6	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 00:26:43.331764
7	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 02:04:17.691422
8	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 02:05:21.433169
9	/	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 02:31:49.124091
10	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 02:31:49.425488
11	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 02:35:44.713585
12	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 02:49:03.162566
13	/	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 03:15:51.660915
14	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 03:15:52.072353
15	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 03:19:05.637546
16	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 03:19:06.584417
17	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 03:21:01.273294
18	/claim-report	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 03:21:51.337599
19	/claim-report	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 03:22:28.887183
20	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 03:22:48.768428
21	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 03:23:37.630972
22	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 03:24:01.163142
23	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 03:24:11.402044
24	/claim-report	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 03:24:14.164322
25	/	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 03:26:09.813966
26	/start	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 03:26:35.554393
27	/mia-search	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 03:26:38.697659
28	/start	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 03:28:35.068007
29	/mia-search	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 03:28:38.201642
30	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 03:55:50.017293
31	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 04:13:07.821396
32	/admin	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 04:21:51.704164
33	/admin/batch	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 04:22:14.871131
34	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 04:46:03.359279
35	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 05:06:11.293491
36	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 07:21:11.79295
37	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 07:57:53.38291
38	/admin	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-26 09:24:33.917468
39	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 09:37:04.050011
40	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 09:38:29.495031
41	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 10:29:49.421477
42	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 12:14:50.687845
43	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 12:32:47.459228
44	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 12:33:46.431106
45	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 13:21:15.458188
46	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 13:54:32.872431
47	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 13:59:05.798567
48	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-26 16:03:26.048292
49	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 09:24:14.367957
50	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 09:26:14.444343
51	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 13:36:38.567117
52	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 13:39:54.444319
53	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 13:41:50.640306
54	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 13:41:57.40525
55	/	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	2026-06-27 13:46:48.989893
56	/finance	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	2026-06-27 13:47:38.744217
57	/find-my-money	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	2026-06-27 13:47:47.052426
58	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 13:50:58.123786
59	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 14:08:08.330377
60	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 14:08:21.028244
61	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 14:08:31.157385
62	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 14:08:36.774856
63	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-27 14:08:37.304631
64	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:24:48.581038
65	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:25:58.984686
66	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:26:48.811646
67	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:27:37.069318
68	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:27:51.068569
69	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:28:36.496345
70	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:28:45.626941
71	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:28:52.254944
72	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:29:12.155725
73	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:29:28.819416
74	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:29:33.59458
75	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:29:42.01891
76	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:31:16.068349
77	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:31:20.495723
78	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:31:37.015117
79	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:31:47.52301
80	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:31:52.12731
81	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:32:01.723463
82	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:34:48.198228
83	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:35:40.980318
84	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:45:21.4856
85	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 01:59:11.55757
86	/	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-28 01:59:11.809239
87	/admin	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-28 01:59:23.192778
88	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 02:09:39.157026
89	/admin	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-28 02:09:41.839087
90	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 02:31:03.522487
91	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 04:05:27.575413
92	/	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-28 04:39:59.39189
93	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 04:40:00.28552
94	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 08:54:51.506745
95	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 09:47:23.097474
96	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-28 15:35:04.006098
97	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 01:25:13.688461
98	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 01:33:56.746101
99	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 03:27:35.017147
100	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 03:42:08.899526
101	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 03:49:50.438454
102	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 04:15:05.661873
103	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 05:15:13.580643
104	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 05:15:19.609536
105	/	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-29 05:17:24.298882
106	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 05:17:26.421986
107	/mia-dev	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-29 05:17:34.724838
108	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 05:24:37.262078
109	/	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-29 05:24:39.234115
110	/mia-dev	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-29 05:40:58.338507
111	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 05:46:57.018587
112	/mia-dev	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0	2026-06-29 05:46:58.988341
113	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 05:48:14.598859
114	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 05:57:48.345022
115	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 05:58:55.591156
116	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 06:02:10.659602
117	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 06:06:52.20624
118	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 07:02:43.841192
119	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 08:20:01.695901
120	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-29 12:18:08.79605
121	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-30 01:32:34.196891
122	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-30 02:12:04.987361
123	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-30 02:12:42.781507
124	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-30 02:21:48.378775
125	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-30 02:21:54.229388
126	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-30 02:36:58.54706
127	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-30 02:36:59.242392
128	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-30 02:51:50.316356
129	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-06-30 09:21:52.145514
130	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-01 11:11:33.098522
131	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-01 11:16:24.215108
132	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-02 07:10:08.901303
133	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-02 07:11:08.562884
134	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-02 07:18:25.865471
135	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-02 08:07:34.671158
136	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-02 08:12:34.085301
137	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-02 09:46:12.84333
138	/	https://d2c17132-279e-4c62-a827-c3c79ae46ec2-00-2b7ygmn6piktm.sisko.replit.dev/__replco/workspace_iframe.html?initialPath=%2F&id=artifacts%2Fmissingcash	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-02 10:27:47.694802
139	/	https://replit.com/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-02 10:39:39.44544
\.


--
-- Data for Name: paid_searches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.paid_searches (id, first_name, last_name, email, state, stripe_session_id, status, results_found, searched_at, emailed_at, created_at, source) FROM stdin;
\.


--
-- Data for Name: prospects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prospects (id, name, amount, holder, state, source, source_key, letter, scraped_at, contact_status, contact_email, contact_phone, contact_address, contact_source, contact_searched_at, outreach_sent_at, stripe_session_id, outreach_subject, outreach_body_text) FROM stdin;
11987	ANTHONY WILLIAM FERGUSON	$747000.00	FORTESCUE METALS GROUP LTD	HOMEBUSH SOUTH NSW 2114	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	not_found	\N	\N	\N	\N	2026-06-30 02:30:25.247	\N	\N	\N	\N
11988	ANTHONY WILLIAM FERGUSON	$540000.00	FORTESCUE METALS GROUP LTD	HOMEBUSH SOUTH NSW 2114	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	not_found	\N	\N	\N	\N	2026-06-30 02:31:12.686	\N	\N	\N	\N
11989	MARLENE ROBERTSON	$272000.00	FORTESCUE METALS GROUP LTD	HOMEBUSH NSW 2140	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	not_found	\N	\N	\N	\N	2026-06-30 02:31:54.955	\N	\N	\N	\N
11990	STIRLING, JULIA MARY	$241197.04	STIRLING ETHNIC AGED HOMES ASSOC INC (MYVISTA)	BALCATTA WA 6021	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	not_found	\N	\N	\N	\N	2026-06-30 02:32:49.328	\N	\N	\N	\N
11991	HARRIS CHANTREY ALFRED	$200659.78	DEPARTMENT OF JUSTICE	BOULDER WA	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	not_found	\N	\N	\N	\N	2026-06-30 02:33:37.783	\N	\N	\N	\N
11992	TEY, KOK YONG	$185105.70	DEPARTMENT OF JUSTICE	KARDINYA WA 6163	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	not_found	\N	\N	\N	\N	2026-06-30 02:34:30.806	\N	\N	\N	\N
11993	ANTHONY WILLIAM FERGUSON	$180000.00	FORTESCUE METALS GROUP LTD	HOMEBUSH SOUTH NSW 2114	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	not_found	\N	\N	\N	\N	2026-06-30 02:35:18.377	\N	\N	\N	\N
11994	MARLENE ROBERTSON	$180000.00	FORTESCUE METALS GROUP LTD	HOMEBUSH NSW 2140	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	not_found	\N	\N	\N	\N	2026-06-30 02:36:01.097	\N	\N	\N	\N
11998	FRANCES RITA TWOMEY	$118175.00	ASG GROUP LTD	PITT TOWN NSW 2756	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	pending	\N	\N	\N	\N	\N	\N	\N	\N	\N
11999	BELL DOROTHY JEAN	$114622.50	WESFARMERS LTD	INGLEWOOD WA 6932	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	pending	\N	\N	\N	\N	\N	\N	\N	\N	\N
12000	GORING JOHN	$110659.33	JULIA JOHNSTON TAS CALVERLEY JOHNSTON LAWYERS	GOOMALLING WA 6460	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	pending	\N	\N	\N	\N	\N	\N	\N	\N	\N
12001	EST DOUGLAS NORMAN KNIGHT	$107019.18	WESTERN AUSTRALIAN TREASURY CORPORATION	PARKERVILLE WA 6081	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	pending	\N	\N	\N	\N	\N	\N	\N	\N	\N
12002	MR WILLIAM TOBIAS BROOKS	$95000.00	TAMBOURAH METALS LTD	SHENTON PARK WA 6008	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	pending	\N	\N	\N	\N	\N	\N	\N	\N	\N
12003	RAYMOND HILL	$92219.07	ROCKY BAY LTD	COMO WA 6152	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	pending	\N	\N	\N	\N	\N	\N	\N	\N	\N
11995	JAMES PATRICK JOHNSON	$168000.00	FORTESCUE METALS GROUP LTD	SYDNEY NSW 2000	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	not_found	\N	\N	\N	\N	2026-06-30 02:36:41.011	\N	\N	\N	\N
11996	ERROL JOHN BOYLE	$167886.54	RATTIGAN AND ASSOCIATES	LAKELANDS WA 6180	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	not_found	\N	\N	\N	\N	2026-06-30 02:37:21.94	\N	\N	\N	\N
11997	DOREEN BEATRICE COCHRANE (NEE ROBERTS)	$140789.09	DEPARTMENT OF JUSTICE	ALBANY WA	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	not_found	\N	\N	\N	\N	2026-06-30 02:38:03.754	\N	\N	\N	\N
12004	ANTHONY WILLIAM FERGUSON	$90000.00	FORTESCUE METALS GROUP LTD	HOMEBUSH SOUTH NSW 2114	WA Unclaimed Monies (High Value)	wa-dtf-hv	HV	2026-06-30 02:29:26.770542	pending	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: search_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.search_submissions (id, first_name, last_name, email, state, birth_year, created_at) FROM stdin;
1	Lee	Barry Morris	test@test.com	WA	\N	2026-06-25 03:04:04.979308
\.


--
-- Data for Name: tiktok_leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tiktok_leads (id, first_name, last_name, dob, email, source, created_at) FROM stdin;
1	Test	User	1990-01-15	test@test.com	tiktok-v1	2026-06-24 16:25:06.704951
\.


--
-- Data for Name: unsubscribes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.unsubscribes (id, email, unsubscribed_at, prospect_id, reason) FROM stdin;
\.


--
-- Name: auto_search_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auto_search_results_id_seq', 14, true);


--
-- Name: email_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_alerts_id_seq', 2, true);


--
-- Name: finance_enquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.finance_enquiries_id_seq', 12, true);


--
-- Name: mia_dev_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mia_dev_tasks_id_seq', 1, false);


--
-- Name: mia_free_searches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mia_free_searches_id_seq', 30, true);


--
-- Name: mia_goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mia_goals_id_seq', 24, true);


--
-- Name: mia_reflections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mia_reflections_id_seq', 1, false);


--
-- Name: mia_research_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mia_research_requests_id_seq', 1, false);


--
-- Name: mia_task_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mia_task_log_id_seq', 25, true);


--
-- Name: page_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.page_views_id_seq', 139, true);


--
-- Name: paid_searches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.paid_searches_id_seq', 1, false);


--
-- Name: prospects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prospects_id_seq', 12004, true);


--
-- Name: search_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.search_submissions_id_seq', 1, true);


--
-- Name: tiktok_leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tiktok_leads_id_seq', 1, true);


--
-- Name: unsubscribes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.unsubscribes_id_seq', 1, false);


--
-- Name: alphabet_crawl_progress alphabet_crawl_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alphabet_crawl_progress
    ADD CONSTRAINT alphabet_crawl_progress_pkey PRIMARY KEY (letter);


--
-- Name: auto_search_results auto_search_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_search_results
    ADD CONSTRAINT auto_search_results_pkey PRIMARY KEY (id);


--
-- Name: email_alerts email_alerts_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_alerts
    ADD CONSTRAINT email_alerts_email_unique UNIQUE (email);


--
-- Name: email_alerts email_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_alerts
    ADD CONSTRAINT email_alerts_pkey PRIMARY KEY (id);


--
-- Name: finance_enquiries finance_enquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_enquiries
    ADD CONSTRAINT finance_enquiries_pkey PRIMARY KEY (id);


--
-- Name: mia_config mia_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_config
    ADD CONSTRAINT mia_config_pkey PRIMARY KEY (key);


--
-- Name: mia_dev_tasks mia_dev_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_dev_tasks
    ADD CONSTRAINT mia_dev_tasks_pkey PRIMARY KEY (id);


--
-- Name: mia_free_searches mia_free_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_free_searches
    ADD CONSTRAINT mia_free_searches_pkey PRIMARY KEY (id);


--
-- Name: mia_goals mia_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_goals
    ADD CONSTRAINT mia_goals_pkey PRIMARY KEY (id);


--
-- Name: mia_memories mia_memories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_memories
    ADD CONSTRAINT mia_memories_pkey PRIMARY KEY (session_id);


--
-- Name: mia_reflections mia_reflections_date_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_reflections
    ADD CONSTRAINT mia_reflections_date_unique UNIQUE (date);


--
-- Name: mia_reflections mia_reflections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_reflections
    ADD CONSTRAINT mia_reflections_pkey PRIMARY KEY (id);


--
-- Name: mia_research_requests mia_research_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_research_requests
    ADD CONSTRAINT mia_research_requests_pkey PRIMARY KEY (id);


--
-- Name: mia_research_requests mia_research_requests_stripe_session_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_research_requests
    ADD CONSTRAINT mia_research_requests_stripe_session_id_unique UNIQUE (stripe_session_id);


--
-- Name: mia_task_log mia_task_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mia_task_log
    ADD CONSTRAINT mia_task_log_pkey PRIMARY KEY (id);


--
-- Name: page_views page_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_pkey PRIMARY KEY (id);


--
-- Name: paid_searches paid_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paid_searches
    ADD CONSTRAINT paid_searches_pkey PRIMARY KEY (id);


--
-- Name: paid_searches paid_searches_stripe_session_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paid_searches
    ADD CONSTRAINT paid_searches_stripe_session_id_unique UNIQUE (stripe_session_id);


--
-- Name: prospects prospects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospects
    ADD CONSTRAINT prospects_pkey PRIMARY KEY (id);


--
-- Name: search_submissions search_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_submissions
    ADD CONSTRAINT search_submissions_pkey PRIMARY KEY (id);


--
-- Name: tiktok_leads tiktok_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tiktok_leads
    ADD CONSTRAINT tiktok_leads_pkey PRIMARY KEY (id);


--
-- Name: unsubscribes unsubscribes_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unsubscribes
    ADD CONSTRAINT unsubscribes_email_unique UNIQUE (email);


--
-- Name: unsubscribes unsubscribes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unsubscribes
    ADD CONSTRAINT unsubscribes_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict Fn01HGRGsdTo2CW5VDDxlSSrX2tSSSsz5WH9P0NjUCHf8BftAXGM78B1F6LS3hY


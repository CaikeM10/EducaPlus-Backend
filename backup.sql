--
-- PostgreSQL database dump
--

\restrict 7fm0SH4Sc7rweyjTKIXEedxdL4bFrh3Dhcld5IQ1BKCJRuWVNqWejjaMInpSS8t

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: DiagnosisResult; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DiagnosisResult" AS ENUM (
    'GENERAL_PEDAGOGY',
    'INCLUSIVE_EDUCATION',
    'AUTISM_SUPPORT',
    'TDAH_SUPPORT',
    'DYSLEXIA_SUPPORT'
);


ALTER TYPE public."DiagnosisResult" OWNER TO postgres;

--
-- Name: LearningCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LearningCategory" AS ENUM (
    'FUNDAMENTOS',
    'INCLUSAO',
    'AUTISMO',
    'TDAH',
    'DISLEXIA',
    'GERAL'
);


ALTER TYPE public."LearningCategory" OWNER TO postgres;

--
-- Name: LearningLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LearningLevel" AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
);


ALTER TYPE public."LearningLevel" OWNER TO postgres;

--
-- Name: LessonStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LessonStatus" AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'READY_FOR_QUIZ',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."LessonStatus" OWNER TO postgres;

--
-- Name: MaterialConsumptionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MaterialConsumptionStatus" AS ENUM (
    'NOT_STARTED',
    'OPENED',
    'IN_PROGRESS',
    'COMPLETED'
);


ALTER TYPE public."MaterialConsumptionStatus" OWNER TO postgres;

--
-- Name: ResourceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ResourceType" AS ENUM (
    'PDF',
    'VIDEO',
    'DOCUMENT',
    'TEMPLATE'
);


ALTER TYPE public."ResourceType" OWNER TO postgres;

--
-- Name: RoleType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RoleType" AS ENUM (
    'TEACHER',
    'COORDINATOR',
    'SPECIAL_ED',
    'ADMIN'
);


ALTER TYPE public."RoleType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Diagnosis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Diagnosis" (
    id text NOT NULL,
    "userId" text NOT NULL,
    answers jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    result public."DiagnosisResult" NOT NULL
);


ALTER TABLE public."Diagnosis" OWNER TO postgres;

--
-- Name: Diary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Diary" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inclusionReflection" text,
    "lessonPlanId" text NOT NULL,
    "studentResponse" text,
    "whatFailed" text,
    "whatWorked" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Diary" OWNER TO postgres;

--
-- Name: LearningPath; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LearningPath" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category public."LearningCategory" DEFAULT 'GERAL'::public."LearningCategory" NOT NULL,
    duration text,
    level public."LearningLevel" DEFAULT 'BEGINNER'::public."LearningLevel" NOT NULL
);


ALTER TABLE public."LearningPath" OWNER TO postgres;

--
-- Name: LessonPlan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LessonPlan" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    content text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    inclusions text[],
    objectives text[],
    strategies text[],
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LessonPlan" OWNER TO postgres;

--
-- Name: LessonProgress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LessonProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "stepId" text NOT NULL,
    status public."LessonStatus" DEFAULT 'NOT_STARTED'::public."LessonStatus" NOT NULL,
    "materialsCompleted" boolean DEFAULT false NOT NULL,
    "quizPassed" boolean DEFAULT false NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LessonProgress" OWNER TO postgres;

--
-- Name: LoginEvent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LoginEvent" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LoginEvent" OWNER TO postgres;

--
-- Name: Recommendation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Recommendation" (
    id text NOT NULL,
    "diagnosisId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "learningPathId" text,
    reason text,
    "resourceId" text
);


ALTER TABLE public."Recommendation" OWNER TO postgres;

--
-- Name: Resource; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Resource" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    url text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "stepId" text,
    "categoryId" text NOT NULL,
    "createdById" text NOT NULL,
    thumbnail text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    type public."ResourceType" NOT NULL
);


ALTER TABLE public."Resource" OWNER TO postgres;

--
-- Name: ResourceConsumption; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ResourceConsumption" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "resourceId" text NOT NULL,
    "stepId" text,
    status public."MaterialConsumptionStatus" DEFAULT 'OPENED'::public."MaterialConsumptionStatus" NOT NULL,
    "openedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "progressPercent" integer,
    "progressSeconds" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ResourceConsumption" OWNER TO postgres;

--
-- Name: ResourceDownload; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ResourceDownload" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "resourceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ResourceDownload" OWNER TO postgres;

--
-- Name: ResourceTag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ResourceTag" (
    "resourceId" text NOT NULL,
    "tagId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ResourceTag" OWNER TO postgres;

--
-- Name: Step; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Step" (
    id text NOT NULL,
    title text NOT NULL,
    "position" integer NOT NULL,
    "learningPathId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    content text,
    description text,
    "videoUrl" text
);


ALTER TABLE public."Step" OWNER TO postgres;

--
-- Name: Tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tag" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Tag" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    password text NOT NULL,
    role public."RoleType" DEFAULT 'TEACHER'::public."RoleType" NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastLoginAt" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserProgress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "stepId" text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserProgress" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, slug, "createdAt", "updatedAt") FROM stdin;
b19ab1f4-893c-4e03-bf16-52639646af84	Autismo	autismo	2026-05-25 03:44:08.175	2026-05-25 03:44:08.175
16b3544c-9bae-42b6-92ba-264bfd49eb56	Inclusão Escolar	inclusao-escolar	2026-05-26 15:33:58.572	2026-05-26 15:33:58.572
b103c734-8741-4c68-8240-422f57c85aa9	TDAH	tdah	2026-05-26 15:34:16.888	2026-05-26 15:34:16.888
ff0c99d3-7efc-42e0-b47a-3dab9b29f0bc	Dislexia	dislexia	2026-05-26 15:34:24.808	2026-05-26 15:34:24.808
38eb662b-39df-4330-ab08-50b5fb460187	Planejamento Pedagógico	planejamento-pedagogico	2026-05-26 15:34:32.14	2026-05-26 15:34:32.14
5ef43145-8c1d-44e9-886a-3daad950fe17	Metodologias Ativas	metodologias-ativas	2026-05-26 15:34:38.981	2026-05-26 15:34:38.981
\.


--
-- Data for Name: Diagnosis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Diagnosis" (id, "userId", answers, "createdAt", "updatedAt", result) FROM stdin;
84e291b3-eeb2-4b60-9670-399c456110e0	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	{"1": "0-2", "2": "sometimes", "3": "rarely", "4": "frequently", "5": "assessment"}	2026-05-25 02:53:57.517	2026-05-25 02:53:57.517	GENERAL_PEDAGOGY
d223c06f-34cc-4022-9ab8-163ee83a1d46	8fbde382-d8ac-45ed-a8e9-efa46683b133	{"1": "0-2", "2": "rarely", "3": "sometimes", "4": "rarely", "5": "inclusive"}	2026-05-25 11:24:58.595	2026-05-25 11:24:58.595	INCLUSIVE_EDUCATION
622927c2-bef7-480f-a588-2ffe8d19aa39	2a5f11a1-ae19-4d85-8f9b-0694b5651419	{"1": "10+", "2": "never", "3": "rarely", "4": "sometimes", "5": "inclusive"}	2026-05-25 12:00:23.939	2026-05-25 12:00:23.939	INCLUSIVE_EDUCATION
acc3732c-7282-4ae1-8d40-3f20f9587e79	476dd8ff-4de3-4dae-bb19-087649ebaab8	{"1": "0-2", "2": "frequently", "3": "never", "4": "rarely", "5": "curriculum"}	2026-05-25 12:04:55.896	2026-05-25 12:04:55.896	GENERAL_PEDAGOGY
a0c351a7-fcf5-4388-810e-13a1e0cd9a8c	2829fde9-4097-40a9-917c-30bae454b163	{"1": "0-2", "2": "rarely", "3": "rarely", "4": "rarely", "5": "curriculum"}	2026-05-26 15:50:11.089	2026-05-26 15:50:11.089	GENERAL_PEDAGOGY
\.


--
-- Data for Name: Diary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Diary" (id, "userId", "createdAt", "inclusionReflection", "lessonPlanId", "studentResponse", "whatFailed", "whatWorked", "updatedAt") FROM stdin;
1848a14e-8ab8-4b8f-aef6-53f52b3f2905	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-25 03:07:16.239	dwdwd	f5253a10-d598-4c47-a48a-e393503a52e9	dwd	dwdw	deqeq	2026-05-25 03:07:16.239
33a1a419-40e3-4567-8d60-5f9d2d8f0053	8fbde382-d8ac-45ed-a8e9-efa46683b133	2026-05-25 11:25:54.235	qwqqwqw	6f860cc4-504b-4b2d-838d-21ca38866e06	qwwqww	wqqw	qwqqw	2026-05-25 11:25:54.235
\.


--
-- Data for Name: LearningPath; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LearningPath" (id, title, description, "createdAt", "createdById", "updatedAt", category, duration, level) FROM stdin;
199b0817-a895-4bf2-9680-39ec4a91678c	Inclusão de Alunos com TEA	Trilha completa sobre estratégias inclusivas para alunos com TEA.	2026-05-25 03:47:13.223	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-25 03:47:13.223	AUTISMO	4 horas	BEGINNER
ca661fc2-9238-46fc-b8be-efb7c8ee616c	Fundamentos da Educação Inclusiva	Aprenda os princípios básicos da educação inclusiva e como aplicá-los em sala de aula.	2026-05-26 15:46:13.639	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:46:13.639	INCLUSAO	3 horas	BEGINNER
db81b9b5-5e69-4b4c-95dd-d7ff5e232cc5	Inclusão de Alunos com TEA	Estratégias práticas para apoiar alunos com autismo em sala de aula.	2026-05-26 15:46:24.389	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:46:24.389	AUTISMO	5 horas	INTERMEDIATE
8c129c7a-216a-4961-aa54-257f5109d40c	Estratégias para TDAH	Aprenda a lidar com atenção, hiperatividade e impulsividade em sala.	2026-05-26 15:46:31.673	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:46:31.673	TDAH	4 horas	BEGINNER
5c91f3ac-9da1-457d-a1d3-c8d3a6b500e8	Dislexia na Escola	Métodos para apoiar alunos com dificuldades de leitura.	2026-05-26 15:46:39.249	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:46:39.249	DISLEXIA	4 horas	INTERMEDIATE
a729e82b-6326-47a1-8f81-c8463e304006	Gestão de Sala Inclusiva	Aprenda técnicas para gerenciar turmas diversas.	2026-05-26 15:47:23.775	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:47:23.775	FUNDAMENTOS	6 horas	ADVANCED
34b3fdd0-c287-4877-b87b-d3942a91af79	Tecnologia Assistiva	Conheça ferramentas digitais voltadas para inclusão.	2026-05-26 15:47:44.073	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:47:44.073	GERAL	5 horas	INTERMEDIATE
a3004390-93eb-4d11-ad8a-b14df538024e	Adaptação Curricular	Aprenda a adaptar conteúdos para diferentes necessidades.	2026-05-26 15:48:02.619	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:48:02.619	GERAL	6 horas	ADVANCED
58a7da39-6dce-43a0-984c-974194c4b774	Comunicação Alternativa	Introdução à comunicação alternativa e aumentativa.	2026-05-26 15:48:22.196	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:48:22.196	GERAL	3 horas	BEGINNER
164b7896-f1c4-4ef9-99d7-9508e6ad4d92	Avaliação Inclusiva	Métodos de avaliação adaptados para diferentes perfis.	2026-05-26 15:48:37.47	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:48:37.47	FUNDAMENTOS	4 horas	INTERMEDIATE
48e820a2-a833-4d9d-bf91-96094a178af6	Professor Mestre da Inclusão	Trilha avançada para consolidar práticas inclusivas completas.	2026-05-26 15:48:59.992	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:48:59.992	FUNDAMENTOS	8 horas	ADVANCED
\.


--
-- Data for Name: LessonPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LessonPlan" (id, title, description, content, "userId", "createdAt", inclusions, objectives, strategies, "updatedAt") FROM stdin;
f5253a10-d598-4c47-a48a-e393503a52e9	fefew	fewewfef	wefewffwf	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-25 03:01:19.518	{wefewfewfw}	{fewewfef}	{wefewfewfw}	2026-05-25 03:01:31.629
16695bec-5417-4875-b0e7-5e69715a85ab	qwdwdq	qdwqdqwdqwqw	qwdqwddwq	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-25 03:01:45.273	{qdwqdwdw}	{qdwqdqwdqwqw}	{qdwqdwdw}	2026-05-25 03:01:45.273
6f860cc4-504b-4b2d-838d-21ca38866e06	test	qqwq	qwqqw	8fbde382-d8ac-45ed-a8e9-efa46683b133	2026-05-25 11:25:44.248	{qwq}	{qqwq}	{qwq}	2026-05-25 11:25:44.248
\.


--
-- Data for Name: LessonProgress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LessonProgress" (id, "userId", "stepId", status, "materialsCompleted", "quizPassed", "completedAt", "createdAt", "updatedAt") FROM stdin;
c2dbacd8-e50e-4ba3-8ea2-2a1d025582fa	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2d44e6c8-b4b9-4f61-b602-7d2ab1dffdbf	COMPLETED	f	f	2026-05-26 15:19:38.268	2026-05-26 15:19:38.251	2026-05-26 15:19:38.27
b69120ff-73d9-4fd9-81bb-4e2fe0a36423	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	8f0c14fe-c1fd-40dd-871b-8f074d261671	COMPLETED	f	f	2026-05-26 15:19:39.152	2026-05-26 15:19:39.149	2026-05-26 15:19:39.154
8afca019-8a44-48f1-8380-6bc956b0a402	2829fde9-4097-40a9-917c-30bae454b163	929065e1-26f8-4a52-8b3f-386553c28de1	COMPLETED	f	f	2026-05-26 15:50:52.756	2026-05-26 15:50:52.745	2026-05-26 15:50:52.757
\.


--
-- Data for Name: LoginEvent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LoginEvent" (id, "userId", "createdAt") FROM stdin;
d27149af-2730-400f-a99a-2ab9ad60a1b7	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-25 02:53:45.216
66abdf05-abf1-428b-85e8-b05f28990c46	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-25 03:14:14.049
87ee7293-6e18-42a3-9f2e-69a61aab6656	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-25 03:25:50.999
7e7c212a-5797-4d6f-ae3a-23fde3399de3	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-25 03:26:19.208
ea17fddc-c9d9-4244-b6f9-9adae5db76ec	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-25 11:23:31.881
f58add12-9429-4244-bc78-354a4652d8df	8fbde382-d8ac-45ed-a8e9-efa46683b133	2026-05-25 11:24:43.868
2c1fdc81-e64b-46a2-8fdd-9d69931b5a26	8fbde382-d8ac-45ed-a8e9-efa46683b133	2026-05-25 11:26:37.432
a0e847e2-82f1-46ce-a121-c8c7ba6abad0	2a5f11a1-ae19-4d85-8f9b-0694b5651419	2026-05-25 11:52:22.396
a0014a31-e4eb-4d34-8251-31fc458e1f93	476dd8ff-4de3-4dae-bb19-087649ebaab8	2026-05-25 12:04:44.735
1b412bed-c0d3-4a00-ba4b-4ba3dd47b54c	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 12:54:17.835
aaa8ff60-4d73-4ce4-92cb-cabf0f766c2e	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 14:36:36.706
878e3864-6b27-4bd9-9fc2-1c67c7b79384	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:19:31.971
2bd08573-7f8b-441b-9690-620bddda55cb	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:32:46.161
84d8693b-11d5-41b1-baac-061e16ca0b5d	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 15:32:54.506
64a81c6c-83a0-4b99-99b0-f16bf734cc4e	2829fde9-4097-40a9-917c-30bae454b163	2026-05-26 15:49:56.402
8d76b70c-ba92-40c6-b753-af0103a6ba90	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2026-05-26 16:49:41.006
\.


--
-- Data for Name: Recommendation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Recommendation" (id, "diagnosisId", "createdAt", "learningPathId", reason, "resourceId") FROM stdin;
2a43146c-0690-499c-8d86-630a6a050eae	a0c351a7-fcf5-4388-810e-13a1e0cd9a8c	2026-05-26 15:50:11.136	34b3fdd0-c287-4877-b87b-d3942a91af79	Trilha recomendada para GENERAL_PEDAGOGY	\N
73f02940-10f7-4469-bc49-2ca0a7d4a987	a0c351a7-fcf5-4388-810e-13a1e0cd9a8c	2026-05-26 15:50:11.145	a3004390-93eb-4d11-ad8a-b14df538024e	Trilha recomendada para GENERAL_PEDAGOGY	\N
8a6a9617-7534-42ca-9b76-81e229a9028b	a0c351a7-fcf5-4388-810e-13a1e0cd9a8c	2026-05-26 15:50:11.149	58a7da39-6dce-43a0-984c-974194c4b774	Trilha recomendada para GENERAL_PEDAGOGY	\N
\.


--
-- Data for Name: Resource; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Resource" (id, title, description, url, "createdAt", "stepId", "categoryId", "createdById", thumbnail, "updatedAt", type) FROM stdin;
65253a3e-934f-4b73-b0a5-4ecfc9e83ae5	Guia Prático sobre TEA em Sala de Aula	Material introdutório para adaptação pedagógica de alunos com TEA.	https://example.com/guia-tea.pdf	2026-05-25 03:45:03.652	\N	b19ab1f4-893c-4e03-bf16-52639646af84	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	https://images.unsplash.com/photo-1509062522246-3755977927d7	2026-05-25 03:45:03.652	PDF
96090a94-5dbf-4f9b-8b4b-ea7441e7a199	O que é TEA?	Vídeo introdutório sobre autismo.	https://youtube.com/watch?v=abc123	2026-05-25 03:47:13.223	2d44e6c8-b4b9-4f61-b602-7d2ab1dffdbf	b19ab1f4-893c-4e03-bf16-52639646af84	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	\N	2026-05-25 03:47:13.223	VIDEO
a2e64d59-b299-47a8-b372-6045e21f2d21	Guia de Inclusão	PDF com estratégias práticas.	https://example.com/inclusao.pdf	2026-05-25 03:47:13.223	8f0c14fe-c1fd-40dd-871b-8f074d261671	b19ab1f4-893c-4e03-bf16-52639646af84	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	\N	2026-05-25 03:47:13.223	PDF
ebd6a2a8-ca30-4fe1-96a6-f5d1ea24b050	Guia Completo de Inclusão Escolar	Estratégias práticas para inclusão em sala de aula.	https://example.com/inclusao.pdf	2026-05-26 15:35:51.59	\N	38eb662b-39df-4330-ab08-50b5fb460187	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	https://images.unsplash.com/photo-1509062522246-3755977927d7	2026-05-26 15:35:51.59	PDF
fe85e586-12d3-48f4-93b5-6f93985a7e47	Estratégias de Ensino para TDAH	Métodos para melhorar foco e participação.	https://youtube.com/watch?v=tdah123	2026-05-26 15:36:20.346	\N	b103c734-8741-4c68-8240-422f57c85aa9	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	https://images.unsplash.com/photo-1522202176988-66273c2fd55f	2026-05-26 15:36:20.346	VIDEO
262c6def-3179-4fd9-a093-b68ebb13979b	Modelo de Adaptação Curricular	Template para personalizar atividades.	https://example.com/adaptacao.docx	2026-05-26 15:37:52.708	\N	38eb662b-39df-4330-ab08-50b5fb460187	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	https://images.unsplash.com/photo-1455390582262-044cdead277a	2026-05-26 15:37:52.708	TEMPLATE
\.


--
-- Data for Name: ResourceConsumption; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ResourceConsumption" (id, "userId", "resourceId", "stepId", status, "openedAt", "completedAt", "progressPercent", "progressSeconds", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ResourceDownload; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ResourceDownload" (id, "userId", "resourceId", "createdAt") FROM stdin;
cd26dd51-38f2-4529-a1d4-5f7fb33bf18e	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	65253a3e-934f-4b73-b0a5-4ecfc9e83ae5	2026-05-26 13:19:01.934
53268d5d-7ae2-47eb-9427-cb1649129c38	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	96090a94-5dbf-4f9b-8b4b-ea7441e7a199	2026-05-26 15:19:52.109
\.


--
-- Data for Name: ResourceTag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ResourceTag" ("resourceId", "tagId", "createdAt") FROM stdin;
65253a3e-934f-4b73-b0a5-4ecfc9e83ae5	7d10a780-e0ae-4dd8-ae2a-1aea50cb8d0e	2026-05-25 03:45:03.652
65253a3e-934f-4b73-b0a5-4ecfc9e83ae5	a8880864-75a9-44b5-b255-496c6c1be746	2026-05-25 03:45:03.652
65253a3e-934f-4b73-b0a5-4ecfc9e83ae5	66f2b89d-2eda-441b-9bad-7d4d4249a34f	2026-05-25 03:45:03.652
ebd6a2a8-ca30-4fe1-96a6-f5d1ea24b050	21e1efbf-ddf3-4d11-9d8e-a98bb0613dcc	2026-05-26 15:35:51.59
ebd6a2a8-ca30-4fe1-96a6-f5d1ea24b050	073803d2-852b-426b-8158-962e91415442	2026-05-26 15:35:51.59
ebd6a2a8-ca30-4fe1-96a6-f5d1ea24b050	7d10a780-e0ae-4dd8-ae2a-1aea50cb8d0e	2026-05-26 15:35:51.59
fe85e586-12d3-48f4-93b5-6f93985a7e47	279680fa-23c9-4b7e-835a-f76e9dba1c8d	2026-05-26 15:36:20.346
fe85e586-12d3-48f4-93b5-6f93985a7e47	f5969d6a-bc39-499a-b005-cb54ef89da02	2026-05-26 15:36:20.346
fe85e586-12d3-48f4-93b5-6f93985a7e47	cdc14cd6-b633-4451-8829-f7646b0c1411	2026-05-26 15:36:20.346
262c6def-3179-4fd9-a093-b68ebb13979b	c73a1c3b-e41f-45b4-8283-08b24bb0b987	2026-05-26 15:37:52.708
262c6def-3179-4fd9-a093-b68ebb13979b	cadb2876-9220-4796-a55e-6ff37a16ff1a	2026-05-26 15:37:52.708
262c6def-3179-4fd9-a093-b68ebb13979b	21e1efbf-ddf3-4d11-9d8e-a98bb0613dcc	2026-05-26 15:37:52.708
\.


--
-- Data for Name: Step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Step" (id, title, "position", "learningPathId", "createdAt", "updatedAt", content, description, "videoUrl") FROM stdin;
2d44e6c8-b4b9-4f61-b602-7d2ab1dffdbf	Introdução ao TEA	1	199b0817-a895-4bf2-9680-39ec4a91678c	2026-05-25 03:47:13.223	2026-05-25 03:47:13.223	\N	Compreendendo os fundamentos do transtorno do espectro autista.	\N
8f0c14fe-c1fd-40dd-871b-8f074d261671	Estratégias Inclusivas	2	199b0817-a895-4bf2-9680-39ec4a91678c	2026-05-25 03:47:13.223	2026-05-25 03:47:13.223	\N	Metodologias para aplicar em sala.	\N
f4f25f8a-be10-4bd9-bdc5-da350101c53e	O que é Educação Inclusiva	1	ca661fc2-9238-46fc-b8be-efb7c8ee616c	2026-05-26 15:46:13.639	2026-05-26 15:46:13.639	\N	Conceitos fundamentais e importância da inclusão escolar.	\N
eaeb5e08-5ef2-4deb-b21b-acdf0b6d4b9a	Barreiras na Aprendizagem	2	ca661fc2-9238-46fc-b8be-efb7c8ee616c	2026-05-26 15:46:13.639	2026-05-26 15:46:13.639	\N	Identificando desafios enfrentados pelos alunos.	\N
7e36cf45-db46-4fdd-a29a-0205ded5a899	Boas Práticas Inclusivas	3	ca661fc2-9238-46fc-b8be-efb7c8ee616c	2026-05-26 15:46:13.639	2026-05-26 15:46:13.639	\N	Estratégias simples para aplicar no dia a dia.	\N
117a585d-432d-4a69-9566-8d335500b313	Compreendendo o TEA	1	db81b9b5-5e69-4b4c-95dd-d7ff5e232cc5	2026-05-26 15:46:24.389	2026-05-26 15:46:24.389	\N	Aspectos gerais do transtorno do espectro autista.	\N
ed0a4d5d-5118-4fa3-b7c3-f445d3baa71e	Comunicação e Rotina	2	db81b9b5-5e69-4b4c-95dd-d7ff5e232cc5	2026-05-26 15:46:24.389	2026-05-26 15:46:24.389	\N	Como organizar melhor o ambiente escolar.	\N
533ecc21-6c5c-48c1-aad1-7e332f24d3d0	Adaptações Pedagógicas	3	db81b9b5-5e69-4b4c-95dd-d7ff5e232cc5	2026-05-26 15:46:24.389	2026-05-26 15:46:24.389	\N	Métodos inclusivos para diferentes perfis.	\N
2e0d0cf1-c31a-4b77-98a4-8084f97823fd	Introdução ao TDAH	1	8c129c7a-216a-4961-aa54-257f5109d40c	2026-05-26 15:46:31.673	2026-05-26 15:46:31.673	\N	Entendendo o transtorno e seus impactos.	\N
b427d0be-c072-47e1-bca9-fec171dc8fef	Organização da Sala	2	8c129c7a-216a-4961-aa54-257f5109d40c	2026-05-26 15:46:31.673	2026-05-26 15:46:31.673	\N	Criando ambientes mais produtivos.	\N
e96b6ef7-aed7-46ef-8ccf-3a0826ce4fec	Estratégias de Engajamento	3	8c129c7a-216a-4961-aa54-257f5109d40c	2026-05-26 15:46:31.673	2026-05-26 15:46:31.673	\N	Como manter o aluno focado.	\N
2838deb3-aa3c-4e25-ad39-5844ef4b8aa1	Entendendo a Dislexia	1	5c91f3ac-9da1-457d-a1d3-c8d3a6b500e8	2026-05-26 15:46:39.249	2026-05-26 15:46:39.249	\N	Características e sinais principais.	\N
e9c2f5ab-ce74-4e0e-a2f7-4d22e1107b8f	Leitura e Escrita	2	5c91f3ac-9da1-457d-a1d3-c8d3a6b500e8	2026-05-26 15:46:39.249	2026-05-26 15:46:39.249	\N	Ferramentas para melhorar o aprendizado.	\N
a5b728ef-7aa4-4afd-9285-0dd53c3f7cab	Avaliação Inclusiva	3	5c91f3ac-9da1-457d-a1d3-c8d3a6b500e8	2026-05-26 15:46:39.249	2026-05-26 15:46:39.249	\N	Formas alternativas de avaliação.	\N
dc1de210-1b98-4f35-b0a7-184ed46aa8cf	Clima Escolar	1	a729e82b-6326-47a1-8f81-c8463e304006	2026-05-26 15:47:23.775	2026-05-26 15:47:23.775	\N	Criando ambientes acolhedores.	\N
ec1dc07b-92df-4ed2-98c4-dd165258a1e0	Mediação de Conflitos	2	a729e82b-6326-47a1-8f81-c8463e304006	2026-05-26 15:47:23.775	2026-05-26 15:47:23.775	\N	Estratégias para convivência saudável.	\N
7eb67070-185b-46df-b10e-79b341c5567b	Engajamento da Turma	3	a729e82b-6326-47a1-8f81-c8463e304006	2026-05-26 15:47:23.775	2026-05-26 15:47:23.775	\N	Dinâmicas colaborativas inclusivas.	\N
3e0f756f-b764-44ce-bef3-caf165aa8d1f	Introdução às Tecnologias Assistivas	1	34b3fdd0-c287-4877-b87b-d3942a91af79	2026-05-26 15:47:44.073	2026-05-26 15:47:44.073	\N	O papel da tecnologia na inclusão.	\N
caf15f3d-ade6-467c-9f75-963e8581c2b1	Ferramentas Digitais	2	34b3fdd0-c287-4877-b87b-d3942a91af79	2026-05-26 15:47:44.073	2026-05-26 15:47:44.073	\N	Aplicativos e recursos acessíveis.	\N
748d9d8a-cd10-40e9-8016-f0d2faf13413	Aplicação em Sala	3	34b3fdd0-c287-4877-b87b-d3942a91af79	2026-05-26 15:47:44.073	2026-05-26 15:47:44.073	\N	Como integrar tecnologia às aulas.	\N
8579bec6-ac7c-48dd-aea2-a16bb489975e	Currículo Flexível	1	a3004390-93eb-4d11-ad8a-b14df538024e	2026-05-26 15:48:02.619	2026-05-26 15:48:02.619	\N	Princípios de adaptação curricular.	\N
1960ad1f-6eb8-423f-8243-ad06781c82be	Planejamento Inclusivo	2	a3004390-93eb-4d11-ad8a-b14df538024e	2026-05-26 15:48:02.619	2026-05-26 15:48:02.619	\N	Criando aulas acessíveis.	\N
d37319d0-8885-4890-ab61-a424086b790e	Avaliação Adaptada	3	a3004390-93eb-4d11-ad8a-b14df538024e	2026-05-26 15:48:02.619	2026-05-26 15:48:02.619	\N	Métodos avaliativos personalizados.	\N
1f830b83-e01e-4b0c-adde-32eb6fc83c1e	Fundamentos da CAA	1	58a7da39-6dce-43a0-984c-974194c4b774	2026-05-26 15:48:22.196	2026-05-26 15:48:22.196	\N	Conceitos básicos da comunicação alternativa.	\N
c394cd52-67c0-4bca-9f24-de34ddb30cbd	Ferramentas Visuais	2	58a7da39-6dce-43a0-984c-974194c4b774	2026-05-26 15:48:22.196	2026-05-26 15:48:22.196	\N	Uso de imagens e símbolos.	\N
d185e598-bf61-46e5-a9cc-b051485b65c4	Aplicação Prática	3	58a7da39-6dce-43a0-984c-974194c4b774	2026-05-26 15:48:22.196	2026-05-26 15:48:22.196	\N	Atividades inclusivas usando CAA.	\N
aa8df751-7e06-4b25-a7b2-a83214264ed8	Avaliação Tradicional x Inclusiva	1	164b7896-f1c4-4ef9-99d7-9508e6ad4d92	2026-05-26 15:48:37.47	2026-05-26 15:48:37.47	\N	Diferenças entre os modelos.	\N
05504809-570d-485e-9732-afd685fa4698	Ferramentas Avaliativas	2	164b7896-f1c4-4ef9-99d7-9508e6ad4d92	2026-05-26 15:48:37.47	2026-05-26 15:48:37.47	\N	Instrumentos diversos de avaliação.	\N
8b9404f1-d771-4d60-a3bb-b2533a59c63d	Feedback Inclusivo	3	164b7896-f1c4-4ef9-99d7-9508e6ad4d92	2026-05-26 15:48:37.47	2026-05-26 15:48:37.47	\N	Como dar retorno construtivo ao aluno.	\N
929065e1-26f8-4a52-8b3f-386553c28de1	Panorama da Inclusão	1	48e820a2-a833-4d9d-bf91-96094a178af6	2026-05-26 15:48:59.992	2026-05-26 15:48:59.992	\N	Revisão geral dos principais conceitos.	\N
642719c1-2998-4f1a-8304-adef594184e2	Planejamento Estratégico	2	48e820a2-a833-4d9d-bf91-96094a178af6	2026-05-26 15:48:59.992	2026-05-26 15:48:59.992	\N	Construção de aulas altamente inclusivas.	\N
fe22c276-0bd4-477a-8623-bbf5c7423ad6	Práticas Avançadas	3	48e820a2-a833-4d9d-bf91-96094a178af6	2026-05-26 15:48:59.992	2026-05-26 15:48:59.992	\N	Estratégias aplicadas em casos reais.	\N
1b4def83-eb86-44b4-85d6-87c0c2415776	Liderança Inclusiva	4	48e820a2-a833-4d9d-bf91-96094a178af6	2026-05-26 15:48:59.992	2026-05-26 15:48:59.992	\N	Como se tornar referência em inclusão escolar.	\N
\.


--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tag" (id, name, "createdAt", "updatedAt") FROM stdin;
7d10a780-e0ae-4dd8-ae2a-1aea50cb8d0e	inclusao	2026-05-25 03:45:03.652	2026-05-25 03:45:03.652
a8880864-75a9-44b5-b255-496c6c1be746	autismo	2026-05-25 03:45:03.652	2026-05-25 03:45:03.652
66f2b89d-2eda-441b-9bad-7d4d4249a34f	tea	2026-05-25 03:45:03.652	2026-05-25 03:45:03.652
21e1efbf-ddf3-4d11-9d8e-a98bb0613dcc	adaptacao	2026-05-26 15:35:51.59	2026-05-26 15:35:51.59
073803d2-852b-426b-8158-962e91415442	educacao	2026-05-26 15:35:51.59	2026-05-26 15:35:51.59
279680fa-23c9-4b7e-835a-f76e9dba1c8d	ensino	2026-05-26 15:36:20.346	2026-05-26 15:36:20.346
f5969d6a-bc39-499a-b005-cb54ef89da02	foco	2026-05-26 15:36:20.346	2026-05-26 15:36:20.346
cdc14cd6-b633-4451-8829-f7646b0c1411	tdah	2026-05-26 15:36:20.346	2026-05-26 15:36:20.346
c73a1c3b-e41f-45b4-8283-08b24bb0b987	planejamento	2026-05-26 15:37:52.708	2026-05-26 15:37:52.708
cadb2876-9220-4796-a55e-6ff37a16ff1a	curriculo	2026-05-26 15:37:52.708	2026-05-26 15:37:52.708
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "createdAt", password, role, "updatedAt", "lastLoginAt") FROM stdin;
8fbde382-d8ac-45ed-a8e9-efa46683b133	Bj	bj@bbcrat.com	2026-05-25 11:24:43.854	$2b$12$CsGTeqbBcOKD9prYZX3/7OVgHTKnryIoPvnuzEq1KD5ydxyrGBNku	TEACHER	2026-05-25 11:26:37.432	2026-05-25 11:26:37.43
2a5f11a1-ae19-4d85-8f9b-0694b5651419	qwdwq	wdqdw@wdq.wdqdd	2026-05-25 11:52:22.383	$2b$12$.P6uLluIVfigFSGx2OruNOJY6Meo1DoBQ9qyThgN3n8erGsIrNaFW	COORDINATOR	2026-05-25 11:52:22.396	2026-05-25 11:52:22.394
476dd8ff-4de3-4dae-bb19-087649ebaab8	wdwqwq	dqwdq@qdwq.dw	2026-05-25 12:04:44.727	$2b$12$qCFRb16MKvYiY3s6HjReFOVfAsHxnkpJ4yn7GMMiZyRR.E40ooSbC	TEACHER	2026-05-25 12:04:44.735	2026-05-25 12:04:44.733
2829fde9-4097-40a9-917c-30bae454b163	Jose	jose@email.com	2026-05-26 15:49:56.398	$2b$12$GTBqm4BBQeXWhIymHqUHSesGtWcUFbaScuc4FAQHnDPX2MugMHi1C	TEACHER	2026-05-26 15:49:56.402	2026-05-26 15:49:56.401
0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	Joao	jv@email.com	2026-05-25 02:53:45.203	$2b$12$BaP7GsUHOSe1kLVW/ML5c.P2RwMPB.VH1XkHAp6L/o0hyLnEaKJ.i	ADMIN	2026-05-26 16:49:41.006	2026-05-26 16:49:41.004
\.


--
-- Data for Name: UserProgress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserProgress" (id, "userId", "stepId", completed, "updatedAt", "createdAt") FROM stdin;
7304f523-3d60-4ce5-a894-d9795f389f6b	8fbde382-d8ac-45ed-a8e9-efa46683b133	8f0c14fe-c1fd-40dd-871b-8f074d261671	t	2026-05-25 11:34:42.332	2026-05-25 11:25:29.981
fac34308-c0a0-4a19-a1a2-80a2646c6624	8fbde382-d8ac-45ed-a8e9-efa46683b133	2d44e6c8-b4b9-4f61-b602-7d2ab1dffdbf	t	2026-05-25 11:34:43.704	2026-05-25 11:25:22.328
06e4dbe1-ecf1-418c-9b69-704e716b7128	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	2d44e6c8-b4b9-4f61-b602-7d2ab1dffdbf	t	2026-05-26 15:19:38.239	2026-05-25 03:48:01.232
ea5211b9-e4f8-4734-9438-ff180f39d725	0f0b5cc1-c5fb-4e1e-9357-cefccf0a1a0b	8f0c14fe-c1fd-40dd-871b-8f074d261671	t	2026-05-26 15:19:39.144	2026-05-25 03:48:04.004
5aa6127e-8e02-40fb-a35a-bb23e3934dd5	2829fde9-4097-40a9-917c-30bae454b163	929065e1-26f8-4a52-8b3f-386553c28de1	t	2026-05-26 15:50:52.727	2026-05-26 15:50:52.727
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5e8034f6-a97e-4673-aaa6-482992900823	af5bcbb7921880a25f12857577c0646d5be34873dd2d76120cc0ff1f5c75717b	2026-05-24 23:50:22.024733-03	20260407144952_init	\N	\N	2026-05-24 23:50:22.011118-03	1
0e264ec1-c605-4e49-9e24-b89a8d104293	812c44737ca9f4069e6753016320df05513ed0e88f0d54aeb7a12ed29235cea3	2026-05-24 23:50:22.160529-03	20260414114806_init	\N	\N	2026-05-24 23:50:22.025509-03	1
617128cf-0f07-4d9d-894b-6d61cf3170d2	81a947275baafa61af7bfc101030bb3d64c30c91c7b9d596b7943291b0cdd366	2026-05-24 23:50:22.212213-03	20260422125525_fix_relations	\N	\N	2026-05-24 23:50:22.161312-03	1
dccac4c3-0d9e-435f-90b4-a80377701f85	f8f39fe02851db35d4830de91220936ece22816d907ec32547a81d1e11858557	2026-05-24 23:50:22.28745-03	20260422172205_	\N	\N	2026-05-24 23:50:22.212913-03	1
a2139dbe-8249-47fe-96f4-5bb6dba191dc	63c35561f441288a85c72ace3a30a7ea48e133f9741da458a0c42465be376941	2026-05-24 23:50:22.337336-03	20260422175328_	\N	\N	2026-05-24 23:50:22.289026-03	1
722cd673-e33e-4a62-88b2-d0dff084cdff	0c42b2b04d02f994d15a05f5a427a0f27ed8a5a98395cbe636c3354282cdd69d	2026-05-24 23:50:22.445998-03	20260519131644_create_resources_module	\N	\N	2026-05-24 23:50:22.338961-03	1
c9a7b418-1564-4f5e-b04f-4f8b8373574e	888a2e27d9a7b941b1b32977ae7df49e353fd28b549cfef902108d5dc076dd4f	2026-05-24 23:50:22.449865-03	20260519134442_add_admin_role	\N	\N	2026-05-24 23:50:22.446991-03	1
4f203384-0608-480d-a935-f874054a4f78	76d00781b6b7d82295914d2a37ab27ab3b8e257340f2a8edec688314291b3ac6	2026-05-24 23:50:22.486142-03	20260519165843_diagnosis_recommendations	\N	\N	2026-05-24 23:50:22.451374-03	1
44255aa9-63a6-4f01-bad0-240a38a9548b	989fdcb4a9ab3cbe9bfa6bbbe019f7de256ef692d0c1f2cef3bcd8136cd53445	2026-05-24 23:50:22.498554-03	20260519182444_fix_schema	\N	\N	2026-05-24 23:50:22.487409-03	1
f618ee08-e0f1-43cb-875b-fe00cc824d49	36bb5fe0df167144bcb3cf9fa1f04ffa4f049f96bc0b8ee489a3ad1b3cbecc31	2026-05-24 23:50:22.50177-03	20260524000000_add_user_last_login_at	\N	\N	2026-05-24 23:50:22.499653-03	1
99c3eaad-54ae-456d-aa02-d9d42d391ee9	7372d75d9602223b895979cada9716e509f0e36a1f4aef5b0166cd91775be080	2026-05-24 23:50:22.538656-03	20260524001000_add_activity_tracking	\N	\N	2026-05-24 23:50:22.502438-03	1
f5f5c12a-100d-4ec7-af49-a799ccff1927	de2d038e198712a3e8630a016e6b3e6e5fdb883c9c568455597f5d6fd64f031c	2026-05-26 10:53:45.913991-03	20260526135345_add_lesson_progress_and_resource_consumption	\N	\N	2026-05-26 10:53:45.676101-03	1
\.


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Diagnosis Diagnosis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Diagnosis"
    ADD CONSTRAINT "Diagnosis_pkey" PRIMARY KEY (id);


--
-- Name: Diary Diary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Diary"
    ADD CONSTRAINT "Diary_pkey" PRIMARY KEY (id);


--
-- Name: LearningPath LearningPath_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LearningPath"
    ADD CONSTRAINT "LearningPath_pkey" PRIMARY KEY (id);


--
-- Name: LessonPlan LessonPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonPlan"
    ADD CONSTRAINT "LessonPlan_pkey" PRIMARY KEY (id);


--
-- Name: LessonProgress LessonProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_pkey" PRIMARY KEY (id);


--
-- Name: LoginEvent LoginEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LoginEvent"
    ADD CONSTRAINT "LoginEvent_pkey" PRIMARY KEY (id);


--
-- Name: Recommendation Recommendation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recommendation"
    ADD CONSTRAINT "Recommendation_pkey" PRIMARY KEY (id);


--
-- Name: ResourceConsumption ResourceConsumption_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceConsumption"
    ADD CONSTRAINT "ResourceConsumption_pkey" PRIMARY KEY (id);


--
-- Name: ResourceDownload ResourceDownload_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceDownload"
    ADD CONSTRAINT "ResourceDownload_pkey" PRIMARY KEY (id);


--
-- Name: ResourceTag ResourceTag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceTag"
    ADD CONSTRAINT "ResourceTag_pkey" PRIMARY KEY ("resourceId", "tagId");


--
-- Name: Resource Resource_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Resource"
    ADD CONSTRAINT "Resource_pkey" PRIMARY KEY (id);


--
-- Name: Step Step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Step"
    ADD CONSTRAINT "Step_pkey" PRIMARY KEY (id);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (id);


--
-- Name: UserProgress UserProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProgress"
    ADD CONSTRAINT "UserProgress_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Diagnosis_result_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Diagnosis_result_idx" ON public."Diagnosis" USING btree (result);


--
-- Name: Diagnosis_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Diagnosis_userId_idx" ON public."Diagnosis" USING btree ("userId");


--
-- Name: Diary_lessonPlanId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Diary_lessonPlanId_key" ON public."Diary" USING btree ("lessonPlanId");


--
-- Name: Diary_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Diary_userId_idx" ON public."Diary" USING btree ("userId");


--
-- Name: LearningPath_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LearningPath_createdById_idx" ON public."LearningPath" USING btree ("createdById");


--
-- Name: LessonPlan_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LessonPlan_userId_idx" ON public."LessonPlan" USING btree ("userId");


--
-- Name: LessonProgress_stepId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LessonProgress_stepId_idx" ON public."LessonProgress" USING btree ("stepId");


--
-- Name: LessonProgress_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LessonProgress_userId_idx" ON public."LessonProgress" USING btree ("userId");


--
-- Name: LessonProgress_userId_stepId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "LessonProgress_userId_stepId_key" ON public."LessonProgress" USING btree ("userId", "stepId");


--
-- Name: LoginEvent_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LoginEvent_createdAt_idx" ON public."LoginEvent" USING btree ("createdAt");


--
-- Name: LoginEvent_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LoginEvent_userId_idx" ON public."LoginEvent" USING btree ("userId");


--
-- Name: Recommendation_diagnosisId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Recommendation_diagnosisId_idx" ON public."Recommendation" USING btree ("diagnosisId");


--
-- Name: ResourceConsumption_resourceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceConsumption_resourceId_idx" ON public."ResourceConsumption" USING btree ("resourceId");


--
-- Name: ResourceConsumption_stepId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceConsumption_stepId_idx" ON public."ResourceConsumption" USING btree ("stepId");


--
-- Name: ResourceConsumption_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceConsumption_userId_idx" ON public."ResourceConsumption" USING btree ("userId");


--
-- Name: ResourceConsumption_userId_resourceId_stepId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ResourceConsumption_userId_resourceId_stepId_key" ON public."ResourceConsumption" USING btree ("userId", "resourceId", "stepId");


--
-- Name: ResourceDownload_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceDownload_createdAt_idx" ON public."ResourceDownload" USING btree ("createdAt");


--
-- Name: ResourceDownload_resourceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceDownload_resourceId_idx" ON public."ResourceDownload" USING btree ("resourceId");


--
-- Name: ResourceDownload_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceDownload_userId_idx" ON public."ResourceDownload" USING btree ("userId");


--
-- Name: Resource_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resource_categoryId_idx" ON public."Resource" USING btree ("categoryId");


--
-- Name: Resource_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resource_createdById_idx" ON public."Resource" USING btree ("createdById");


--
-- Name: Resource_stepId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resource_stepId_idx" ON public."Resource" USING btree ("stepId");


--
-- Name: Step_learningPathId_position_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Step_learningPathId_position_key" ON public."Step" USING btree ("learningPathId", "position");


--
-- Name: Tag_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Tag_name_key" ON public."Tag" USING btree (name);


--
-- Name: UserProgress_stepId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "UserProgress_stepId_idx" ON public."UserProgress" USING btree ("stepId");


--
-- Name: UserProgress_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "UserProgress_userId_idx" ON public."UserProgress" USING btree ("userId");


--
-- Name: UserProgress_userId_stepId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserProgress_userId_stepId_key" ON public."UserProgress" USING btree ("userId", "stepId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Diagnosis Diagnosis_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Diagnosis"
    ADD CONSTRAINT "Diagnosis_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Diary Diary_lessonPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Diary"
    ADD CONSTRAINT "Diary_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES public."LessonPlan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Diary Diary_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Diary"
    ADD CONSTRAINT "Diary_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LearningPath LearningPath_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LearningPath"
    ADD CONSTRAINT "LearningPath_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LessonPlan LessonPlan_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonPlan"
    ADD CONSTRAINT "LessonPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LessonProgress LessonProgress_stepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES public."Step"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LessonProgress LessonProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LoginEvent LoginEvent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LoginEvent"
    ADD CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Recommendation Recommendation_diagnosisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recommendation"
    ADD CONSTRAINT "Recommendation_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES public."Diagnosis"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Recommendation Recommendation_learningPathId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recommendation"
    ADD CONSTRAINT "Recommendation_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES public."LearningPath"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Recommendation Recommendation_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recommendation"
    ADD CONSTRAINT "Recommendation_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public."Resource"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ResourceConsumption ResourceConsumption_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceConsumption"
    ADD CONSTRAINT "ResourceConsumption_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public."Resource"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ResourceConsumption ResourceConsumption_stepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceConsumption"
    ADD CONSTRAINT "ResourceConsumption_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES public."Step"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ResourceConsumption ResourceConsumption_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceConsumption"
    ADD CONSTRAINT "ResourceConsumption_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ResourceDownload ResourceDownload_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceDownload"
    ADD CONSTRAINT "ResourceDownload_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public."Resource"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ResourceDownload ResourceDownload_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceDownload"
    ADD CONSTRAINT "ResourceDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ResourceTag ResourceTag_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceTag"
    ADD CONSTRAINT "ResourceTag_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public."Resource"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ResourceTag ResourceTag_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceTag"
    ADD CONSTRAINT "ResourceTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Resource Resource_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Resource"
    ADD CONSTRAINT "Resource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Resource Resource_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Resource"
    ADD CONSTRAINT "Resource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Resource Resource_stepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Resource"
    ADD CONSTRAINT "Resource_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES public."Step"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Step Step_learningPathId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Step"
    ADD CONSTRAINT "Step_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES public."LearningPath"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserProgress UserProgress_stepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProgress"
    ADD CONSTRAINT "UserProgress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES public."Step"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserProgress UserProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProgress"
    ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 7fm0SH4Sc7rweyjTKIXEedxdL4bFrh3Dhcld5IQ1BKCJRuWVNqWejjaMInpSS8t


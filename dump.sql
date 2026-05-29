--
-- PostgreSQL database dump
--

-- Dumped from database version 10.23
-- Dumped by pg_dump version 10.23

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

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: asal_barang; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.asal_barang (
    id bigint NOT NULL,
    nama character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.asal_barang OWNER TO intiwij1_inventaris;

--
-- Name: asal_barang_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.asal_barang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.asal_barang_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: asal_barang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.asal_barang_id_seq OWNED BY public.asal_barang.id;


--
-- Name: barang; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.barang (
    id bigint NOT NULL,
    jenis_barang_id bigint NOT NULL,
    asal_id bigint,
    lokasi_id bigint,
    serial_number character varying(255) NOT NULL,
    kondisi_awal character varying(255) DEFAULT 'baru'::character varying NOT NULL,
    status character varying(255) DEFAULT 'baik'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    model_id bigint NOT NULL,
    rak_id bigint,
    sub_lokasi_id bigint,
    pic character varying(255),
    catatan text,
    CONSTRAINT barang_kondisi_awal_check CHECK (((kondisi_awal)::text = ANY (ARRAY[('baru'::character varying)::text, ('second'::character varying)::text]))),
    CONSTRAINT barang_status_check CHECK (((status)::text = ANY (ARRAY[('baik'::character varying)::text, ('bagus'::character varying)::text, ('rusak'::character varying)::text, ('diperbaiki'::character varying)::text, ('dipinjamkan'::character varying)::text, ('dijual'::character varying)::text, ('dimusnahkan'::character varying)::text, ('menunggu'::character varying)::text])))
);


ALTER TABLE public.barang OWNER TO intiwij1_inventaris;

--
-- Name: barang_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.barang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.barang_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: barang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.barang_id_seq OWNED BY public.barang.id;


--
-- Name: barang_keluar; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.barang_keluar (
    id bigint NOT NULL,
    tanggal date NOT NULL,
    lokasi_id bigint NOT NULL,
    user_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.barang_keluar OWNER TO intiwij1_inventaris;

--
-- Name: barang_keluar_detail; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.barang_keluar_detail (
    id bigint NOT NULL,
    barang_keluar_id bigint NOT NULL,
    barang_id bigint NOT NULL,
    status_keluar character varying(255) DEFAULT 'dipinjamkan'::character varying NOT NULL,
    sub_lokasi_id bigint,
    pic character varying(255),
    CONSTRAINT barang_keluar_detail_status_keluar_check CHECK (((status_keluar)::text = ANY (ARRAY[('dipinjamkan'::character varying)::text, ('dijual'::character varying)::text])))
);


ALTER TABLE public.barang_keluar_detail OWNER TO intiwij1_inventaris;

--
-- Name: barang_keluar_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.barang_keluar_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.barang_keluar_detail_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: barang_keluar_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.barang_keluar_detail_id_seq OWNED BY public.barang_keluar_detail.id;


--
-- Name: barang_keluar_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.barang_keluar_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.barang_keluar_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: barang_keluar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.barang_keluar_id_seq OWNED BY public.barang_keluar.id;


--
-- Name: barang_kembali; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.barang_kembali (
    id bigint NOT NULL,
    tanggal date NOT NULL,
    lokasi_id bigint NOT NULL,
    user_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.barang_kembali OWNER TO intiwij1_inventaris;

--
-- Name: barang_kembali_detail; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.barang_kembali_detail (
    id bigint NOT NULL,
    barang_kembali_id bigint NOT NULL,
    barang_id bigint NOT NULL,
    kondisi character varying(255) DEFAULT 'bagus'::character varying NOT NULL,
    status_saat_kembali character varying(255),
    kondisi_awal_saat_kembali character varying(255),
    CONSTRAINT barang_kembali_detail_kondisi_check CHECK (((kondisi)::text = ANY (ARRAY[('bagus'::character varying)::text, ('rusak'::character varying)::text, ('diperbaiki'::character varying)::text])))
);


ALTER TABLE public.barang_kembali_detail OWNER TO intiwij1_inventaris;

--
-- Name: barang_kembali_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.barang_kembali_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.barang_kembali_detail_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: barang_kembali_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.barang_kembali_detail_id_seq OWNED BY public.barang_kembali_detail.id;


--
-- Name: barang_kembali_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.barang_kembali_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.barang_kembali_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: barang_kembali_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.barang_kembali_id_seq OWNED BY public.barang_kembali.id;


--
-- Name: barang_masuk; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.barang_masuk (
    id bigint NOT NULL,
    tanggal date NOT NULL,
    asal_barang_id bigint,
    user_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.barang_masuk OWNER TO intiwij1_inventaris;

--
-- Name: barang_masuk_detail; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.barang_masuk_detail (
    id bigint NOT NULL,
    barang_masuk_id bigint NOT NULL,
    barang_id bigint NOT NULL
);


ALTER TABLE public.barang_masuk_detail OWNER TO intiwij1_inventaris;

--
-- Name: barang_masuk_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.barang_masuk_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.barang_masuk_detail_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: barang_masuk_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.barang_masuk_detail_id_seq OWNED BY public.barang_masuk_detail.id;


--
-- Name: barang_masuk_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.barang_masuk_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.barang_masuk_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: barang_masuk_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.barang_masuk_id_seq OWNED BY public.barang_masuk.id;


--
-- Name: barang_pemusnahan; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.barang_pemusnahan (
    id bigint NOT NULL,
    pemusnahan_id bigint NOT NULL,
    barang_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.barang_pemusnahan OWNER TO intiwij1_inventaris;

--
-- Name: barang_pemusnahan_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.barang_pemusnahan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.barang_pemusnahan_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: barang_pemusnahan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.barang_pemusnahan_id_seq OWNED BY public.barang_pemusnahan.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO intiwij1_inventaris;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO intiwij1_inventaris;

--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO intiwij1_inventaris;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.failed_jobs_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: jenis_barang; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.jenis_barang (
    id bigint NOT NULL,
    nama character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    kategori_id bigint
);


ALTER TABLE public.jenis_barang OWNER TO intiwij1_inventaris;

--
-- Name: jenis_barang_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.jenis_barang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jenis_barang_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: jenis_barang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.jenis_barang_id_seq OWNED BY public.jenis_barang.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO intiwij1_inventaris;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO intiwij1_inventaris;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jobs_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: kategori_barang; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.kategori_barang (
    id bigint NOT NULL,
    nama character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.kategori_barang OWNER TO intiwij1_inventaris;

--
-- Name: kategori_barang_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.kategori_barang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.kategori_barang_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: kategori_barang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.kategori_barang_id_seq OWNED BY public.kategori_barang.id;


--
-- Name: lokasi; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.lokasi (
    id bigint NOT NULL,
    nama character varying(255) NOT NULL,
    alamat text,
    is_gudang boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.lokasi OWNER TO intiwij1_inventaris;

--
-- Name: lokasi_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.lokasi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lokasi_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: lokasi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.lokasi_id_seq OWNED BY public.lokasi.id;


--
-- Name: merek_barang; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.merek_barang (
    id bigint NOT NULL,
    nama character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.merek_barang OWNER TO intiwij1_inventaris;

--
-- Name: merek_barang_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.merek_barang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.merek_barang_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: merek_barang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.merek_barang_id_seq OWNED BY public.merek_barang.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO intiwij1_inventaris;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: model_barang; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.model_barang (
    id bigint NOT NULL,
    kategori_id bigint NOT NULL,
    merek_id bigint NOT NULL,
    nama character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    jenis_id bigint,
    deskripsi character varying(255),
    label character varying(255)
);


ALTER TABLE public.model_barang OWNER TO intiwij1_inventaris;

--
-- Name: model_barang_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.model_barang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.model_barang_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: model_barang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.model_barang_id_seq OWNED BY public.model_barang.id;


--
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_permissions OWNER TO intiwij1_inventaris;

--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_roles OWNER TO intiwij1_inventaris;

--
-- Name: mutasi_barang; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.mutasi_barang (
    id bigint NOT NULL,
    barang_id bigint NOT NULL,
    lokasi_asal_id bigint,
    lokasi_tujuan_id bigint,
    user_id bigint,
    tanggal date NOT NULL,
    keterangan character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.mutasi_barang OWNER TO intiwij1_inventaris;

--
-- Name: mutasi_barang_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.mutasi_barang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mutasi_barang_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: mutasi_barang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.mutasi_barang_id_seq OWNED BY public.mutasi_barang.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO intiwij1_inventaris;

--
-- Name: pemusnahan; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.pemusnahan (
    id bigint NOT NULL,
    kode_pemusnahaan character varying(255) NOT NULL,
    user_id bigint NOT NULL,
    tanggal_pemusnahaan date,
    alasan text,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    approved_by bigint,
    dokumen_bukti character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT pemusnahan_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('approved'::character varying)::text, ('rejected'::character varying)::text])))
);


ALTER TABLE public.pemusnahan OWNER TO intiwij1_inventaris;

--
-- Name: pemusnahan_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.pemusnahan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pemusnahan_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: pemusnahan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.pemusnahan_id_seq OWNED BY public.pemusnahan.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    is_system boolean DEFAULT false NOT NULL
);


ALTER TABLE public.permissions OWNER TO intiwij1_inventaris;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: rak_barang; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.rak_barang (
    id bigint NOT NULL,
    lokasi_id bigint NOT NULL,
    nama_rak character varying(255) NOT NULL,
    baris character varying(255),
    kode_rak character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.rak_barang OWNER TO intiwij1_inventaris;

--
-- Name: rak_barang_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.rak_barang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rak_barang_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: rak_barang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.rak_barang_id_seq OWNED BY public.rak_barang.id;


--
-- Name: rekap_stok_barang; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.rekap_stok_barang (
    id bigint NOT NULL,
    lokasi_id bigint NOT NULL,
    jumlah_total integer DEFAULT 0 NOT NULL,
    jumlah_tersedia integer DEFAULT 0 NOT NULL,
    jumlah_rusak integer DEFAULT 0 NOT NULL,
    jumlah_perbaikan integer DEFAULT 0 NOT NULL,
    jumlah_terdistribusi integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    model_id bigint NOT NULL,
    jumlah_terjual integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.rekap_stok_barang OWNER TO intiwij1_inventaris;

--
-- Name: rekap_stok_barang_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.rekap_stok_barang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rekap_stok_barang_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: rekap_stok_barang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.rekap_stok_barang_id_seq OWNED BY public.rekap_stok_barang.id;


--
-- Name: riwayat_status_barang; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.riwayat_status_barang (
    id bigint NOT NULL,
    barang_id bigint NOT NULL,
    user_id bigint,
    tanggal date NOT NULL,
    status character varying(255) NOT NULL,
    catatan character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT riwayat_status_barang_status_check CHECK (((status)::text = ANY (ARRAY[('baik'::character varying)::text, ('rusak'::character varying)::text, ('diperbaiki'::character varying)::text])))
);


ALTER TABLE public.riwayat_status_barang OWNER TO intiwij1_inventaris;

--
-- Name: riwayat_status_barang_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.riwayat_status_barang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.riwayat_status_barang_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: riwayat_status_barang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.riwayat_status_barang_id_seq OWNED BY public.riwayat_status_barang.id;


--
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.role_has_permissions OWNER TO intiwij1_inventaris;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.roles OWNER TO intiwij1_inventaris;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO intiwij1_inventaris;

--
-- Name: stock_opname; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.stock_opname (
    id bigint NOT NULL,
    tanggal date NOT NULL,
    lokasi_id bigint NOT NULL,
    user_id bigint,
    catatan character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    approved_by bigint,
    approved_at timestamp(0) without time zone
);


ALTER TABLE public.stock_opname OWNER TO intiwij1_inventaris;

--
-- Name: stock_opname_detail; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.stock_opname_detail (
    id bigint NOT NULL,
    stock_opname_id bigint NOT NULL,
    model_id bigint NOT NULL,
    jumlah_sistem integer NOT NULL,
    jumlah_fisik integer NOT NULL,
    selisih integer NOT NULL,
    catatan character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    serial_hilang json,
    serial_baru json
);


ALTER TABLE public.stock_opname_detail OWNER TO intiwij1_inventaris;

--
-- Name: stock_opname_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.stock_opname_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_opname_detail_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: stock_opname_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.stock_opname_detail_id_seq OWNED BY public.stock_opname_detail.id;


--
-- Name: stock_opname_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.stock_opname_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_opname_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: stock_opname_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.stock_opname_id_seq OWNED BY public.stock_opname.id;


--
-- Name: sub_lokasi; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.sub_lokasi (
    id bigint NOT NULL,
    lokasi_id bigint NOT NULL,
    nama character varying(255) NOT NULL,
    kode character varying(255),
    lantai character varying(255),
    keterangan text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.sub_lokasi OWNER TO intiwij1_inventaris;

--
-- Name: sub_lokasi_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.sub_lokasi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sub_lokasi_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: sub_lokasi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.sub_lokasi_id_seq OWNED BY public.sub_lokasi.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: intiwij1_inventaris
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.users OWNER TO intiwij1_inventaris;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: intiwij1_inventaris
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO intiwij1_inventaris;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: intiwij1_inventaris
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: view_barang_keluar; Type: VIEW; Schema: public; Owner: intiwij1_inventaris
--

CREATE VIEW public.view_barang_keluar AS
 SELECT bk.id AS transaksi_id,
    bk.tanggal,
    l.nama AS lokasi_tujuan,
    l.id AS lokasi_id,
    u.name AS nama_user,
    b.serial_number,
    mb.nama AS model,
    mb.nama AS merek,
    kb.nama AS kategori,
    kb.id AS kategori_id,
    bkd.status_keluar,
    bkd.id AS detail_id
   FROM ((((((public.barang_keluar bk
     JOIN public.barang_keluar_detail bkd ON ((bkd.barang_keluar_id = bk.id)))
     JOIN public.barang b ON ((b.id = bkd.barang_id)))
     JOIN public.model_barang mb ON ((mb.id = b.model_id)))
     JOIN public.kategori_barang kb ON ((kb.id = mb.kategori_id)))
     JOIN public.lokasi l ON ((l.id = bk.lokasi_id)))
     LEFT JOIN public.users u ON ((u.id = bk.user_id)));


ALTER TABLE public.view_barang_keluar OWNER TO intiwij1_inventaris;

--
-- Name: view_barang_kembali; Type: VIEW; Schema: public; Owner: intiwij1_inventaris
--

CREATE VIEW public.view_barang_kembali AS
 SELECT bk.id AS transaksi_id,
    bk.tanggal,
    l.nama AS lokasi_nama,
    l.id AS lokasi_id,
    u.name AS nama_user,
    b.serial_number,
    mb.nama AS model,
    mk.nama AS merek,
    kb.nama AS kategori,
    kb.id AS kategori_id,
    jb.nama AS jenis,
    bkd.kondisi,
    bkd.status_saat_kembali,
    bkd.kondisi_awal_saat_kembali,
    bkd.id AS detail_id
   FROM ((((((((public.barang_kembali bk
     JOIN public.barang_kembali_detail bkd ON ((bkd.barang_kembali_id = bk.id)))
     JOIN public.barang b ON ((b.id = bkd.barang_id)))
     JOIN public.model_barang mb ON ((mb.id = b.model_id)))
     JOIN public.kategori_barang kb ON ((kb.id = mb.kategori_id)))
     JOIN public.merek_barang mk ON ((mk.id = mb.merek_id)))
     LEFT JOIN public.jenis_barang jb ON ((jb.id = mb.jenis_id)))
     JOIN public.lokasi l ON ((l.id = bk.lokasi_id)))
     LEFT JOIN public.users u ON ((u.id = bk.user_id)));


ALTER TABLE public.view_barang_kembali OWNER TO intiwij1_inventaris;

--
-- Name: view_barang_masuk; Type: VIEW; Schema: public; Owner: intiwij1_inventaris
--

CREATE VIEW public.view_barang_masuk AS
 SELECT bm.id AS transaksi_id,
    bm.tanggal,
    ab.nama AS asal_barang,
    u.name AS nama_user,
    b.serial_number,
    mb.nama AS model,
    mk.nama AS merek,
    k.nama AS kategori
   FROM (((((((public.barang_masuk bm
     JOIN public.barang_masuk_detail bmd ON ((bm.id = bmd.barang_masuk_id)))
     JOIN public.barang b ON ((b.id = bmd.barang_id)))
     JOIN public.model_barang mb ON ((b.model_id = mb.id)))
     JOIN public.merek_barang mk ON ((mb.merek_id = mk.id)))
     JOIN public.kategori_barang k ON ((mb.kategori_id = k.id)))
     LEFT JOIN public.users u ON ((bm.user_id = u.id)))
     LEFT JOIN public.asal_barang ab ON ((bm.asal_barang_id = ab.id)));


ALTER TABLE public.view_barang_masuk OWNER TO intiwij1_inventaris;

--
-- Name: view_laporan_stok; Type: VIEW; Schema: public; Owner: intiwij1_inventaris
--

CREATE VIEW public.view_laporan_stok AS
 SELECT rsb.id AS rekap_id,
    m.nama AS model,
    mk.nama AS merek,
    k.nama AS kategori,
    l.nama AS lokasi,
    rsb.jumlah_total,
    rsb.jumlah_tersedia,
    rsb.jumlah_rusak,
    rsb.jumlah_perbaikan,
    rsb.jumlah_terdistribusi
   FROM ((((public.rekap_stok_barang rsb
     JOIN public.model_barang m ON ((rsb.model_id = m.id)))
     JOIN public.merek_barang mk ON ((m.merek_id = mk.id)))
     JOIN public.kategori_barang k ON ((m.kategori_id = k.id)))
     JOIN public.lokasi l ON ((rsb.lokasi_id = l.id)));


ALTER TABLE public.view_laporan_stok OWNER TO intiwij1_inventaris;

--
-- Name: view_mutasi_barang; Type: VIEW; Schema: public; Owner: intiwij1_inventaris
--

CREATE VIEW public.view_mutasi_barang AS
 SELECT mb.id AS mutasi_id,
    b.serial_number,
    mdl.nama AS model,
    mk.nama AS merek,
    k.nama AS kategori,
    lo.nama AS lokasi_asal,
    lt.nama AS lokasi_tujuan,
    u.name AS nama_user,
    mb.tanggal,
    mb.keterangan
   FROM (((((((public.mutasi_barang mb
     JOIN public.barang b ON ((b.id = mb.barang_id)))
     JOIN public.model_barang mdl ON ((b.model_id = mdl.id)))
     JOIN public.merek_barang mk ON ((mdl.merek_id = mk.id)))
     JOIN public.kategori_barang k ON ((mdl.kategori_id = k.id)))
     LEFT JOIN public.lokasi lo ON ((mb.lokasi_asal_id = lo.id)))
     LEFT JOIN public.lokasi lt ON ((mb.lokasi_tujuan_id = lt.id)))
     LEFT JOIN public.users u ON ((mb.user_id = u.id)));


ALTER TABLE public.view_mutasi_barang OWNER TO intiwij1_inventaris;

--
-- Name: view_riwayat_status_barang; Type: VIEW; Schema: public; Owner: intiwij1_inventaris
--

CREATE VIEW public.view_riwayat_status_barang AS
 SELECT rsb.id,
    b.serial_number,
    mb.nama AS model,
    mk.nama AS merek,
    k.nama AS kategori,
    rsb.status,
    rsb.tanggal,
    rsb.catatan,
    u.name AS nama_user
   FROM (((((public.riwayat_status_barang rsb
     JOIN public.barang b ON ((b.id = rsb.barang_id)))
     JOIN public.model_barang mb ON ((b.model_id = mb.id)))
     JOIN public.merek_barang mk ON ((mb.merek_id = mk.id)))
     JOIN public.kategori_barang k ON ((mb.kategori_id = k.id)))
     LEFT JOIN public.users u ON ((rsb.user_id = u.id)));


ALTER TABLE public.view_riwayat_status_barang OWNER TO intiwij1_inventaris;

--
-- Name: asal_barang id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.asal_barang ALTER COLUMN id SET DEFAULT nextval('public.asal_barang_id_seq'::regclass);


--
-- Name: barang id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang ALTER COLUMN id SET DEFAULT nextval('public.barang_id_seq'::regclass);


--
-- Name: barang_keluar id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_keluar ALTER COLUMN id SET DEFAULT nextval('public.barang_keluar_id_seq'::regclass);


--
-- Name: barang_keluar_detail id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_keluar_detail ALTER COLUMN id SET DEFAULT nextval('public.barang_keluar_detail_id_seq'::regclass);


--
-- Name: barang_kembali id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_kembali ALTER COLUMN id SET DEFAULT nextval('public.barang_kembali_id_seq'::regclass);


--
-- Name: barang_kembali_detail id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_kembali_detail ALTER COLUMN id SET DEFAULT nextval('public.barang_kembali_detail_id_seq'::regclass);


--
-- Name: barang_masuk id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_masuk ALTER COLUMN id SET DEFAULT nextval('public.barang_masuk_id_seq'::regclass);


--
-- Name: barang_masuk_detail id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_masuk_detail ALTER COLUMN id SET DEFAULT nextval('public.barang_masuk_detail_id_seq'::regclass);


--
-- Name: barang_pemusnahan id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_pemusnahan ALTER COLUMN id SET DEFAULT nextval('public.barang_pemusnahan_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jenis_barang id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.jenis_barang ALTER COLUMN id SET DEFAULT nextval('public.jenis_barang_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: kategori_barang id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.kategori_barang ALTER COLUMN id SET DEFAULT nextval('public.kategori_barang_id_seq'::regclass);


--
-- Name: lokasi id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.lokasi ALTER COLUMN id SET DEFAULT nextval('public.lokasi_id_seq'::regclass);


--
-- Name: merek_barang id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.merek_barang ALTER COLUMN id SET DEFAULT nextval('public.merek_barang_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: model_barang id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.model_barang ALTER COLUMN id SET DEFAULT nextval('public.model_barang_id_seq'::regclass);


--
-- Name: mutasi_barang id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.mutasi_barang ALTER COLUMN id SET DEFAULT nextval('public.mutasi_barang_id_seq'::regclass);


--
-- Name: pemusnahan id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.pemusnahan ALTER COLUMN id SET DEFAULT nextval('public.pemusnahan_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: rak_barang id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.rak_barang ALTER COLUMN id SET DEFAULT nextval('public.rak_barang_id_seq'::regclass);


--
-- Name: rekap_stok_barang id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.rekap_stok_barang ALTER COLUMN id SET DEFAULT nextval('public.rekap_stok_barang_id_seq'::regclass);


--
-- Name: riwayat_status_barang id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.riwayat_status_barang ALTER COLUMN id SET DEFAULT nextval('public.riwayat_status_barang_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: stock_opname id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.stock_opname ALTER COLUMN id SET DEFAULT nextval('public.stock_opname_id_seq'::regclass);


--
-- Name: stock_opname_detail id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.stock_opname_detail ALTER COLUMN id SET DEFAULT nextval('public.stock_opname_detail_id_seq'::regclass);


--
-- Name: sub_lokasi id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.sub_lokasi ALTER COLUMN id SET DEFAULT nextval('public.sub_lokasi_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: asal_barang; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.asal_barang VALUES (2, 'SUKMA', '2025-08-06 08:27:50', '2025-08-06 08:27:50');
INSERT INTO public.asal_barang VALUES (1, 'ONLINE', '2025-08-06 08:27:35', '2026-02-05 01:53:31');
INSERT INTO public.asal_barang VALUES (3, 'BINTANG TEKNOLOGI', '2026-05-05 08:53:22', '2026-05-05 08:53:22');


--
-- Data for Name: barang; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.barang VALUES (159, 1, 3, 9, '19J184120030', 'baru', 'dipinjamkan', '2026-05-06 03:19:49', '2026-05-06 03:20:53', 1, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (160, 1, 3, 9, '19J202346227', 'baru', 'dipinjamkan', '2026-05-06 03:19:49', '2026-05-06 03:20:53', 1, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (161, 1, 3, 9, 'D5J224612797', 'baru', 'dipinjamkan', '2026-05-06 03:19:49', '2026-05-06 03:21:32', 2, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (162, 1, 3, 9, 'D5J224611661', 'baru', 'dipinjamkan', '2026-05-06 03:19:49', '2026-05-06 03:21:32', 2, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (87, 3, 1, 7, 'B5281137', 'baru', 'dipinjamkan', '2026-05-05 08:22:54', '2026-05-05 08:28:27', 6, NULL, NULL, 'Bpk Aidil', NULL);
INSERT INTO public.barang VALUES (88, 1, 1, 7, '19J182102546', 'baru', 'dipinjamkan', '2026-05-05 08:22:54', '2026-05-05 08:28:27', 1, NULL, NULL, 'Bpk Aidil', NULL);
INSERT INTO public.barang VALUES (89, 1, 1, 7, '19J182303024', 'baru', 'dipinjamkan', '2026-05-05 08:22:54', '2026-05-05 08:28:27', 1, NULL, NULL, 'Bpk Aidil', NULL);
INSERT INTO public.barang VALUES (90, 1, 1, 7, '19J182101070', 'baru', 'dipinjamkan', '2026-05-05 08:22:54', '2026-05-05 08:28:27', 1, NULL, NULL, 'Bpk Aidil', NULL);
INSERT INTO public.barang VALUES (91, 1, 1, 7, '19J182400145', 'baru', 'dipinjamkan', '2026-05-05 08:22:54', '2026-05-05 08:28:27', 1, NULL, NULL, 'Bpk Aidil', NULL);
INSERT INTO public.barang VALUES (92, 1, 1, 7, '19J182303311', 'baru', 'dipinjamkan', '2026-05-05 08:22:54', '2026-05-05 08:28:27', 1, NULL, NULL, 'Bpk Aidil', NULL);
INSERT INTO public.barang VALUES (93, 1, 1, 7, '19J184801499', 'baru', 'dipinjamkan', '2026-05-05 08:22:54', '2026-05-05 08:37:30', 1, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (94, 1, 1, 7, '19J192100146', 'baru', 'dipinjamkan', '2026-05-05 08:22:54', '2026-05-05 08:38:14', 1, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (95, 1, 1, 7, '54J174401203', 'baru', 'dipinjamkan', '2026-05-05 08:22:54', '2026-05-05 08:39:28', 5, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (96, 1, 1, 7, '11J155201860', 'baru', 'dipinjamkan', '2026-05-05 08:22:54', '2026-05-05 08:39:28', 4, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (97, 1, 1, 7, 'D5J224614367', 'baru', 'dipinjamkan', '2026-05-05 08:22:54', '2026-05-05 08:40:12', 2, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (110, 1, 3, 3, '11J142200381', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-05 09:19:22', 4, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (111, 1, 3, 3, '11J200210127', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-05 09:19:22', 4, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (112, 1, 3, 3, '11J200246012', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-05 09:19:58', 4, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (100, 1, 3, 3, '11J142200351', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-05 09:20:46', 4, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (108, 1, 3, 3, '11J200210126', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-05 09:20:46', 4, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (179, 3, 3, 11, 'B5501236', 'baru', 'dipinjamkan', '2026-05-06 03:52:52', '2026-05-06 03:53:43', 6, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (180, 1, 3, 11, '19J184110032', 'baru', 'dipinjamkan', '2026-05-06 03:52:52', '2026-05-06 03:54:21', 1, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (181, 1, 3, 11, '54J164701028', 'baru', 'dipinjamkan', '2026-05-06 03:52:52', '2026-05-06 03:54:54', 5, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (185, 1, 3, 13, 'D5J224613058', 'baru', 'dipinjamkan', '2026-05-06 03:59:28', '2026-05-06 04:00:31', 2, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (98, 1, 3, 3, '11J135200210', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-06 05:49:33', 4, NULL, 2, NULL, NULL);
INSERT INTO public.barang VALUES (99, 1, 3, 3, '11J143600592', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-06 05:49:33', 4, NULL, 2, NULL, NULL);
INSERT INTO public.barang VALUES (103, 1, 3, 3, '11J141900429', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-06 08:01:18', 4, NULL, 5, NULL, NULL);
INSERT INTO public.barang VALUES (104, 1, 3, 3, '11J200210603', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-06 08:01:52', 4, NULL, 6, NULL, NULL);
INSERT INTO public.barang VALUES (105, 1, 3, 3, '11J200210120', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-06 08:02:22', 4, NULL, 3, NULL, NULL);
INSERT INTO public.barang VALUES (106, 1, 3, 3, '11J200210597', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-06 08:02:56', 4, NULL, 2, NULL, NULL);
INSERT INTO public.barang VALUES (107, 1, 3, 3, '11J200210122', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-06 08:03:26', 4, NULL, 7, NULL, NULL);
INSERT INTO public.barang VALUES (109, 1, 3, 3, '11J200246008', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-06 08:03:56', 4, NULL, 4, NULL, NULL);
INSERT INTO public.barang VALUES (114, 1, 3, 1, '19J190301583', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:09:06', 1, NULL, 8, NULL, NULL);
INSERT INTO public.barang VALUES (115, 1, 3, 1, '19J190300224', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:09:06', 1, NULL, 8, NULL, NULL);
INSERT INTO public.barang VALUES (116, 1, 3, 1, '19J190301143', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:09:06', 1, NULL, 8, NULL, NULL);
INSERT INTO public.barang VALUES (120, 1, 3, 1, '19J193603780', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:11:42', 1, NULL, 20, NULL, NULL);
INSERT INTO public.barang VALUES (125, 1, 3, 1, '19J184115062', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:12:44', 1, NULL, 12, NULL, NULL);
INSERT INTO public.barang VALUES (126, 1, 3, 1, '19J184109096', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:13:14', 1, NULL, 12, NULL, NULL);
INSERT INTO public.barang VALUES (164, 1, 3, 4, '54J173403236', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:01:36', 5, NULL, 22, NULL, NULL);
INSERT INTO public.barang VALUES (165, 1, 3, 4, '54J173403312', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:01:36', 5, NULL, 22, NULL, NULL);
INSERT INTO public.barang VALUES (166, 1, 3, 4, '54J173403218', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:01:36', 5, NULL, 22, NULL, NULL);
INSERT INTO public.barang VALUES (167, 1, 3, 4, '54J173403323', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:01:36', 5, NULL, 22, NULL, NULL);
INSERT INTO public.barang VALUES (168, 1, 3, 4, '54J173403308', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:01:36', 5, NULL, 23, NULL, NULL);
INSERT INTO public.barang VALUES (169, 1, 3, 4, '19J20229101', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:02:04', 1, NULL, 22, NULL, NULL);
INSERT INTO public.barang VALUES (170, 1, 3, 4, '19J20227045', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:02:04', 1, NULL, 24, NULL, NULL);
INSERT INTO public.barang VALUES (171, 1, 3, 4, '19J190301395', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:02:25', 1, NULL, 21, NULL, NULL);
INSERT INTO public.barang VALUES (173, 3, 3, 4, 'B6430210', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:02:57', 6, NULL, 22, NULL, NULL);
INSERT INTO public.barang VALUES (174, 1, 3, 4, 'D5J224612706', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:03:27', 2, NULL, 21, NULL, NULL);
INSERT INTO public.barang VALUES (175, 1, 3, 4, 'D5J243111687', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:04:13', 2, NULL, 21, NULL, NULL);
INSERT INTO public.barang VALUES (172, 1, 3, 4, '19J184120094', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:05:19', 1, NULL, 22, NULL, NULL);
INSERT INTO public.barang VALUES (176, 1, 3, 4, 'D5J244000811', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:05:50', 2, NULL, 21, NULL, NULL);
INSERT INTO public.barang VALUES (177, 1, 3, 4, 'D5J242408606', 'baru', 'dipinjamkan', '2026-05-06 03:31:58', '2026-05-06 09:05:50', 2, NULL, 21, NULL, NULL);
INSERT INTO public.barang VALUES (113, 1, 3, 6, 'D5J231904053', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-21 01:42:55', 3, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (163, 1, 3, 10, '54J172201345', 'baru', 'dipinjamkan', '2026-05-06 03:24:28', '2026-05-06 03:24:55', 5, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (182, 1, 3, 12, '11J143701062', 'baru', 'dipinjamkan', '2026-05-06 03:56:20', '2026-05-06 03:57:08', 4, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (183, 1, 3, 12, '11J142200366', 'baru', 'dipinjamkan', '2026-05-06 03:56:20', '2026-05-06 03:57:50', 4, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (184, 1, 3, 12, '11J142200604', 'baru', 'dipinjamkan', '2026-05-06 03:56:20', '2026-05-06 03:57:50', 4, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (186, 1, 3, 13, 'D5J224613049', 'baru', 'dipinjamkan', '2026-05-06 03:59:28', '2026-05-06 04:00:31', 2, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (187, 1, 3, 14, 'D5J231904084', 'baru', 'dipinjamkan', '2026-05-06 04:02:04', '2026-05-06 04:03:09', 3, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (188, 1, 3, 14, 'D5J231904081', 'baru', 'dipinjamkan', '2026-05-06 04:02:04', '2026-05-06 04:03:09', 3, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (189, 1, 3, 14, 'D5J231904008', 'baru', 'dipinjamkan', '2026-05-06 04:02:04', '2026-05-06 04:03:09', 3, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (190, 1, 3, 14, 'D5J224612801', 'baru', 'dipinjamkan', '2026-05-06 04:02:04', '2026-05-06 04:03:09', 2, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (101, 1, 3, 3, '11J142200630', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-06 05:49:33', 4, NULL, 3, NULL, NULL);
INSERT INTO public.barang VALUES (102, 1, 3, 3, '11J142200624', 'baru', 'dipinjamkan', '2026-05-05 09:01:28', '2026-05-06 05:49:33', 4, NULL, 3, NULL, NULL);
INSERT INTO public.barang VALUES (117, 1, 3, 1, '19J193603746', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:09:06', 1, NULL, 8, NULL, NULL);
INSERT INTO public.barang VALUES (118, 1, 3, 1, '19J193603726', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:09:06', 1, NULL, 8, NULL, NULL);
INSERT INTO public.barang VALUES (119, 1, 3, 1, '19J192801588', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:09:06', 1, NULL, 9, NULL, NULL);
INSERT INTO public.barang VALUES (121, 1, 3, 1, '19J193603785', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:09:06', 1, NULL, 10, NULL, NULL);
INSERT INTO public.barang VALUES (122, 1, 3, 1, '19J185200020', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:09:06', 1, NULL, 11, NULL, NULL);
INSERT INTO public.barang VALUES (123, 1, 3, 1, '19J193603695', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:09:06', 1, NULL, 1, NULL, NULL);
INSERT INTO public.barang VALUES (124, 1, 3, 1, '19J190301569', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:09:06', 1, NULL, 9, NULL, NULL);
INSERT INTO public.barang VALUES (128, 3, 3, 1, '73F5854', 'baru', 'dipinjamkan', '2026-05-05 09:44:21', '2026-05-06 08:14:20', 7, NULL, 9, NULL, NULL);
INSERT INTO public.barang VALUES (129, 3, 3, 1, '73F5862', 'baru', 'dipinjamkan', '2026-05-05 09:44:21', '2026-05-06 08:14:20', 7, NULL, 9, NULL, NULL);
INSERT INTO public.barang VALUES (130, 1, 3, 1, 'X5ZK119008', 'baru', 'dipinjamkan', '2026-05-05 09:44:21', '2026-05-06 08:15:37', 8, NULL, 9, NULL, NULL);
INSERT INTO public.barang VALUES (131, 1, 3, 1, 'X5ZK118995', 'baru', 'dipinjamkan', '2026-05-05 09:44:21', '2026-05-06 08:15:37', 8, NULL, 9, NULL, NULL);
INSERT INTO public.barang VALUES (132, 1, 3, 1, 'X5ZK118924', 'baru', 'dipinjamkan', '2026-05-05 09:44:21', '2026-05-06 08:18:33', 8, NULL, 9, NULL, NULL);
INSERT INTO public.barang VALUES (133, 1, 3, 1, 'X5ZK118943', 'baru', 'dipinjamkan', '2026-05-05 09:44:21', '2026-05-06 08:18:33', 8, NULL, 9, NULL, NULL);
INSERT INTO public.barang VALUES (127, 1, 3, 1, '19J192501503', 'baru', 'dipinjamkan', '2026-05-05 09:32:36', '2026-05-06 08:20:08', 1, NULL, 9, NULL, NULL);
INSERT INTO public.barang VALUES (135, 1, 3, 1, '54J164701042', 'baru', 'dipinjamkan', '2026-05-05 09:44:21', '2026-05-06 08:21:09', 5, NULL, 1, NULL, NULL);
INSERT INTO public.barang VALUES (134, 1, 3, 1, '54J173403264', 'baru', 'dipinjamkan', '2026-05-05 09:44:21', '2026-05-06 08:21:35', 5, NULL, 1, NULL, NULL);
INSERT INTO public.barang VALUES (136, 1, 3, 8, '54J172001639', 'baru', 'dipinjamkan', '2026-05-06 01:39:27', '2026-05-06 08:43:12', 5, NULL, 13, NULL, NULL);
INSERT INTO public.barang VALUES (137, 1, 3, 8, '54J172001647', 'baru', 'dipinjamkan', '2026-05-06 01:39:27', '2026-05-06 08:43:12', 5, NULL, 14, NULL, NULL);
INSERT INTO public.barang VALUES (138, 1, 3, 8, '54J173403404', 'baru', 'dipinjamkan', '2026-05-06 01:39:27', '2026-05-06 08:43:12', 5, NULL, 14, NULL, NULL);
INSERT INTO public.barang VALUES (139, 1, 3, 8, 'J4J163303233', 'baru', 'dipinjamkan', '2026-05-06 01:39:27', '2026-05-06 08:43:12', 5, NULL, 13, NULL, NULL);
INSERT INTO public.barang VALUES (140, 3, 3, 8, 'B6430213', 'baru', 'dipinjamkan', '2026-05-06 01:39:27', '2026-05-06 08:43:12', 6, NULL, 15, NULL, NULL);
INSERT INTO public.barang VALUES (141, 1, NULL, 8, '54J172001641', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:43:44', 5, NULL, 14, NULL, NULL);
INSERT INTO public.barang VALUES (144, 1, NULL, 8, '19J185200047', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:44:29', 1, NULL, 14, NULL, NULL);
INSERT INTO public.barang VALUES (155, 1, 3, 8, 'D5J210803593', 'baru', 'dipinjamkan', '2026-05-06 02:57:16', '2026-05-06 08:45:14', 9, NULL, 15, NULL, NULL);
INSERT INTO public.barang VALUES (147, 1, NULL, 8, 'D5J224614390', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:45:47', 2, NULL, 16, NULL, NULL);
INSERT INTO public.barang VALUES (148, 1, NULL, 8, 'D5J224613047', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:45:47', 2, NULL, 16, NULL, NULL);
INSERT INTO public.barang VALUES (152, 1, NULL, 8, 'D5J231903951', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:46:13', 3, NULL, 15, NULL, NULL);
INSERT INTO public.barang VALUES (153, 1, NULL, 8, 'D5J231903980', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:46:44', 3, NULL, 13, NULL, NULL);
INSERT INTO public.barang VALUES (142, 1, NULL, 8, '54J172001624', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:47:15', 5, NULL, 16, NULL, NULL);
INSERT INTO public.barang VALUES (149, 1, NULL, 8, 'D5J225103472', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:47:35', 2, NULL, 17, NULL, NULL);
INSERT INTO public.barang VALUES (145, 1, NULL, 8, '19J165002406', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:48:04', 1, NULL, 15, NULL, NULL);
INSERT INTO public.barang VALUES (150, 1, NULL, 8, 'D5J243111691', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:48:26', 2, NULL, 15, NULL, NULL);
INSERT INTO public.barang VALUES (151, 1, NULL, 8, 'D5J244000816', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:48:57', 2, NULL, 15, NULL, NULL);
INSERT INTO public.barang VALUES (158, 1, 3, 8, '2309080189', 'baru', 'dipinjamkan', '2026-05-06 02:57:16', '2026-05-06 08:49:22', 10, NULL, 18, NULL, NULL);
INSERT INTO public.barang VALUES (156, 1, 3, 8, 'XPQ838L-BLU2309140011', 'baru', 'dipinjamkan', '2026-05-06 02:57:16', '2026-05-06 08:49:58', 11, NULL, 14, NULL, NULL);
INSERT INTO public.barang VALUES (157, 1, 3, 8, 'Q838L-BLU2212100011', 'baru', 'dipinjamkan', '2026-05-06 02:57:16', '2026-05-06 08:49:58', 11, NULL, 14, NULL, NULL);
INSERT INTO public.barang VALUES (154, 1, NULL, 8, 'D5J252105585', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:50:35', 3, NULL, 19, NULL, NULL);
INSERT INTO public.barang VALUES (143, 1, NULL, 8, '54J164701221', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:50:53', 5, NULL, 16, NULL, NULL);
INSERT INTO public.barang VALUES (146, 1, NULL, 8, '19J192501735', 'baru', 'dipinjamkan', '2026-05-06 01:48:52', '2026-05-06 08:51:13', 1, NULL, 13, NULL, NULL);
INSERT INTO public.barang VALUES (178, 1, 3, 4, '19J172201309', 'baru', 'dipinjamkan', '2026-05-06 03:33:01', '2026-05-06 09:03:52', 12, NULL, 21, NULL, NULL);
INSERT INTO public.barang VALUES (191, 1, 3, 15, 'D5J254201219', 'baru', 'dipinjamkan', '2026-05-23 06:50:58', '2026-05-23 06:53:24', 3, NULL, NULL, NULL, NULL);
INSERT INTO public.barang VALUES (192, 1, 3, 15, 'D5J254201258', 'baru', 'dipinjamkan', '2026-05-23 06:50:58', '2026-05-23 06:53:24', 3, NULL, NULL, NULL, NULL);


--
-- Data for Name: barang_keluar; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.barang_keluar VALUES (6, '2018-01-01', 7, 1, '2026-05-05 08:28:27', '2026-05-05 08:28:27');
INSERT INTO public.barang_keluar VALUES (7, '2020-02-22', 7, 1, '2026-05-05 08:37:30', '2026-05-05 08:37:30');
INSERT INTO public.barang_keluar VALUES (8, '2020-01-23', 7, 1, '2026-05-05 08:38:14', '2026-05-05 08:38:14');
INSERT INTO public.barang_keluar VALUES (9, '2020-02-18', 7, 1, '2026-05-05 08:39:28', '2026-05-05 08:39:28');
INSERT INTO public.barang_keluar VALUES (10, '2024-07-24', 7, 1, '2026-05-05 08:40:12', '2026-05-05 08:40:12');
INSERT INTO public.barang_keluar VALUES (11, '2015-05-01', 3, 1, '2026-05-05 09:14:04', '2026-05-05 09:14:04');
INSERT INTO public.barang_keluar VALUES (12, '2022-04-08', 3, 1, '2026-05-05 09:15:00', '2026-05-05 09:15:00');
INSERT INTO public.barang_keluar VALUES (13, '2023-03-09', 3, 1, '2026-05-05 09:15:47', '2026-05-05 09:15:47');
INSERT INTO public.barang_keluar VALUES (14, '2023-06-19', 3, 1, '2026-05-05 09:16:26', '2026-05-05 09:16:26');
INSERT INTO public.barang_keluar VALUES (15, '2023-07-18', 3, 1, '2026-05-05 09:16:59', '2026-05-05 09:16:59');
INSERT INTO public.barang_keluar VALUES (16, '2023-08-01', 3, 1, '2026-05-05 09:17:58', '2026-05-05 09:17:58');
INSERT INTO public.barang_keluar VALUES (17, '2023-11-29', 3, 1, '2026-05-05 09:18:28', '2026-05-05 09:18:28');
INSERT INTO public.barang_keluar VALUES (18, '2024-12-18', 3, 1, '2026-05-05 09:19:22', '2026-05-05 09:19:22');
INSERT INTO public.barang_keluar VALUES (19, '2025-02-25', 3, 1, '2026-05-05 09:19:58', '2026-05-05 09:19:58');
INSERT INTO public.barang_keluar VALUES (20, '2025-11-30', 3, 1, '2026-05-05 09:20:46', '2026-05-05 09:20:46');
INSERT INTO public.barang_keluar VALUES (22, '2020-01-24', 1, 1, '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.barang_keluar VALUES (23, '2020-09-16', 1, 1, '2026-05-06 01:19:07', '2026-05-06 01:19:07');
INSERT INTO public.barang_keluar VALUES (24, '2020-09-17', 1, 1, '2026-05-06 01:19:58', '2026-05-06 01:19:58');
INSERT INTO public.barang_keluar VALUES (25, '2024-02-29', 1, 1, '2026-05-06 01:20:55', '2026-05-06 01:20:55');
INSERT INTO public.barang_keluar VALUES (26, '2025-07-25', 1, 1, '2026-05-06 01:21:56', '2026-05-06 01:21:56');
INSERT INTO public.barang_keluar VALUES (27, '2025-07-30', 1, 1, '2026-05-06 01:22:35', '2026-05-06 01:22:35');
INSERT INTO public.barang_keluar VALUES (28, '2025-08-07', 1, 1, '2026-05-06 01:23:25', '2026-05-06 01:23:25');
INSERT INTO public.barang_keluar VALUES (29, '2026-04-09', 1, 1, '2026-05-06 01:24:11', '2026-05-06 01:24:11');
INSERT INTO public.barang_keluar VALUES (30, '2026-04-29', 1, 1, '2026-05-06 01:24:50', '2026-05-06 01:24:50');
INSERT INTO public.barang_keluar VALUES (31, '2018-01-01', 8, 1, '2026-05-06 03:03:10', '2026-05-06 03:03:10');
INSERT INTO public.barang_keluar VALUES (32, '2020-01-18', 8, 1, '2026-05-06 03:04:10', '2026-05-06 03:04:10');
INSERT INTO public.barang_keluar VALUES (33, '2021-02-02', 8, 1, '2026-05-06 03:05:06', '2026-05-06 03:05:06');
INSERT INTO public.barang_keluar VALUES (34, '2023-04-28', 8, 1, '2026-05-06 03:07:02', '2026-05-06 03:07:02');
INSERT INTO public.barang_keluar VALUES (35, '2023-11-01', 8, 1, '2026-05-06 03:07:59', '2026-05-06 03:07:59');
INSERT INTO public.barang_keluar VALUES (36, '2024-02-05', 8, 1, '2026-05-06 03:08:37', '2026-05-06 03:08:37');
INSERT INTO public.barang_keluar VALUES (37, '2024-05-04', 8, 1, '2026-05-06 03:09:25', '2026-05-06 03:09:25');
INSERT INTO public.barang_keluar VALUES (38, '2024-10-22', 8, 1, '2026-05-06 03:10:08', '2026-05-06 03:10:08');
INSERT INTO public.barang_keluar VALUES (39, '2024-12-02', 8, 1, '2026-05-06 03:10:51', '2026-05-06 03:10:51');
INSERT INTO public.barang_keluar VALUES (40, '2025-01-08', 8, 1, '2026-05-06 03:11:56', '2026-05-06 03:11:56');
INSERT INTO public.barang_keluar VALUES (41, '2025-04-07', 8, 1, '2026-05-06 03:12:41', '2026-05-06 03:12:41');
INSERT INTO public.barang_keluar VALUES (42, '2025-06-25', 8, 1, '2026-05-06 03:13:16', '2026-05-06 03:13:16');
INSERT INTO public.barang_keluar VALUES (43, '2025-07-28', 8, 1, '2026-05-06 03:13:51', '2026-05-06 03:13:51');
INSERT INTO public.barang_keluar VALUES (44, '2025-10-16', 8, 1, '2026-05-06 03:14:28', '2026-05-06 03:14:28');
INSERT INTO public.barang_keluar VALUES (45, '2026-02-02', 8, 1, '2026-05-06 03:15:04', '2026-05-06 03:15:04');
INSERT INTO public.barang_keluar VALUES (46, '2026-03-25', 8, 1, '2026-05-06 03:15:44', '2026-05-06 03:15:44');
INSERT INTO public.barang_keluar VALUES (47, '2026-04-06', 8, 1, '2026-05-06 03:16:18', '2026-05-06 03:16:18');
INSERT INTO public.barang_keluar VALUES (48, '2022-02-02', 9, 1, '2026-05-06 03:20:53', '2026-05-06 03:20:53');
INSERT INTO public.barang_keluar VALUES (49, '2023-09-14', 9, 1, '2026-05-06 03:21:32', '2026-05-06 03:21:32');
INSERT INTO public.barang_keluar VALUES (50, '2020-01-01', 10, 1, '2026-05-06 03:24:55', '2026-05-06 03:24:55');
INSERT INTO public.barang_keluar VALUES (51, '2017-11-07', 4, 1, '2026-05-06 03:36:22', '2026-05-06 03:36:22');
INSERT INTO public.barang_keluar VALUES (52, '2022-08-25', 4, 1, '2026-05-06 03:37:16', '2026-05-06 03:37:16');
INSERT INTO public.barang_keluar VALUES (53, '2022-09-27', 4, 1, '2026-05-06 03:38:05', '2026-05-06 03:38:05');
INSERT INTO public.barang_keluar VALUES (54, '2023-09-07', 4, 1, '2026-05-06 03:40:00', '2026-05-06 03:40:00');
INSERT INTO public.barang_keluar VALUES (55, '2023-10-05', 4, 1, '2026-05-06 03:40:56', '2026-05-06 03:40:56');
INSERT INTO public.barang_keluar VALUES (56, '2024-09-24', 4, 1, '2026-05-06 03:41:28', '2026-05-06 03:41:28');
INSERT INTO public.barang_keluar VALUES (57, '2025-04-10', 4, 1, '2026-05-06 03:42:04', '2026-05-06 03:42:04');
INSERT INTO public.barang_keluar VALUES (58, '2025-09-24', 4, 1, '2026-05-06 03:42:46', '2026-05-06 03:42:46');
INSERT INTO public.barang_keluar VALUES (59, '2026-02-02', 4, 1, '2026-05-06 03:43:18', '2026-05-06 03:43:18');
INSERT INTO public.barang_keluar VALUES (60, '2023-11-20', 11, 1, '2026-05-06 03:53:43', '2026-05-06 03:53:43');
INSERT INTO public.barang_keluar VALUES (61, '2024-10-28', 11, 1, '2026-05-06 03:54:21', '2026-05-06 03:54:21');
INSERT INTO public.barang_keluar VALUES (62, '2025-07-05', 11, 1, '2026-05-06 03:54:54', '2026-05-06 03:54:54');
INSERT INTO public.barang_keluar VALUES (63, '2022-09-09', 12, 1, '2026-05-06 03:57:08', '2026-05-06 03:57:08');
INSERT INTO public.barang_keluar VALUES (64, '2024-02-14', 12, 1, '2026-05-06 03:57:50', '2026-05-06 03:57:50');
INSERT INTO public.barang_keluar VALUES (65, '2023-11-14', 13, 1, '2026-05-06 04:00:31', '2026-05-06 04:00:31');
INSERT INTO public.barang_keluar VALUES (66, '2024-01-08', 14, 1, '2026-05-06 04:03:09', '2026-05-06 04:03:09');
INSERT INTO public.barang_keluar VALUES (67, '2026-02-05', 6, 1, '2026-05-21 01:42:55', '2026-05-21 01:42:55');
INSERT INTO public.barang_keluar VALUES (68, '2026-05-08', 15, 1, '2026-05-23 06:53:24', '2026-05-23 06:53:24');


--
-- Data for Name: barang_keluar_detail; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.barang_keluar_detail VALUES (22, 6, 87, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (23, 6, 88, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (24, 6, 89, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (25, 6, 90, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (26, 6, 91, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (27, 6, 92, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (28, 7, 93, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (29, 8, 94, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (30, 9, 95, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (31, 9, 96, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (32, 10, 97, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (33, 11, 98, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (34, 11, 99, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (35, 11, 101, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (36, 11, 102, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (37, 12, 103, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (38, 13, 104, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (39, 14, 105, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (40, 15, 106, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (41, 16, 107, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (42, 17, 109, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (43, 18, 110, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (44, 18, 111, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (45, 19, 112, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (46, 20, 100, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (47, 20, 108, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (49, 22, 114, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (50, 22, 115, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (51, 22, 116, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (52, 22, 117, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (53, 22, 118, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (54, 22, 119, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (55, 22, 120, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (56, 22, 121, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (57, 22, 122, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (58, 22, 123, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (59, 22, 124, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (60, 23, 125, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (61, 24, 126, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (62, 25, 128, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (63, 25, 129, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (64, 26, 130, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (65, 26, 131, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (66, 27, 132, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (67, 27, 133, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (68, 28, 134, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (69, 29, 135, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (70, 30, 127, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (71, 31, 136, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (72, 31, 137, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (73, 31, 138, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (74, 31, 139, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (75, 31, 140, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (76, 32, 141, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (77, 33, 144, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (78, 34, 155, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (79, 35, 147, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (80, 35, 148, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (81, 36, 152, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (82, 37, 153, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (83, 38, 142, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (84, 39, 149, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (85, 40, 145, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (86, 41, 150, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (87, 42, 151, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (88, 43, 158, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (89, 44, 156, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (90, 44, 157, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (91, 45, 154, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (92, 46, 143, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (93, 47, 146, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (94, 48, 159, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (95, 48, 160, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (96, 49, 161, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (97, 49, 162, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (98, 50, 163, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (99, 51, 164, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (100, 51, 165, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (101, 51, 166, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (102, 51, 167, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (103, 51, 168, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (104, 52, 169, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (105, 52, 170, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (106, 53, 171, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (107, 54, 173, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (108, 55, 174, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (109, 56, 178, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (110, 57, 175, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (111, 58, 172, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (112, 59, 176, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (113, 59, 177, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (114, 60, 179, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (115, 61, 180, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (116, 62, 181, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (117, 63, 182, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (118, 64, 183, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (119, 64, 184, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (120, 65, 185, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (121, 65, 186, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (122, 66, 187, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (123, 66, 188, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (124, 66, 189, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (125, 66, 190, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (126, 67, 113, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (127, 68, 191, 'dipinjamkan', NULL, NULL);
INSERT INTO public.barang_keluar_detail VALUES (128, 68, 192, 'dipinjamkan', NULL, NULL);


--
-- Data for Name: barang_kembali; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: barang_kembali_detail; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: barang_masuk; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.barang_masuk VALUES (9, '2026-05-05', 1, 1, '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.barang_masuk VALUES (10, '2026-05-05', 3, 1, '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.barang_masuk VALUES (11, '2026-05-05', 3, 1, '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.barang_masuk VALUES (12, '2026-05-05', 3, 1, '2026-05-05 09:44:21', '2026-05-05 09:44:21');
INSERT INTO public.barang_masuk VALUES (13, '2018-01-01', 3, 1, '2026-05-06 01:39:27', '2026-05-06 01:39:27');
INSERT INTO public.barang_masuk VALUES (14, '2026-05-06', NULL, 1, '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.barang_masuk VALUES (15, '2026-05-06', 3, 1, '2026-05-06 02:57:16', '2026-05-06 02:57:16');
INSERT INTO public.barang_masuk VALUES (16, '2026-05-06', 3, 1, '2026-05-06 03:19:49', '2026-05-06 03:19:49');
INSERT INTO public.barang_masuk VALUES (17, '2026-05-06', 3, 1, '2026-05-06 03:24:28', '2026-05-06 03:24:28');
INSERT INTO public.barang_masuk VALUES (18, '2026-05-06', 3, 1, '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.barang_masuk VALUES (19, '2026-05-06', 3, 1, '2026-05-06 03:33:01', '2026-05-06 03:33:01');
INSERT INTO public.barang_masuk VALUES (20, '2026-05-06', 3, 1, '2026-05-06 03:52:52', '2026-05-06 03:52:52');
INSERT INTO public.barang_masuk VALUES (21, '2026-05-06', 3, 1, '2026-05-06 03:56:20', '2026-05-06 03:56:20');
INSERT INTO public.barang_masuk VALUES (22, '2026-05-06', 3, 1, '2026-05-06 03:59:28', '2026-05-06 03:59:28');
INSERT INTO public.barang_masuk VALUES (23, '2026-05-06', 3, 1, '2026-05-06 04:02:04', '2026-05-06 04:02:04');
INSERT INTO public.barang_masuk VALUES (24, '2026-05-23', 3, 1, '2026-05-23 06:50:58', '2026-05-23 06:50:58');


--
-- Data for Name: barang_masuk_detail; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.barang_masuk_detail VALUES (87, 9, 87);
INSERT INTO public.barang_masuk_detail VALUES (88, 9, 88);
INSERT INTO public.barang_masuk_detail VALUES (89, 9, 89);
INSERT INTO public.barang_masuk_detail VALUES (90, 9, 90);
INSERT INTO public.barang_masuk_detail VALUES (91, 9, 91);
INSERT INTO public.barang_masuk_detail VALUES (92, 9, 92);
INSERT INTO public.barang_masuk_detail VALUES (93, 9, 93);
INSERT INTO public.barang_masuk_detail VALUES (94, 9, 94);
INSERT INTO public.barang_masuk_detail VALUES (95, 9, 95);
INSERT INTO public.barang_masuk_detail VALUES (96, 9, 96);
INSERT INTO public.barang_masuk_detail VALUES (97, 9, 97);
INSERT INTO public.barang_masuk_detail VALUES (98, 10, 98);
INSERT INTO public.barang_masuk_detail VALUES (99, 10, 99);
INSERT INTO public.barang_masuk_detail VALUES (100, 10, 100);
INSERT INTO public.barang_masuk_detail VALUES (101, 10, 101);
INSERT INTO public.barang_masuk_detail VALUES (102, 10, 102);
INSERT INTO public.barang_masuk_detail VALUES (103, 10, 103);
INSERT INTO public.barang_masuk_detail VALUES (104, 10, 104);
INSERT INTO public.barang_masuk_detail VALUES (105, 10, 105);
INSERT INTO public.barang_masuk_detail VALUES (106, 10, 106);
INSERT INTO public.barang_masuk_detail VALUES (107, 10, 107);
INSERT INTO public.barang_masuk_detail VALUES (108, 10, 108);
INSERT INTO public.barang_masuk_detail VALUES (109, 10, 109);
INSERT INTO public.barang_masuk_detail VALUES (110, 10, 110);
INSERT INTO public.barang_masuk_detail VALUES (111, 10, 111);
INSERT INTO public.barang_masuk_detail VALUES (112, 10, 112);
INSERT INTO public.barang_masuk_detail VALUES (113, 10, 113);
INSERT INTO public.barang_masuk_detail VALUES (114, 11, 114);
INSERT INTO public.barang_masuk_detail VALUES (115, 11, 115);
INSERT INTO public.barang_masuk_detail VALUES (116, 11, 116);
INSERT INTO public.barang_masuk_detail VALUES (117, 11, 117);
INSERT INTO public.barang_masuk_detail VALUES (118, 11, 118);
INSERT INTO public.barang_masuk_detail VALUES (119, 11, 119);
INSERT INTO public.barang_masuk_detail VALUES (120, 11, 120);
INSERT INTO public.barang_masuk_detail VALUES (121, 11, 121);
INSERT INTO public.barang_masuk_detail VALUES (122, 11, 122);
INSERT INTO public.barang_masuk_detail VALUES (123, 11, 123);
INSERT INTO public.barang_masuk_detail VALUES (124, 11, 124);
INSERT INTO public.barang_masuk_detail VALUES (125, 11, 125);
INSERT INTO public.barang_masuk_detail VALUES (126, 11, 126);
INSERT INTO public.barang_masuk_detail VALUES (127, 11, 127);
INSERT INTO public.barang_masuk_detail VALUES (128, 12, 128);
INSERT INTO public.barang_masuk_detail VALUES (129, 12, 129);
INSERT INTO public.barang_masuk_detail VALUES (130, 12, 130);
INSERT INTO public.barang_masuk_detail VALUES (131, 12, 131);
INSERT INTO public.barang_masuk_detail VALUES (132, 12, 132);
INSERT INTO public.barang_masuk_detail VALUES (133, 12, 133);
INSERT INTO public.barang_masuk_detail VALUES (134, 12, 134);
INSERT INTO public.barang_masuk_detail VALUES (135, 12, 135);
INSERT INTO public.barang_masuk_detail VALUES (136, 13, 136);
INSERT INTO public.barang_masuk_detail VALUES (137, 13, 137);
INSERT INTO public.barang_masuk_detail VALUES (138, 13, 138);
INSERT INTO public.barang_masuk_detail VALUES (139, 13, 139);
INSERT INTO public.barang_masuk_detail VALUES (140, 13, 140);
INSERT INTO public.barang_masuk_detail VALUES (141, 14, 141);
INSERT INTO public.barang_masuk_detail VALUES (142, 14, 142);
INSERT INTO public.barang_masuk_detail VALUES (143, 14, 143);
INSERT INTO public.barang_masuk_detail VALUES (144, 14, 144);
INSERT INTO public.barang_masuk_detail VALUES (145, 14, 145);
INSERT INTO public.barang_masuk_detail VALUES (146, 14, 146);
INSERT INTO public.barang_masuk_detail VALUES (147, 14, 147);
INSERT INTO public.barang_masuk_detail VALUES (148, 14, 148);
INSERT INTO public.barang_masuk_detail VALUES (149, 14, 149);
INSERT INTO public.barang_masuk_detail VALUES (150, 14, 150);
INSERT INTO public.barang_masuk_detail VALUES (151, 14, 151);
INSERT INTO public.barang_masuk_detail VALUES (152, 14, 152);
INSERT INTO public.barang_masuk_detail VALUES (153, 14, 153);
INSERT INTO public.barang_masuk_detail VALUES (154, 14, 154);
INSERT INTO public.barang_masuk_detail VALUES (155, 15, 155);
INSERT INTO public.barang_masuk_detail VALUES (156, 15, 156);
INSERT INTO public.barang_masuk_detail VALUES (157, 15, 157);
INSERT INTO public.barang_masuk_detail VALUES (158, 15, 158);
INSERT INTO public.barang_masuk_detail VALUES (159, 16, 159);
INSERT INTO public.barang_masuk_detail VALUES (160, 16, 160);
INSERT INTO public.barang_masuk_detail VALUES (161, 16, 161);
INSERT INTO public.barang_masuk_detail VALUES (162, 16, 162);
INSERT INTO public.barang_masuk_detail VALUES (163, 17, 163);
INSERT INTO public.barang_masuk_detail VALUES (164, 18, 164);
INSERT INTO public.barang_masuk_detail VALUES (165, 18, 165);
INSERT INTO public.barang_masuk_detail VALUES (166, 18, 166);
INSERT INTO public.barang_masuk_detail VALUES (167, 18, 167);
INSERT INTO public.barang_masuk_detail VALUES (168, 18, 168);
INSERT INTO public.barang_masuk_detail VALUES (169, 18, 169);
INSERT INTO public.barang_masuk_detail VALUES (170, 18, 170);
INSERT INTO public.barang_masuk_detail VALUES (171, 18, 171);
INSERT INTO public.barang_masuk_detail VALUES (172, 18, 172);
INSERT INTO public.barang_masuk_detail VALUES (173, 18, 173);
INSERT INTO public.barang_masuk_detail VALUES (174, 18, 174);
INSERT INTO public.barang_masuk_detail VALUES (175, 18, 175);
INSERT INTO public.barang_masuk_detail VALUES (176, 18, 176);
INSERT INTO public.barang_masuk_detail VALUES (177, 18, 177);
INSERT INTO public.barang_masuk_detail VALUES (178, 19, 178);
INSERT INTO public.barang_masuk_detail VALUES (179, 20, 179);
INSERT INTO public.barang_masuk_detail VALUES (180, 20, 180);
INSERT INTO public.barang_masuk_detail VALUES (181, 20, 181);
INSERT INTO public.barang_masuk_detail VALUES (182, 21, 182);
INSERT INTO public.barang_masuk_detail VALUES (183, 21, 183);
INSERT INTO public.barang_masuk_detail VALUES (184, 21, 184);
INSERT INTO public.barang_masuk_detail VALUES (185, 22, 185);
INSERT INTO public.barang_masuk_detail VALUES (186, 22, 186);
INSERT INTO public.barang_masuk_detail VALUES (187, 23, 187);
INSERT INTO public.barang_masuk_detail VALUES (188, 23, 188);
INSERT INTO public.barang_masuk_detail VALUES (189, 23, 189);
INSERT INTO public.barang_masuk_detail VALUES (190, 23, 190);
INSERT INTO public.barang_masuk_detail VALUES (191, 24, 191);
INSERT INTO public.barang_masuk_detail VALUES (192, 24, 192);


--
-- Data for Name: barang_pemusnahan; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: jenis_barang; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.jenis_barang VALUES (1, 'LABEL', '2025-08-06 08:22:46', '2026-05-05 05:52:20', 1);
INSERT INTO public.jenis_barang VALUES (3, 'KARTU', '2026-05-05 05:52:51', '2026-05-05 05:52:51', 1);
INSERT INTO public.jenis_barang VALUES (4, 'GELANG', '2026-05-05 05:53:13', '2026-05-05 05:53:13', 1);


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: kategori_barang; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.kategori_barang VALUES (1, 'PRINTER', '2025-08-06 08:19:21', '2025-08-06 08:19:21');


--
-- Data for Name: lokasi; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.lokasi VALUES (1, 'RS MUHAMMADIYAH PALEMBANG', 'JL. JENDERAL AHMAD YANI NO.13, 13 ULU, KEC. SEBERANG ULU II, KOTA PALEMBANG', false, '2025-08-06 08:34:13', '2025-08-06 08:34:13');
INSERT INTO public.lokasi VALUES (2, 'RS BHAYANGKARA PALEMBANG', 'JL.KOL.H.BURLIAN NO.8 KM.5', false, '2025-08-06 08:35:29', '2025-08-06 08:35:29');
INSERT INTO public.lokasi VALUES (3, 'RSUD PALEMBANG BARI', 'JL. PANCA USAHA NO.01 KEL.5 ULU', false, '2025-08-06 08:36:39', '2025-08-06 08:36:39');
INSERT INTO public.lokasi VALUES (4, 'RS KHUSUS MATA PROV.SUMATERA SELATAN', 'JL. KOL. H. BURLIAN NO.KM.5,5, SUKABANGUN, KEC. SUKARAMI, KOTA PALEMBAG', false, '2025-08-06 08:38:25', '2025-08-06 08:38:25');
INSERT INTO public.lokasi VALUES (5, 'GUDANG', '-', true, '2025-08-06 08:39:13', '2025-08-06 08:39:13');
INSERT INTO public.lokasi VALUES (6, 'RSUD BAYUNG LENCIR', 'JL. RAYA PALEMBANG - JAMBI NO.KM, SIMPANG BAYAT,  KEC. BAYUNG LENCIR, KABUPATEN MUSI BANYUASIN', false, '2026-02-05 13:31:06', '2026-02-05 13:31:06');
INSERT INTO public.lokasi VALUES (7, 'RSUD KAYU AGUNG', 'Jalan Letjen Yusuf Singadekane, Jua Jua, Kec. Kayu Agung, Kabupaten Ogan Komering Ilir, Sumatera Selatan 30867', false, '2026-05-05 07:49:02', '2026-05-05 07:49:02');
INSERT INTO public.lokasi VALUES (8, 'RSU SRIWIJAYA', 'Jalan Jenderal Sudirman KM.4.5 No.502, 20 Ilir D. IV, Kec. Ilir Tim. I, Kota Palembang, Sumatera Selatan 30138', false, '2026-05-05 08:09:36', '2026-05-05 08:09:36');
INSERT INTO public.lokasi VALUES (9, 'KLINIK UTAMA MATA SILAMPARI SEC', 'Jl. Yos Sudarso, Taba Pingin, Kec. Lubuk Linggau Sel. II, Kota Lubuklinggau, Sumatera Selatan 31625', false, '2026-05-05 08:11:06', '2026-05-05 09:26:37');
INSERT INTO public.lokasi VALUES (10, 'RSK CHARITAS PALEMBANG', 'Jl. Jend. Sudirman No.1054, Sungai Pangeran, Kec. Ilir Tim. I, Kota Palembang, Sumatera Selatan 30114', false, '2026-05-06 03:23:17', '2026-05-06 03:23:17');
INSERT INTO public.lokasi VALUES (11, 'RSK CHARITAS BELITANG', 'Jalan H. Muhammad Shaleh Mualim, Tegal Rejo, Kec. Belitang, Kabupaten Ogan Komering Ulu Timur, Sumatera Selatan 32382', false, '2026-05-06 03:45:48', '2026-05-06 03:45:48');
INSERT INTO public.lokasi VALUES (12, 'RSI SITI KHADIJAH', 'Jl. Demang Lebar Daun, Lorok Pakjo, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30137', false, '2026-05-06 03:46:48', '2026-05-06 03:46:48');
INSERT INTO public.lokasi VALUES (13, 'RSUD LAHAT', 'Jl. Letjend Harun Sohar No.28, Ps. Baru, Kec. Lahat, Kabupaten Lahat, Sumatera Selatan 31461', false, '2026-05-06 03:47:29', '2026-05-06 03:47:29');
INSERT INTO public.lokasi VALUES (14, 'KLINIK MATA BATURAJA SEC', 'Jl. Syekh A. Kaliyudin, Tj. Baru, Kec. Baturaja Timur, Kabupaten Ogan Komering Ulu, Sumatera Selatan 32121', false, '2026-05-06 03:48:20', '2026-05-06 03:48:28');
INSERT INTO public.lokasi VALUES (15, 'RSU HKBP BALIGE', 'Jl. Gereja No.17, Lumban Dolok Haume Bange, Kec. Balige, Toba, Sumatera Utara', false, '2026-05-21 01:43:49', '2026-05-21 01:43:49');


--
-- Data for Name: merek_barang; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.merek_barang VALUES (1, 'ZEBRA', '2025-08-06 08:20:17', '2025-08-06 08:20:17');
INSERT INTO public.merek_barang VALUES (2, 'FARGO', '2025-08-06 08:20:26', '2025-08-06 08:20:26');
INSERT INTO public.merek_barang VALUES (3, 'EPSON', '2025-08-06 08:20:33', '2025-08-06 08:21:03');
INSERT INTO public.merek_barang VALUES (5, 'TSC', '2025-08-06 08:21:15', '2025-08-06 08:21:15');
INSERT INTO public.merek_barang VALUES (6, 'MAGIC CARD', '2026-05-05 09:37:38', '2026-05-05 09:37:38');
INSERT INTO public.merek_barang VALUES (4, 'X PRINT', '2025-08-06 08:20:43', '2026-05-06 01:49:53');
INSERT INTO public.merek_barang VALUES (7, 'BLUEPRINT', '2026-05-06 01:50:44', '2026-05-06 01:50:44');


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.migrations VALUES (1, '0001_01_01_000000_create_users_table', 1);
INSERT INTO public.migrations VALUES (2, '0001_01_01_000001_create_cache_table', 1);
INSERT INTO public.migrations VALUES (3, '0001_01_01_000002_create_jobs_table', 1);
INSERT INTO public.migrations VALUES (5, '2025_07_31_012222_add_kolom_name_barang_table', 3);
INSERT INTO public.migrations VALUES (6, '2025_07_31_050627_add_status_keluar_to_barang_keluar_details_table', 4);
INSERT INTO public.migrations VALUES (7, '2025_07_31_060444_add_is_gudang_to_lokasi_table', 5);
INSERT INTO public.migrations VALUES (8, '2025_07_31_080500_add_kondisi_to_barang_kembali_details_table', 6);
INSERT INTO public.migrations VALUES (9, '2025_07_31_124657_add_rak_to_barang_and_create_rak_barang_table', 7);
INSERT INTO public.migrations VALUES (11, '2025_08_01_085832_add_lokasi_id_to_barang_table', 8);
INSERT INTO public.migrations VALUES (13, '2025_07_30_011626_create_tabel_inventaris_table', 9);
INSERT INTO public.migrations VALUES (14, '2025_08_02_001337_create_nama_barang_table', 10);
INSERT INTO public.migrations VALUES (15, '2025_08_02_001427_update_model_to_nama_barang_on_barang_table', 10);
INSERT INTO public.migrations VALUES (16, '2025_08_02_001527_update_rekap_stok_barang_table', 10);
INSERT INTO public.migrations VALUES (17, '2025_08_02_005304_update_struktur_barang', 11);
INSERT INTO public.migrations VALUES (18, '2025_08_02_100346_add_rak_id_to_barang_table', 12);
INSERT INTO public.migrations VALUES (19, '2025_08_04_011323_add_kolom_jumlah_stock_table', 13);
INSERT INTO public.migrations VALUES (20, '2025_08_05_035259_add_kolom_label_table', 14);
INSERT INTO public.migrations VALUES (21, '2025_08_06_014256_create_permission_tables', 15);
INSERT INTO public.migrations VALUES (22, '2025_08_06_041521_add_is_system_to_permissions_table', 16);
INSERT INTO public.migrations VALUES (23, '2025_08_07_011254_create_stock_opname_table', 17);
INSERT INTO public.migrations VALUES (24, '2025_08_07_022635_add_approval_columns_to_stock_opname_table', 18);
INSERT INTO public.migrations VALUES (25, '2025_08_07_030243_add_serial_to_stock_opname_details_table', 19);
INSERT INTO public.migrations VALUES (28, '2025_08_09_010756_create_pemusnahaan_table', 20);
INSERT INTO public.migrations VALUES (29, '2025_08_09_011046_create_barang_pemusnahaan_table', 20);
INSERT INTO public.migrations VALUES (30, '2026_01_10_120840_add_performance_indexes', 21);
INSERT INTO public.migrations VALUES (31, '2026_01_11_120000_add_sub_lokasi_and_pic', 22);


--
-- Data for Name: model_barang; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.model_barang VALUES (1, 1, 1, 'GK888T', '2025-08-06 08:24:39', '2025-08-06 08:24:48', 1, NULL, 'PRINTER LABEL');
INSERT INTO public.model_barang VALUES (2, 1, 1, 'ZD220T', '2025-08-06 08:25:45', '2025-08-06 08:25:45', 1, NULL, 'PRINTER LABEL');
INSERT INTO public.model_barang VALUES (3, 1, 1, 'ZD230T', '2025-08-06 08:25:57', '2025-08-06 08:25:57', 1, NULL, 'PRINTER LABEL');
INSERT INTO public.model_barang VALUES (4, 1, 1, 'GT820', '2025-08-06 08:27:03', '2025-08-06 08:27:03', 1, NULL, 'PRINTER LABEL');
INSERT INTO public.model_barang VALUES (5, 1, 1, 'GC420T', '2025-08-06 09:11:37', '2025-08-06 09:11:50', 1, NULL, 'PRINTER LABEL');
INSERT INTO public.model_barang VALUES (8, 1, 3, 'TM-T82X', '2026-05-05 09:39:46', '2026-05-05 09:39:55', 1, NULL, 'PRINTER LABEL');
INSERT INTO public.model_barang VALUES (9, 1, 1, 'ZD888T', '2026-05-06 01:53:19', '2026-05-06 01:53:19', 1, NULL, 'PRINTER LABEL');
INSERT INTO public.model_barang VALUES (10, 1, 7, 'THERMAL', '2026-05-06 02:15:54', '2026-05-06 02:15:54', 1, NULL, 'PRINTER LABEL');
INSERT INTO public.model_barang VALUES (11, 1, 4, 'XP', '2026-05-06 02:20:34', '2026-05-06 02:20:34', 1, NULL, 'PRINTER LABEL');
INSERT INTO public.model_barang VALUES (12, 1, 1, 'GK888CN', '2026-05-06 03:32:30', '2026-05-06 03:32:30', 1, NULL, 'PRINTER LABEL');
INSERT INTO public.model_barang VALUES (6, 1, 2, 'C50', '2025-08-13 08:18:43', '2026-05-21 06:15:47', 3, NULL, 'PRINTER KARTU');
INSERT INTO public.model_barang VALUES (7, 1, 6, 'NOVA', '2026-05-05 09:38:33', '2026-05-21 06:16:45', 3, NULL, 'PRINTER KARTU');


--
-- Data for Name: model_has_permissions; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.model_has_permissions VALUES (1, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (3, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (2, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (4, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (5, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (7, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (6, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (8, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (9, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (11, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (10, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (12, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (13, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (15, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (14, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (16, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (17, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (19, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (18, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (20, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (21, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (23, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (22, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (24, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (25, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (27, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (26, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (28, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (29, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (31, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (30, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (32, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (33, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (35, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (34, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (36, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (37, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (39, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (38, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (40, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (41, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (42, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (43, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (44, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (45, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (46, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (47, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (48, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (49, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (50, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (51, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (52, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (53, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (55, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (54, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (56, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (57, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (58, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (59, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (60, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (61, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (62, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (64, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (63, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (65, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (66, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (68, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (67, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (69, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (70, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (71, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (72, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (73, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (74, 'App\Models\User', 2);
INSERT INTO public.model_has_permissions VALUES (75, 'App\Models\User', 1);
INSERT INTO public.model_has_permissions VALUES (3, 'App\Models\User', 1);
INSERT INTO public.model_has_permissions VALUES (2, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (3, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (4, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (5, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (6, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (7, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (8, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (9, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (10, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (11, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (12, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (13, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (14, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (15, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (16, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (17, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (18, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (19, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (20, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (21, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (22, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (23, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (24, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (25, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (26, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (27, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (28, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (29, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (30, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (31, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (32, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (33, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (34, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (35, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (36, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (37, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (38, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (39, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (40, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (41, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (42, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (44, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (46, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (48, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (50, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (52, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (54, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (75, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (76, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (77, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (51, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (49, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (47, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (45, 'App\Models\User', 3);
INSERT INTO public.model_has_permissions VALUES (43, 'App\Models\User', 3);


--
-- Data for Name: model_has_roles; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.model_has_roles VALUES (2, 'App\Models\User', 2);
INSERT INTO public.model_has_roles VALUES (1, 'App\Models\User', 1);
INSERT INTO public.model_has_roles VALUES (3, 'App\Models\User', 3);


--
-- Data for Name: mutasi_barang; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.mutasi_barang VALUES (126, 87, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber ONLINE', '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.mutasi_barang VALUES (127, 88, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber ONLINE', '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.mutasi_barang VALUES (128, 89, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber ONLINE', '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.mutasi_barang VALUES (129, 90, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber ONLINE', '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.mutasi_barang VALUES (130, 91, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber ONLINE', '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.mutasi_barang VALUES (131, 92, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber ONLINE', '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.mutasi_barang VALUES (132, 93, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber ONLINE', '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.mutasi_barang VALUES (133, 94, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber ONLINE', '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.mutasi_barang VALUES (134, 95, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber ONLINE', '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.mutasi_barang VALUES (135, 96, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber ONLINE', '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.mutasi_barang VALUES (136, 97, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber ONLINE', '2026-05-05 08:22:54', '2026-05-05 08:22:54');
INSERT INTO public.mutasi_barang VALUES (137, 87, 5, 7, NULL, '2018-01-01', 'Barang keluar ke RSUD KAYU AGUNG (Status: dipinjamkan)', '2026-05-05 08:28:27', '2026-05-05 08:28:27');
INSERT INTO public.mutasi_barang VALUES (138, 88, 5, 7, NULL, '2018-01-01', 'Barang keluar ke RSUD KAYU AGUNG (Status: dipinjamkan)', '2026-05-05 08:28:27', '2026-05-05 08:28:27');
INSERT INTO public.mutasi_barang VALUES (139, 89, 5, 7, NULL, '2018-01-01', 'Barang keluar ke RSUD KAYU AGUNG (Status: dipinjamkan)', '2026-05-05 08:28:27', '2026-05-05 08:28:27');
INSERT INTO public.mutasi_barang VALUES (140, 90, 5, 7, NULL, '2018-01-01', 'Barang keluar ke RSUD KAYU AGUNG (Status: dipinjamkan)', '2026-05-05 08:28:27', '2026-05-05 08:28:27');
INSERT INTO public.mutasi_barang VALUES (141, 91, 5, 7, NULL, '2018-01-01', 'Barang keluar ke RSUD KAYU AGUNG (Status: dipinjamkan)', '2026-05-05 08:28:27', '2026-05-05 08:28:27');
INSERT INTO public.mutasi_barang VALUES (142, 92, 5, 7, NULL, '2018-01-01', 'Barang keluar ke RSUD KAYU AGUNG (Status: dipinjamkan)', '2026-05-05 08:28:27', '2026-05-05 08:28:27');
INSERT INTO public.mutasi_barang VALUES (143, 93, 5, 7, NULL, '2020-02-22', 'Barang keluar ke RSUD KAYU AGUNG (Status: dipinjamkan)', '2026-05-05 08:37:30', '2026-05-05 08:37:30');
INSERT INTO public.mutasi_barang VALUES (144, 94, 5, 7, NULL, '2020-01-23', 'Barang keluar ke RSUD KAYU AGUNG (Status: dipinjamkan)', '2026-05-05 08:38:14', '2026-05-05 08:38:14');
INSERT INTO public.mutasi_barang VALUES (145, 95, 5, 7, NULL, '2020-02-18', 'Barang keluar ke RSUD KAYU AGUNG (Status: dipinjamkan)', '2026-05-05 08:39:28', '2026-05-05 08:39:28');
INSERT INTO public.mutasi_barang VALUES (146, 96, 5, 7, NULL, '2020-02-18', 'Barang keluar ke RSUD KAYU AGUNG (Status: dipinjamkan)', '2026-05-05 08:39:28', '2026-05-05 08:39:28');
INSERT INTO public.mutasi_barang VALUES (147, 97, 5, 7, NULL, '2024-07-24', 'Barang keluar ke RSUD KAYU AGUNG (Status: dipinjamkan)', '2026-05-05 08:40:12', '2026-05-05 08:40:12');
INSERT INTO public.mutasi_barang VALUES (148, 98, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (149, 99, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (150, 100, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (151, 101, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (152, 102, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (153, 103, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (154, 104, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (155, 105, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (156, 106, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (157, 107, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (158, 108, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (159, 109, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (160, 110, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (161, 111, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (162, 112, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:01:28', '2026-05-05 09:01:28');
INSERT INTO public.mutasi_barang VALUES (164, 98, 5, 3, NULL, '2015-05-01', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:14:04', '2026-05-05 09:14:04');
INSERT INTO public.mutasi_barang VALUES (165, 99, 5, 3, NULL, '2015-05-01', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:14:04', '2026-05-05 09:14:04');
INSERT INTO public.mutasi_barang VALUES (166, 101, 5, 3, NULL, '2015-05-01', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:14:04', '2026-05-05 09:14:04');
INSERT INTO public.mutasi_barang VALUES (167, 102, 5, 3, NULL, '2015-05-01', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:14:04', '2026-05-05 09:14:04');
INSERT INTO public.mutasi_barang VALUES (168, 103, 5, 3, NULL, '2022-04-08', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:15:00', '2026-05-05 09:15:00');
INSERT INTO public.mutasi_barang VALUES (169, 104, 5, 3, NULL, '2023-03-09', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:15:47', '2026-05-05 09:15:47');
INSERT INTO public.mutasi_barang VALUES (170, 105, 5, 3, NULL, '2023-06-19', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:16:26', '2026-05-05 09:16:26');
INSERT INTO public.mutasi_barang VALUES (171, 106, 5, 3, NULL, '2023-07-18', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:16:59', '2026-05-05 09:16:59');
INSERT INTO public.mutasi_barang VALUES (172, 107, 5, 3, NULL, '2023-08-01', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:17:58', '2026-05-05 09:17:58');
INSERT INTO public.mutasi_barang VALUES (173, 109, 5, 3, NULL, '2023-11-29', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:18:28', '2026-05-05 09:18:28');
INSERT INTO public.mutasi_barang VALUES (174, 110, 5, 3, NULL, '2024-12-18', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:19:22', '2026-05-05 09:19:22');
INSERT INTO public.mutasi_barang VALUES (175, 111, 5, 3, NULL, '2024-12-18', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:19:22', '2026-05-05 09:19:22');
INSERT INTO public.mutasi_barang VALUES (176, 112, 5, 3, NULL, '2025-02-25', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:19:58', '2026-05-05 09:19:58');
INSERT INTO public.mutasi_barang VALUES (177, 100, 5, 3, NULL, '2025-11-30', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:20:46', '2026-05-05 09:20:46');
INSERT INTO public.mutasi_barang VALUES (178, 108, 5, 3, NULL, '2025-11-30', 'Barang keluar ke RSUD PALEMBANG BARI (Status: dipinjamkan)', '2026-05-05 09:20:46', '2026-05-05 09:20:46');
INSERT INTO public.mutasi_barang VALUES (180, 114, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (181, 115, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (182, 116, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (183, 117, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (184, 118, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (185, 119, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (186, 120, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (187, 121, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (188, 122, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (189, 123, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (190, 124, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (191, 125, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (192, 126, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (193, 127, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:32:36', '2026-05-05 09:32:36');
INSERT INTO public.mutasi_barang VALUES (194, 128, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:44:21', '2026-05-05 09:44:21');
INSERT INTO public.mutasi_barang VALUES (195, 129, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:44:21', '2026-05-05 09:44:21');
INSERT INTO public.mutasi_barang VALUES (196, 130, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:44:21', '2026-05-05 09:44:21');
INSERT INTO public.mutasi_barang VALUES (197, 131, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:44:21', '2026-05-05 09:44:21');
INSERT INTO public.mutasi_barang VALUES (198, 132, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:44:21', '2026-05-05 09:44:21');
INSERT INTO public.mutasi_barang VALUES (199, 133, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:44:21', '2026-05-05 09:44:21');
INSERT INTO public.mutasi_barang VALUES (200, 134, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:44:21', '2026-05-05 09:44:21');
INSERT INTO public.mutasi_barang VALUES (201, 135, NULL, 5, NULL, '2026-05-05', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-05 09:44:21', '2026-05-05 09:44:21');
INSERT INTO public.mutasi_barang VALUES (202, 114, 5, 1, NULL, '2020-01-24', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.mutasi_barang VALUES (203, 115, 5, 1, NULL, '2020-01-24', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.mutasi_barang VALUES (204, 116, 5, 1, NULL, '2020-01-24', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.mutasi_barang VALUES (205, 117, 5, 1, NULL, '2020-01-24', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.mutasi_barang VALUES (206, 118, 5, 1, NULL, '2020-01-24', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.mutasi_barang VALUES (207, 119, 5, 1, NULL, '2020-01-24', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.mutasi_barang VALUES (208, 120, 5, 1, NULL, '2020-01-24', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.mutasi_barang VALUES (209, 121, 5, 1, NULL, '2020-01-24', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.mutasi_barang VALUES (210, 122, 5, 1, NULL, '2020-01-24', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.mutasi_barang VALUES (211, 123, 5, 1, NULL, '2020-01-24', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.mutasi_barang VALUES (212, 124, 5, 1, NULL, '2020-01-24', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:18:03', '2026-05-06 01:18:03');
INSERT INTO public.mutasi_barang VALUES (213, 125, 5, 1, NULL, '2020-09-16', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:19:07', '2026-05-06 01:19:07');
INSERT INTO public.mutasi_barang VALUES (214, 126, 5, 1, NULL, '2020-09-17', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:19:58', '2026-05-06 01:19:58');
INSERT INTO public.mutasi_barang VALUES (215, 128, 5, 1, NULL, '2024-02-29', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:20:55', '2026-05-06 01:20:55');
INSERT INTO public.mutasi_barang VALUES (216, 129, 5, 1, NULL, '2024-02-29', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:20:55', '2026-05-06 01:20:55');
INSERT INTO public.mutasi_barang VALUES (217, 130, 5, 1, NULL, '2025-07-25', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:21:56', '2026-05-06 01:21:56');
INSERT INTO public.mutasi_barang VALUES (218, 131, 5, 1, NULL, '2025-07-25', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:21:56', '2026-05-06 01:21:56');
INSERT INTO public.mutasi_barang VALUES (219, 132, 5, 1, NULL, '2025-07-30', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:22:35', '2026-05-06 01:22:35');
INSERT INTO public.mutasi_barang VALUES (220, 133, 5, 1, NULL, '2025-07-30', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:22:35', '2026-05-06 01:22:35');
INSERT INTO public.mutasi_barang VALUES (221, 134, 5, 1, NULL, '2025-08-07', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:23:25', '2026-05-06 01:23:25');
INSERT INTO public.mutasi_barang VALUES (222, 135, 5, 1, NULL, '2026-04-09', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:24:11', '2026-05-06 01:24:11');
INSERT INTO public.mutasi_barang VALUES (223, 127, 5, 1, NULL, '2026-04-29', 'Barang keluar ke RS MUHAMMADIYAH PALEMBANG (Status: dipinjamkan)', '2026-05-06 01:24:50', '2026-05-06 01:24:50');
INSERT INTO public.mutasi_barang VALUES (224, 136, NULL, 5, NULL, '2018-01-01', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 01:39:27', '2026-05-06 01:39:27');
INSERT INTO public.mutasi_barang VALUES (225, 137, NULL, 5, NULL, '2018-01-01', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 01:39:27', '2026-05-06 01:39:27');
INSERT INTO public.mutasi_barang VALUES (226, 138, NULL, 5, NULL, '2018-01-01', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 01:39:27', '2026-05-06 01:39:27');
INSERT INTO public.mutasi_barang VALUES (227, 139, NULL, 5, NULL, '2018-01-01', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 01:39:27', '2026-05-06 01:39:27');
INSERT INTO public.mutasi_barang VALUES (228, 140, NULL, 5, NULL, '2018-01-01', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 01:39:27', '2026-05-06 01:39:27');
INSERT INTO public.mutasi_barang VALUES (229, 141, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (230, 142, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (231, 143, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (232, 144, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (233, 145, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (234, 146, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (235, 147, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (236, 148, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (237, 149, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (238, 150, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (239, 151, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (240, 152, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (241, 153, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (242, 154, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber manual', '2026-05-06 01:48:52', '2026-05-06 01:48:52');
INSERT INTO public.mutasi_barang VALUES (243, 155, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 02:57:16', '2026-05-06 02:57:16');
INSERT INTO public.mutasi_barang VALUES (244, 156, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 02:57:16', '2026-05-06 02:57:16');
INSERT INTO public.mutasi_barang VALUES (245, 157, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 02:57:16', '2026-05-06 02:57:16');
INSERT INTO public.mutasi_barang VALUES (246, 158, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 02:57:16', '2026-05-06 02:57:16');
INSERT INTO public.mutasi_barang VALUES (247, 136, 5, 8, NULL, '2018-01-01', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:03:10', '2026-05-06 03:03:10');
INSERT INTO public.mutasi_barang VALUES (248, 137, 5, 8, NULL, '2018-01-01', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:03:10', '2026-05-06 03:03:10');
INSERT INTO public.mutasi_barang VALUES (249, 138, 5, 8, NULL, '2018-01-01', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:03:10', '2026-05-06 03:03:10');
INSERT INTO public.mutasi_barang VALUES (250, 139, 5, 8, NULL, '2018-01-01', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:03:10', '2026-05-06 03:03:10');
INSERT INTO public.mutasi_barang VALUES (251, 140, 5, 8, NULL, '2018-01-01', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:03:10', '2026-05-06 03:03:10');
INSERT INTO public.mutasi_barang VALUES (252, 141, 5, 8, NULL, '2020-01-18', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:04:10', '2026-05-06 03:04:10');
INSERT INTO public.mutasi_barang VALUES (253, 144, 5, 8, NULL, '2021-02-02', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:05:06', '2026-05-06 03:05:06');
INSERT INTO public.mutasi_barang VALUES (254, 155, 5, 8, NULL, '2023-04-28', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:07:02', '2026-05-06 03:07:02');
INSERT INTO public.mutasi_barang VALUES (255, 147, 5, 8, NULL, '2023-11-01', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:07:59', '2026-05-06 03:07:59');
INSERT INTO public.mutasi_barang VALUES (256, 148, 5, 8, NULL, '2023-11-01', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:07:59', '2026-05-06 03:07:59');
INSERT INTO public.mutasi_barang VALUES (257, 152, 5, 8, NULL, '2024-02-05', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:08:37', '2026-05-06 03:08:37');
INSERT INTO public.mutasi_barang VALUES (258, 153, 5, 8, NULL, '2024-05-04', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:09:25', '2026-05-06 03:09:25');
INSERT INTO public.mutasi_barang VALUES (259, 142, 5, 8, NULL, '2024-10-22', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:10:08', '2026-05-06 03:10:08');
INSERT INTO public.mutasi_barang VALUES (260, 149, 5, 8, NULL, '2024-12-02', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:10:51', '2026-05-06 03:10:51');
INSERT INTO public.mutasi_barang VALUES (261, 145, 5, 8, NULL, '2025-01-08', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:11:56', '2026-05-06 03:11:56');
INSERT INTO public.mutasi_barang VALUES (262, 150, 5, 8, NULL, '2025-04-07', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:12:41', '2026-05-06 03:12:41');
INSERT INTO public.mutasi_barang VALUES (263, 151, 5, 8, NULL, '2025-06-25', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:13:16', '2026-05-06 03:13:16');
INSERT INTO public.mutasi_barang VALUES (264, 158, 5, 8, NULL, '2025-07-28', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:13:51', '2026-05-06 03:13:51');
INSERT INTO public.mutasi_barang VALUES (265, 156, 5, 8, NULL, '2025-10-16', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:14:28', '2026-05-06 03:14:28');
INSERT INTO public.mutasi_barang VALUES (266, 157, 5, 8, NULL, '2025-10-16', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:14:28', '2026-05-06 03:14:28');
INSERT INTO public.mutasi_barang VALUES (267, 154, 5, 8, NULL, '2026-02-02', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:15:04', '2026-05-06 03:15:04');
INSERT INTO public.mutasi_barang VALUES (268, 143, 5, 8, NULL, '2026-03-25', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:15:44', '2026-05-06 03:15:44');
INSERT INTO public.mutasi_barang VALUES (269, 146, 5, 8, NULL, '2026-04-06', 'Barang keluar ke RSU SRIWIJAYA (Status: dipinjamkan)', '2026-05-06 03:16:18', '2026-05-06 03:16:18');
INSERT INTO public.mutasi_barang VALUES (270, 159, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:19:49', '2026-05-06 03:19:49');
INSERT INTO public.mutasi_barang VALUES (271, 160, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:19:49', '2026-05-06 03:19:49');
INSERT INTO public.mutasi_barang VALUES (272, 161, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:19:49', '2026-05-06 03:19:49');
INSERT INTO public.mutasi_barang VALUES (273, 162, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:19:49', '2026-05-06 03:19:49');
INSERT INTO public.mutasi_barang VALUES (274, 159, 5, 9, NULL, '2022-02-02', 'Barang keluar ke KLINIK UTAMA MATA SILAMPARI SEC (Status: dipinjamkan)', '2026-05-06 03:20:53', '2026-05-06 03:20:53');
INSERT INTO public.mutasi_barang VALUES (275, 160, 5, 9, NULL, '2022-02-02', 'Barang keluar ke KLINIK UTAMA MATA SILAMPARI SEC (Status: dipinjamkan)', '2026-05-06 03:20:53', '2026-05-06 03:20:53');
INSERT INTO public.mutasi_barang VALUES (276, 161, 5, 9, NULL, '2023-09-14', 'Barang keluar ke KLINIK UTAMA MATA SILAMPARI SEC (Status: dipinjamkan)', '2026-05-06 03:21:32', '2026-05-06 03:21:32');
INSERT INTO public.mutasi_barang VALUES (277, 162, 5, 9, NULL, '2023-09-14', 'Barang keluar ke KLINIK UTAMA MATA SILAMPARI SEC (Status: dipinjamkan)', '2026-05-06 03:21:32', '2026-05-06 03:21:32');
INSERT INTO public.mutasi_barang VALUES (278, 163, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:24:28', '2026-05-06 03:24:28');
INSERT INTO public.mutasi_barang VALUES (279, 163, 5, 10, NULL, '2020-01-01', 'Barang keluar ke RSK CHARITAS PALEMBANG (Status: dipinjamkan)', '2026-05-06 03:24:55', '2026-05-06 03:24:55');
INSERT INTO public.mutasi_barang VALUES (280, 164, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (281, 165, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (282, 166, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (283, 167, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (284, 168, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (285, 169, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (286, 170, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (287, 171, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (288, 172, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (289, 173, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (290, 174, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (291, 175, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (292, 176, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (293, 177, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:31:58', '2026-05-06 03:31:58');
INSERT INTO public.mutasi_barang VALUES (294, 178, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:33:01', '2026-05-06 03:33:01');
INSERT INTO public.mutasi_barang VALUES (295, 164, 5, 4, NULL, '2017-11-07', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:36:22', '2026-05-06 03:36:22');
INSERT INTO public.mutasi_barang VALUES (296, 165, 5, 4, NULL, '2017-11-07', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:36:22', '2026-05-06 03:36:22');
INSERT INTO public.mutasi_barang VALUES (297, 166, 5, 4, NULL, '2017-11-07', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:36:22', '2026-05-06 03:36:22');
INSERT INTO public.mutasi_barang VALUES (298, 167, 5, 4, NULL, '2017-11-07', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:36:22', '2026-05-06 03:36:22');
INSERT INTO public.mutasi_barang VALUES (299, 168, 5, 4, NULL, '2017-11-07', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:36:22', '2026-05-06 03:36:22');
INSERT INTO public.mutasi_barang VALUES (300, 169, 5, 4, NULL, '2022-08-25', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:37:16', '2026-05-06 03:37:16');
INSERT INTO public.mutasi_barang VALUES (301, 170, 5, 4, NULL, '2022-08-25', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:37:16', '2026-05-06 03:37:16');
INSERT INTO public.mutasi_barang VALUES (302, 171, 5, 4, NULL, '2022-09-27', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:38:05', '2026-05-06 03:38:05');
INSERT INTO public.mutasi_barang VALUES (303, 173, 5, 4, NULL, '2023-09-07', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:40:00', '2026-05-06 03:40:00');
INSERT INTO public.mutasi_barang VALUES (304, 174, 5, 4, NULL, '2023-10-05', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:40:56', '2026-05-06 03:40:56');
INSERT INTO public.mutasi_barang VALUES (305, 178, 5, 4, NULL, '2024-09-24', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:41:28', '2026-05-06 03:41:28');
INSERT INTO public.mutasi_barang VALUES (306, 175, 5, 4, NULL, '2025-04-10', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:42:04', '2026-05-06 03:42:04');
INSERT INTO public.mutasi_barang VALUES (307, 172, 5, 4, NULL, '2025-09-24', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:42:46', '2026-05-06 03:42:46');
INSERT INTO public.mutasi_barang VALUES (308, 176, 5, 4, NULL, '2026-02-02', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:43:18', '2026-05-06 03:43:18');
INSERT INTO public.mutasi_barang VALUES (309, 177, 5, 4, NULL, '2026-02-02', 'Barang keluar ke RS KHUSUS MATA PROV.SUMATERA SELATAN (Status: dipinjamkan)', '2026-05-06 03:43:18', '2026-05-06 03:43:18');
INSERT INTO public.mutasi_barang VALUES (310, 179, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:52:52', '2026-05-06 03:52:52');
INSERT INTO public.mutasi_barang VALUES (311, 180, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:52:52', '2026-05-06 03:52:52');
INSERT INTO public.mutasi_barang VALUES (312, 181, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:52:52', '2026-05-06 03:52:52');
INSERT INTO public.mutasi_barang VALUES (313, 179, 5, 11, NULL, '2023-11-20', 'Barang keluar ke RSK CHARITAS BELITANG (Status: dipinjamkan)', '2026-05-06 03:53:43', '2026-05-06 03:53:43');
INSERT INTO public.mutasi_barang VALUES (314, 180, 5, 11, NULL, '2024-10-28', 'Barang keluar ke RSK CHARITAS BELITANG (Status: dipinjamkan)', '2026-05-06 03:54:21', '2026-05-06 03:54:21');
INSERT INTO public.mutasi_barang VALUES (315, 181, 5, 11, NULL, '2025-07-05', 'Barang keluar ke RSK CHARITAS BELITANG (Status: dipinjamkan)', '2026-05-06 03:54:54', '2026-05-06 03:54:54');
INSERT INTO public.mutasi_barang VALUES (316, 182, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:56:20', '2026-05-06 03:56:20');
INSERT INTO public.mutasi_barang VALUES (317, 183, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:56:20', '2026-05-06 03:56:20');
INSERT INTO public.mutasi_barang VALUES (318, 184, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:56:20', '2026-05-06 03:56:20');
INSERT INTO public.mutasi_barang VALUES (319, 182, 5, 12, NULL, '2022-09-09', 'Barang keluar ke RSI SITI KHADIJAH (Status: dipinjamkan)', '2026-05-06 03:57:08', '2026-05-06 03:57:08');
INSERT INTO public.mutasi_barang VALUES (320, 183, 5, 12, NULL, '2024-02-14', 'Barang keluar ke RSI SITI KHADIJAH (Status: dipinjamkan)', '2026-05-06 03:57:50', '2026-05-06 03:57:50');
INSERT INTO public.mutasi_barang VALUES (321, 184, 5, 12, NULL, '2024-02-14', 'Barang keluar ke RSI SITI KHADIJAH (Status: dipinjamkan)', '2026-05-06 03:57:50', '2026-05-06 03:57:50');
INSERT INTO public.mutasi_barang VALUES (322, 185, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:59:28', '2026-05-06 03:59:28');
INSERT INTO public.mutasi_barang VALUES (323, 186, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 03:59:28', '2026-05-06 03:59:28');
INSERT INTO public.mutasi_barang VALUES (324, 185, 5, 13, NULL, '2023-11-14', 'Barang keluar ke RSUD LAHAT (Status: dipinjamkan)', '2026-05-06 04:00:31', '2026-05-06 04:00:31');
INSERT INTO public.mutasi_barang VALUES (325, 186, 5, 13, NULL, '2023-11-14', 'Barang keluar ke RSUD LAHAT (Status: dipinjamkan)', '2026-05-06 04:00:31', '2026-05-06 04:00:31');
INSERT INTO public.mutasi_barang VALUES (326, 187, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 04:02:04', '2026-05-06 04:02:04');
INSERT INTO public.mutasi_barang VALUES (327, 188, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 04:02:04', '2026-05-06 04:02:04');
INSERT INTO public.mutasi_barang VALUES (328, 189, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 04:02:04', '2026-05-06 04:02:04');
INSERT INTO public.mutasi_barang VALUES (329, 190, NULL, 5, NULL, '2026-05-06', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-06 04:02:04', '2026-05-06 04:02:04');
INSERT INTO public.mutasi_barang VALUES (330, 187, 5, 14, NULL, '2024-01-08', 'Barang keluar ke KLINIK MATA BATURAJA SEC (Status: dipinjamkan)', '2026-05-06 04:03:09', '2026-05-06 04:03:09');
INSERT INTO public.mutasi_barang VALUES (331, 188, 5, 14, NULL, '2024-01-08', 'Barang keluar ke KLINIK MATA BATURAJA SEC (Status: dipinjamkan)', '2026-05-06 04:03:09', '2026-05-06 04:03:09');
INSERT INTO public.mutasi_barang VALUES (332, 189, 5, 14, NULL, '2024-01-08', 'Barang keluar ke KLINIK MATA BATURAJA SEC (Status: dipinjamkan)', '2026-05-06 04:03:09', '2026-05-06 04:03:09');
INSERT INTO public.mutasi_barang VALUES (333, 190, 5, 14, NULL, '2024-01-08', 'Barang keluar ke KLINIK MATA BATURAJA SEC (Status: dipinjamkan)', '2026-05-06 04:03:09', '2026-05-06 04:03:09');
INSERT INTO public.mutasi_barang VALUES (334, 113, 5, 6, NULL, '2026-02-05', 'Barang keluar ke RSUD BAYUNG LENCIR (Status: dipinjamkan)', '2026-05-21 01:42:55', '2026-05-21 01:42:55');
INSERT INTO public.mutasi_barang VALUES (335, 191, NULL, 5, NULL, '2026-05-23', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-23 06:50:58', '2026-05-23 06:50:58');
INSERT INTO public.mutasi_barang VALUES (336, 192, NULL, 5, NULL, '2026-05-23', 'Barang masuk dari sumber BINTANG TEKNOLOGI', '2026-05-23 06:50:58', '2026-05-23 06:50:58');
INSERT INTO public.mutasi_barang VALUES (337, 191, 5, 15, NULL, '2026-05-08', 'Barang keluar ke RSU HKBP BALIGE (Status: dipinjamkan)', '2026-05-23 06:53:24', '2026-05-23 06:53:24');
INSERT INTO public.mutasi_barang VALUES (338, 192, 5, 15, NULL, '2026-05-08', 'Barang keluar ke RSU HKBP BALIGE (Status: dipinjamkan)', '2026-05-23 06:53:24', '2026-05-23 06:53:24');


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: pemusnahan; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.permissions VALUES (1, 'view-dashboard', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (2, 'view-kategori', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (3, 'create-kategori', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (4, 'edit-kategori', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (5, 'delete-kategori', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (6, 'view-merek', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (7, 'create-merek', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (8, 'edit-merek', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (9, 'delete-merek', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (10, 'view-model', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (11, 'create-model', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (12, 'edit-model', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (13, 'delete-model', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (14, 'view-jenis', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (15, 'create-jenis', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (16, 'edit-jenis', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (17, 'delete-jenis', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (18, 'view-asal-barang', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (19, 'create-asal-barang', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (20, 'edit-asal-barang', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (21, 'delete-asal-barang', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (22, 'view-lokasi-distribusi', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (23, 'create-lokasi-distribusi', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (24, 'edit-lokasi-distribusi', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (25, 'delete-lokasi-distribusi', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (26, 'view-rak-barang', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (27, 'create-rak-barang', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (28, 'edit-rak-barang', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (29, 'delete-rak-barang', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (30, 'view-barang-masuk', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (31, 'create-barang-masuk', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (32, 'edit-barang-masuk', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (33, 'delete-barang-masuk', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (34, 'view-barang-keluar', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (35, 'create-barang-keluar', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (36, 'edit-barang-keluar', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (37, 'delete-barang-keluar', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (38, 'view-barang-kembali', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (39, 'create-barang-kembali', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (40, 'edit-barang-kembali', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (41, 'delete-barang-kembali', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (42, 'view-stok-gudang', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (43, 'edit-stok-gudang', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (44, 'view-stok-distribusi', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (45, 'edit-stok-distribusi', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (46, 'view-stok-terjual', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (47, 'edit-stok-terjual', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (48, 'view-stok-diperbaiki', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (49, 'edit-stok-diperbaiki', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (50, 'view-stok-rusak', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (51, 'edit-stok-rusak', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (52, 'view-stok-total', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (53, 'edit-stok-total', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (54, 'view-stock-opname', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (55, 'create-stock-opname', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (56, 'edit-stock-opname', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (57, 'delete-stock-opname', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (58, 'view-dashboard-laporan', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (59, 'view-laporan-barang-masuk', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (60, 'view-laporan-barang-keluar', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (61, 'view-laporan-barang-kembali', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (62, 'view-laporan-mutasi', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (63, 'view-user', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (64, 'create-user', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (65, 'edit-user', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (66, 'delete-user', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (67, 'view-role', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (68, 'create-role', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (69, 'edit-role', 'web', '2025-08-11 09:44:28', '2025-08-11 09:44:28', false);
INSERT INTO public.permissions VALUES (70, 'delete-role', 'web', '2025-08-11 09:44:29', '2025-08-11 09:44:29', false);
INSERT INTO public.permissions VALUES (71, 'view-permission', 'web', '2025-08-11 09:44:29', '2025-08-11 09:44:29', false);
INSERT INTO public.permissions VALUES (72, 'edit-permission', 'web', '2025-08-11 09:44:29', '2025-08-11 09:44:29', false);
INSERT INTO public.permissions VALUES (73, 'view-setting', 'web', '2025-08-11 09:44:29', '2025-08-11 09:44:29', false);
INSERT INTO public.permissions VALUES (74, 'edit-setting', 'web', '2025-08-11 09:44:29', '2025-08-11 09:44:29', false);
INSERT INTO public.permissions VALUES (75, 'view-transaksi', 'web', '2025-08-12 03:58:02', '2025-08-12 03:58:02', false);
INSERT INTO public.permissions VALUES (76, 'view-stock-dashboard', 'web', '2025-08-12 04:47:50', '2025-08-12 04:47:50', false);
INSERT INTO public.permissions VALUES (77, 'approve-stok-rusak', 'web', '2025-08-13 02:43:24', '2025-08-13 02:44:06', false);


--
-- Data for Name: rak_barang; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.rak_barang VALUES (4, 5, 'Lemari besi (1)', '4', 'A004', '2025-08-06 08:42:24', '2025-08-06 08:44:06');
INSERT INTO public.rak_barang VALUES (3, 5, 'Lemari besi (1)', '3', 'A003', '2025-08-06 08:42:14', '2025-08-06 08:44:13');
INSERT INTO public.rak_barang VALUES (2, 5, 'Lemari besi (1)', '2', 'A002', '2025-08-06 08:42:06', '2025-08-06 08:44:20');
INSERT INTO public.rak_barang VALUES (1, 5, 'Lemari besi (1)', '1', 'A001', '2025-08-06 08:41:56', '2025-08-06 08:44:26');


--
-- Data for Name: rekap_stok_barang; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.rekap_stok_barang VALUES (46, 4, 0, 5, 0, 0, 0, '2026-05-06 03:36:22', '2026-05-06 03:36:22', 5, 0);
INSERT INTO public.rekap_stok_barang VALUES (15, 5, 19, 0, 0, 0, 0, '2026-05-05 08:22:54', '2026-05-06 03:57:50', 4, 0);
INSERT INTO public.rekap_stok_barang VALUES (54, 12, 0, 3, 0, 0, 0, '2026-05-06 03:57:08', '2026-05-06 03:57:50', 4, 0);
INSERT INTO public.rekap_stok_barang VALUES (48, 4, 0, 1, 0, 0, 0, '2026-05-06 03:40:00', '2026-05-06 03:40:00', 6, 0);
INSERT INTO public.rekap_stok_barang VALUES (25, 5, 2, 0, 0, 0, 0, '2026-05-05 09:44:21', '2026-05-06 01:20:55', 7, 0);
INSERT INTO public.rekap_stok_barang VALUES (28, 1, 0, 2, 0, 0, 0, '2026-05-06 01:20:55', '2026-05-06 01:20:55', 7, 0);
INSERT INTO public.rekap_stok_barang VALUES (55, 13, 0, 2, 0, 0, 0, '2026-05-06 04:00:31', '2026-05-06 04:00:31', 2, 0);
INSERT INTO public.rekap_stok_barang VALUES (17, 7, 0, 1, 0, 0, 0, '2026-05-05 08:28:27', '2026-05-05 08:28:27', 6, 0);
INSERT INTO public.rekap_stok_barang VALUES (38, 8, 0, 5, 0, 0, 0, '2026-05-06 03:07:59', '2026-05-06 03:13:16', 2, 0);
INSERT INTO public.rekap_stok_barang VALUES (26, 5, 4, 0, 0, 0, 0, '2026-05-05 09:44:21', '2026-05-06 01:22:35', 8, 0);
INSERT INTO public.rekap_stok_barang VALUES (33, 5, 1, 0, 0, 0, 0, '2026-05-06 02:57:16', '2026-05-06 03:13:51', 10, 0);
INSERT INTO public.rekap_stok_barang VALUES (18, 7, 0, 7, 0, 0, 0, '2026-05-05 08:28:27', '2026-05-05 08:38:14', 1, 0);
INSERT INTO public.rekap_stok_barang VALUES (19, 7, 0, 1, 0, 0, 0, '2026-05-05 08:39:28', '2026-05-05 08:39:28', 5, 0);
INSERT INTO public.rekap_stok_barang VALUES (29, 1, 0, 4, 0, 0, 0, '2026-05-06 01:21:56', '2026-05-06 01:22:35', 8, 0);
INSERT INTO public.rekap_stok_barang VALUES (20, 7, 0, 1, 0, 0, 0, '2026-05-05 08:39:28', '2026-05-05 08:39:28', 4, 0);
INSERT INTO public.rekap_stok_barang VALUES (40, 8, 0, 1, 0, 0, 0, '2026-05-06 03:13:51', '2026-05-06 03:13:51', 10, 0);
INSERT INTO public.rekap_stok_barang VALUES (21, 7, 0, 1, 0, 0, 0, '2026-05-05 08:40:12', '2026-05-05 08:40:12', 2, 0);
INSERT INTO public.rekap_stok_barang VALUES (32, 5, 2, 0, 0, 0, 0, '2026-05-06 02:57:16', '2026-05-06 03:14:28', 11, 0);
INSERT INTO public.rekap_stok_barang VALUES (41, 8, 0, 2, 0, 0, 0, '2026-05-06 03:14:28', '2026-05-06 03:14:28', 11, 0);
INSERT INTO public.rekap_stok_barang VALUES (30, 1, 0, 2, 0, 0, 0, '2026-05-06 01:23:25', '2026-05-06 01:24:11', 5, 0);
INSERT INTO public.rekap_stok_barang VALUES (39, 8, 0, 3, 0, 0, 0, '2026-05-06 03:08:37', '2026-05-06 03:15:04', 3, 0);
INSERT INTO public.rekap_stok_barang VALUES (27, 1, 0, 14, 0, 0, 0, '2026-05-06 01:18:03', '2026-05-06 01:24:50', 1, 0);
INSERT INTO public.rekap_stok_barang VALUES (34, 8, 0, 7, 0, 0, 0, '2026-05-06 03:03:10', '2026-05-06 03:15:44', 5, 0);
INSERT INTO public.rekap_stok_barang VALUES (45, 5, 1, 0, 0, 0, 0, '2026-05-06 03:33:01', '2026-05-06 03:41:28', 12, 0);
INSERT INTO public.rekap_stok_barang VALUES (36, 8, 0, 3, 0, 0, 0, '2026-05-06 03:05:06', '2026-05-06 03:16:18', 1, 0);
INSERT INTO public.rekap_stok_barang VALUES (50, 4, 0, 1, 0, 0, 0, '2026-05-06 03:41:28', '2026-05-06 03:41:28', 12, 0);
INSERT INTO public.rekap_stok_barang VALUES (56, 14, 0, 3, 0, 0, 0, '2026-05-06 04:03:09', '2026-05-06 04:03:09', 3, 0);
INSERT INTO public.rekap_stok_barang VALUES (23, 3, 0, 15, 0, 0, 0, '2026-05-05 09:14:04', '2026-05-05 09:20:46', 4, 0);
INSERT INTO public.rekap_stok_barang VALUES (47, 4, 0, 4, 0, 0, 0, '2026-05-06 03:37:16', '2026-05-06 03:42:46', 1, 0);
INSERT INTO public.rekap_stok_barang VALUES (35, 8, 0, 1, 0, 0, 0, '2026-05-06 03:03:10', '2026-05-06 03:03:10', 6, 0);
INSERT INTO public.rekap_stok_barang VALUES (49, 4, 0, 4, 0, 0, 0, '2026-05-06 03:40:56', '2026-05-06 03:43:18', 2, 0);
INSERT INTO public.rekap_stok_barang VALUES (16, 5, 15, 0, 0, 0, 0, '2026-05-05 08:22:54', '2026-05-06 04:03:09', 2, 0);
INSERT INTO public.rekap_stok_barang VALUES (57, 14, 0, 1, 0, 0, 0, '2026-05-06 04:03:09', '2026-05-06 04:03:09', 2, 0);
INSERT INTO public.rekap_stok_barang VALUES (31, 5, 1, 0, 0, 0, 0, '2026-05-06 02:57:16', '2026-05-06 03:07:02', 9, 0);
INSERT INTO public.rekap_stok_barang VALUES (37, 8, 0, 1, 0, 0, 0, '2026-05-06 03:07:02', '2026-05-06 03:07:02', 9, 0);
INSERT INTO public.rekap_stok_barang VALUES (12, 5, 4, 0, 0, 0, 0, '2026-05-05 08:22:54', '2026-05-06 03:53:43', 6, 0);
INSERT INTO public.rekap_stok_barang VALUES (51, 11, 0, 1, 0, 0, 0, '2026-05-06 03:53:43', '2026-05-06 03:53:43', 6, 0);
INSERT INTO public.rekap_stok_barang VALUES (42, 9, 0, 2, 0, 0, 0, '2026-05-06 03:20:53', '2026-05-06 03:20:53', 1, 0);
INSERT INTO public.rekap_stok_barang VALUES (13, 5, 31, 0, 0, 0, 0, '2026-05-05 08:22:54', '2026-05-06 03:54:21', 1, 0);
INSERT INTO public.rekap_stok_barang VALUES (43, 9, 0, 2, 0, 0, 0, '2026-05-06 03:21:32', '2026-05-06 03:21:32', 2, 0);
INSERT INTO public.rekap_stok_barang VALUES (52, 11, 0, 1, 0, 0, 0, '2026-05-06 03:54:21', '2026-05-06 03:54:21', 1, 0);
INSERT INTO public.rekap_stok_barang VALUES (44, 10, 0, 1, 0, 0, 0, '2026-05-06 03:24:55', '2026-05-06 03:24:55', 5, 0);
INSERT INTO public.rekap_stok_barang VALUES (24, 3, 0, 0, 0, 0, 0, '2026-05-05 09:21:23', '2026-05-21 01:36:00', 3, 0);
INSERT INTO public.rekap_stok_barang VALUES (58, 6, 0, 1, 0, 0, 0, '2026-05-21 01:42:55', '2026-05-21 01:42:55', 3, 0);
INSERT INTO public.rekap_stok_barang VALUES (14, 5, 17, 0, 0, 0, 0, '2026-05-05 08:22:54', '2026-05-06 03:54:54', 5, 0);
INSERT INTO public.rekap_stok_barang VALUES (53, 11, 0, 1, 0, 0, 0, '2026-05-06 03:54:54', '2026-05-06 03:54:54', 5, 0);
INSERT INTO public.rekap_stok_barang VALUES (22, 5, 9, 0, 0, 0, 0, '2026-05-05 09:01:28', '2026-05-23 06:53:24', 3, 0);
INSERT INTO public.rekap_stok_barang VALUES (59, 15, 0, 2, 0, 0, 0, '2026-05-23 06:53:24', '2026-05-23 06:53:24', 3, 0);


--
-- Data for Name: riwayat_status_barang; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: role_has_permissions; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.role_has_permissions VALUES (1, 3);
INSERT INTO public.role_has_permissions VALUES (68, 3);
INSERT INTO public.role_has_permissions VALUES (67, 3);
INSERT INTO public.role_has_permissions VALUES (69, 3);
INSERT INTO public.role_has_permissions VALUES (70, 3);
INSERT INTO public.role_has_permissions VALUES (71, 3);
INSERT INTO public.role_has_permissions VALUES (72, 3);
INSERT INTO public.role_has_permissions VALUES (73, 3);
INSERT INTO public.role_has_permissions VALUES (74, 3);
INSERT INTO public.role_has_permissions VALUES (64, 3);
INSERT INTO public.role_has_permissions VALUES (63, 3);
INSERT INTO public.role_has_permissions VALUES (65, 3);
INSERT INTO public.role_has_permissions VALUES (66, 3);
INSERT INTO public.role_has_permissions VALUES (1, 1);
INSERT INTO public.role_has_permissions VALUES (3, 1);
INSERT INTO public.role_has_permissions VALUES (2, 1);
INSERT INTO public.role_has_permissions VALUES (4, 1);
INSERT INTO public.role_has_permissions VALUES (5, 1);
INSERT INTO public.role_has_permissions VALUES (7, 1);
INSERT INTO public.role_has_permissions VALUES (6, 1);
INSERT INTO public.role_has_permissions VALUES (8, 1);
INSERT INTO public.role_has_permissions VALUES (9, 1);
INSERT INTO public.role_has_permissions VALUES (11, 1);
INSERT INTO public.role_has_permissions VALUES (10, 1);
INSERT INTO public.role_has_permissions VALUES (12, 1);
INSERT INTO public.role_has_permissions VALUES (13, 1);
INSERT INTO public.role_has_permissions VALUES (15, 1);
INSERT INTO public.role_has_permissions VALUES (14, 1);
INSERT INTO public.role_has_permissions VALUES (16, 1);
INSERT INTO public.role_has_permissions VALUES (17, 1);
INSERT INTO public.role_has_permissions VALUES (19, 1);
INSERT INTO public.role_has_permissions VALUES (18, 1);
INSERT INTO public.role_has_permissions VALUES (20, 1);
INSERT INTO public.role_has_permissions VALUES (21, 1);
INSERT INTO public.role_has_permissions VALUES (23, 1);
INSERT INTO public.role_has_permissions VALUES (22, 1);
INSERT INTO public.role_has_permissions VALUES (24, 1);
INSERT INTO public.role_has_permissions VALUES (25, 1);
INSERT INTO public.role_has_permissions VALUES (27, 1);
INSERT INTO public.role_has_permissions VALUES (26, 1);
INSERT INTO public.role_has_permissions VALUES (28, 1);
INSERT INTO public.role_has_permissions VALUES (29, 1);
INSERT INTO public.role_has_permissions VALUES (30, 1);
INSERT INTO public.role_has_permissions VALUES (32, 1);
INSERT INTO public.role_has_permissions VALUES (33, 1);
INSERT INTO public.role_has_permissions VALUES (35, 1);
INSERT INTO public.role_has_permissions VALUES (34, 1);
INSERT INTO public.role_has_permissions VALUES (36, 1);
INSERT INTO public.role_has_permissions VALUES (37, 1);
INSERT INTO public.role_has_permissions VALUES (39, 1);
INSERT INTO public.role_has_permissions VALUES (38, 1);
INSERT INTO public.role_has_permissions VALUES (40, 1);
INSERT INTO public.role_has_permissions VALUES (41, 1);
INSERT INTO public.role_has_permissions VALUES (42, 1);
INSERT INTO public.role_has_permissions VALUES (43, 1);
INSERT INTO public.role_has_permissions VALUES (44, 1);
INSERT INTO public.role_has_permissions VALUES (45, 1);
INSERT INTO public.role_has_permissions VALUES (46, 1);
INSERT INTO public.role_has_permissions VALUES (47, 1);
INSERT INTO public.role_has_permissions VALUES (48, 1);
INSERT INTO public.role_has_permissions VALUES (49, 1);
INSERT INTO public.role_has_permissions VALUES (50, 1);
INSERT INTO public.role_has_permissions VALUES (51, 1);
INSERT INTO public.role_has_permissions VALUES (52, 1);
INSERT INTO public.role_has_permissions VALUES (53, 1);
INSERT INTO public.role_has_permissions VALUES (55, 1);
INSERT INTO public.role_has_permissions VALUES (54, 1);
INSERT INTO public.role_has_permissions VALUES (56, 1);
INSERT INTO public.role_has_permissions VALUES (57, 1);
INSERT INTO public.role_has_permissions VALUES (58, 1);
INSERT INTO public.role_has_permissions VALUES (59, 1);
INSERT INTO public.role_has_permissions VALUES (60, 1);
INSERT INTO public.role_has_permissions VALUES (61, 1);
INSERT INTO public.role_has_permissions VALUES (62, 1);
INSERT INTO public.role_has_permissions VALUES (64, 1);
INSERT INTO public.role_has_permissions VALUES (63, 1);
INSERT INTO public.role_has_permissions VALUES (65, 1);
INSERT INTO public.role_has_permissions VALUES (66, 1);
INSERT INTO public.role_has_permissions VALUES (68, 1);
INSERT INTO public.role_has_permissions VALUES (67, 1);
INSERT INTO public.role_has_permissions VALUES (69, 1);
INSERT INTO public.role_has_permissions VALUES (70, 1);
INSERT INTO public.role_has_permissions VALUES (71, 1);
INSERT INTO public.role_has_permissions VALUES (72, 1);
INSERT INTO public.role_has_permissions VALUES (73, 1);
INSERT INTO public.role_has_permissions VALUES (74, 1);
INSERT INTO public.role_has_permissions VALUES (31, 1);
INSERT INTO public.role_has_permissions VALUES (75, 1);
INSERT INTO public.role_has_permissions VALUES (76, 1);
INSERT INTO public.role_has_permissions VALUES (77, 1);


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.roles VALUES (1, 'super-admin', 'web', '2025-08-06 02:20:09', '2025-08-06 02:20:09');
INSERT INTO public.roles VALUES (2, 'user', 'web', '2025-08-06 05:18:07', '2025-08-06 05:18:07');
INSERT INTO public.roles VALUES (3, 'developer', 'web', '2025-08-12 04:22:32', '2025-08-12 04:22:32');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.sessions VALUES ('eDl64MsXH5Ri9butVwklLTxUxnUYqbw9cxN4FNdF', NULL, '149.57.180.56', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQ01IWmdOc0RLVG5NeWdEZzBrTlc1UHpab1d2bkpqcEhaQUxIT1V1ciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDk6Imh0dHBzOi8vd3d3LmludmVudGFyaXMuaW50aXdpamF5YWt1c3VtYS5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768343906);
INSERT INTO public.sessions VALUES ('F6wJCz2LHUXPqXGUpmm16qfFCrIjo3CT69nh2ttv', NULL, '23.27.145.47', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiM0YyVFFXdllrRUxueW5NbDl0NFBWSEtvZjEyUUwxU21UUFhyREhwMyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768503643);
INSERT INTO public.sessions VALUES ('BsvHHokQt3sQhzXRSXssG1aaY9qS24520QBRUZWT', NULL, '198.235.24.98', 'Hello from Palo Alto Networks, find out more about our scans in https://docs-cortex.paloaltonetworks.com/r/1/Cortex-Xpanse/Scanning-activity', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiU1hNczhHZ3ZHYkFIN3l3VFNUVzVOQVJHZjJxeTd2WkoxeUFpZmRLVSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzk6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbSI7czo1OiJyb3V0ZSI7czo0OiJob21lIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1768540620);
INSERT INTO public.sessions VALUES ('c2k6jJEIwUYfAIkyjgR5Jn0A9eVZKjFflYj90MO7', NULL, '149.57.180.87', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoic1JUTGpudUVWODdQMXlBeFRad29OelNIYjFVZzE2NkNoV2NIa0xUbCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768774385);
INSERT INTO public.sessions VALUES ('s4YZjA26r79aZzo0gie6krxvHk2mFEzPkq7CAdZZ', NULL, '142.93.248.173', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWDA4MjZNZDlwamdvVHR0Y242c2dVT1RQVm9Jbkl6M2w4OGVlWUEybiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768966330);
INSERT INTO public.sessions VALUES ('5cPMr4hA7VwtWYlrHjigTbmDlrE33I71s9JHc6VH', NULL, '101.128.109.33', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSVZ4Y0E3U3FMM3JEcTFjSHFjQk43QjhoTWhhS3BweXdnSDgwZTkwRiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768983062);
INSERT INTO public.sessions VALUES ('ybQUfdHAuBgm8pj3N8w9KRTmkRBTYneQuAOLHieu', NULL, '23.27.145.74', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicm1zNVAzOXBUa0t0ODJUVk1wSk5xak9DR1FUSWpKV0pUaHo0bmxWVSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768343936);
INSERT INTO public.sessions VALUES ('UxAeAO80obTsYQxanOmKVEp0IFMH188bvLa9uTN7', NULL, '149.57.180.102', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTVBOdUg0Q0RtZlFMZ3k2NVN6dG55dlBGY0tRb1k5TkZKUXJmQXp6QSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDk6Imh0dHBzOi8vd3d3LmludmVudGFyaXMuaW50aXdpamF5YWt1c3VtYS5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768504073);
INSERT INTO public.sessions VALUES ('EfqktFioXZkqW6RkJeLOdeViyidNqBWET3gQ9ADc', NULL, '46.101.74.74', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicjlkeTlvMjUySURhU3BlZ3lIS1JSZVRJTk5QaXZVU1VMRGRDYlpGUyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDk6Imh0dHBzOi8vd3d3LmludmVudGFyaXMuaW50aXdpamF5YWt1c3VtYS5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768738661);
INSERT INTO public.sessions VALUES ('I3gmSHqLpZfWUwrhdur4SmDLzOgcANEe2YgHSkRM', NULL, '34.133.94.53', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiajBQaldYNmRqR0NLWk1wZkZzRmE0b1hBVm9uT2lRSGZQT0FOTFZISyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768810489);
INSERT INTO public.sessions VALUES ('SCBCEWIYx5hB3LELl9XzbBDHDulsqcpjByFkNOVO', NULL, '23.27.145.92', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoianVkcWVSTXprbWtLODQ5aXRaYmh1NGRMYVd5VlRCbVFiNlNjdnJNbSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDk6Imh0dHBzOi8vd3d3LmludmVudGFyaXMuaW50aXdpamF5YWt1c3VtYS5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768328270);
INSERT INTO public.sessions VALUES ('Fop145QED22GA1S2T2R7H07peWU1Yf2kh4XXEH3w', NULL, '146.190.163.112', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieXdvVUxyN3QwSGFrcFE5emg4SDNBb1RZaDZrS244Z0ttRFp1R1RoSSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768350560);
INSERT INTO public.sessions VALUES ('C58srPK8F8B2zUrMClQpXpHgoHrH6RYIwlEeO5Cw', NULL, '149.57.180.79', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiekl0WnJyWG12bmU4WktFcVVjdFAzN0hUQ2VkRml0c2FWZmljeE5JaiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDk6Imh0dHBzOi8vd3d3LmludmVudGFyaXMuaW50aXdpamF5YWt1c3VtYS5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768517196);
INSERT INTO public.sessions VALUES ('PCSbegYrEEXyR5xfy2vVHh9Fcuwi89TcGWtDBXnE', NULL, '23.27.145.53', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRkljTXJuMlM2OTJPZkU2bHBDbmd0d1RkOU1QNTZYaUc5dWd5aXJrZiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768765938);
INSERT INTO public.sessions VALUES ('RecH5R1RdOXOsvvi62F78xilQw9KaCDFDb5BhcCR', NULL, '15.156.84.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36 Assetnote/1.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUnZ1dXlPc2x0VHBjbmQyVFE0d1FKdTREQzdxdVVBTlVXY1FQUmZzdyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzk6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbSI7czo1OiJyb3V0ZSI7czo0OiJob21lIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1768843194);
INSERT INTO public.sessions VALUES ('Hc2v4WhiiVCMH7dAsIIrg0v9qzIOufQ5zf9o0vo8', NULL, '38.43.64.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMzZBUmtyNGZ1em55clVyQUlRMXBLU005SHk4cU4yN0lwenZsMGxSTCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768983043);
INSERT INTO public.sessions VALUES ('p6mW6cnjd1VYOYiPWob2CQ3tB41UvRTenHkFBSd8', NULL, '34.126.160.116', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSlRxVnBnb1BXSktTb3JxbmFseExhQU5LeEx6aTFXMkRxTTFIaGx2UiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768445036);
INSERT INTO public.sessions VALUES ('H9dBa16FNkzF0OTysHO4UnHS8ZX9UsuWEiSsCgEp', NULL, '23.27.145.109', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieDZRSjhnampvN3ROYkQxWHZEOG1ZZjdzY0ozMmFVbHRSbFo0ZjVJWiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768517556);
INSERT INTO public.sessions VALUES ('1iN6Ekh0gE1jkSjWpmMpc7lRYSdo5ON4nHDKnlE8', NULL, '149.57.180.9', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiY3B6cG4zbXpuQWsyYzNtMnpTVXFrdHVZT2xZQTdYYUtiblBmOXdlTSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDk6Imh0dHBzOi8vd3d3LmludmVudGFyaXMuaW50aXdpamF5YWt1c3VtYS5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768765943);
INSERT INTO public.sessions VALUES ('ATIBdhzpp5z98tJANTKfQenr8v9T0H1RCR2d80Ym', NULL, '54.251.219.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36 Assetnote/1.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMGo2bHlkUFVBWEFEVk5jNDZUNGlYSlhJTlFxZE5NVkcwWjJtZkVpZiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vd3d3LmludmVudGFyaXMuaW50aXdpamF5YWt1c3VtYS5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768844103);
INSERT INTO public.sessions VALUES ('CPWgdg59qdVXRtGVhx1TtLOYdrI9jwceLNtvyu14', NULL, '101.128.109.33', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiTnBvejVvajhvMGwyUW9tTDg4R2VFNFZES2ZNczVVa1U1QTZjSFd1WiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6MjI6IlBIUERFQlVHQkFSX1NUQUNLX0RBVEEiO2E6MDp7fX0=', 1768985334);
INSERT INTO public.sessions VALUES ('q3hm4BlYo7xPpVctElFDXOKaHweYxjiLsqBYpqFI', NULL, '159.65.199.224', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoienl5OTVMYUNpd2k3cE1BMVhIUkZlcnFUSVNqME0zV3hndndzbzF0TyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDk6Imh0dHBzOi8vd3d3LmludmVudGFyaXMuaW50aXdpamF5YWt1c3VtYS5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768460178);
INSERT INTO public.sessions VALUES ('DkhmLBkyMiQYnCbAhRdSaVOyUux5WLlBv0rM1BlQ', NULL, '167.99.89.219', 'Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVVVEaDRCc0ZsZ0lYdTFoamhFcHNhSWhjcEhnd0EzcFppMGh3QnlKeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzk6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbSI7czo1OiJyb3V0ZSI7czo0OiJob21lIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1768523799);
INSERT INTO public.sessions VALUES ('RQYOZojBVaoJ4RMTI5vy23KDIkm1E3ZmGC6DOVlA', NULL, '149.57.180.125', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQVZLSzBrbU9LRGIwZGhsVlhWem94SDdlRVRhQlV5WWlQQTFYZWtzdSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDk6Imh0dHBzOi8vd3d3LmludmVudGFyaXMuaW50aXdpamF5YWt1c3VtYS5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768774060);
INSERT INTO public.sessions VALUES ('iJsahke4vhAIXm4COzKtFwKbdQOf3WXRGvRSuMYN', NULL, '198.235.24.144', 'Hello from Palo Alto Networks, find out more about our scans in https://docs-cortex.paloaltonetworks.com/r/1/Cortex-Xpanse/Scanning-activity', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZU1STWZOMDlrMUV0QWtwazROMTRRM1YxSm1UZG1YNTI2eTJGWGZlVyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vd3d3LmludmVudGFyaXMuaW50aXdpamF5YWt1c3VtYS5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768924089);
INSERT INTO public.sessions VALUES ('8lW6QuOSjPOmEA8U8LEzFOG2xAopHK4c1VXRSDwo', NULL, '101.128.109.33', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQUt5bmN4VnRUaW9GTWRXUDZCZlZyMktzYjRZTXVaaFVWQWRTTmNOSSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHBzOi8vaW52ZW50YXJpcy5pbnRpd2lqYXlha3VzdW1hLmNvbS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768985173);


--
-- Data for Name: stock_opname; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: stock_opname_detail; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--



--
-- Data for Name: sub_lokasi; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.sub_lokasi VALUES (2, 3, 'Pendaftaran IGD', 'REG', NULL, NULL, '2026-05-06 04:24:28', '2026-05-06 04:24:58');
INSERT INTO public.sub_lokasi VALUES (3, 3, 'Pendaftaran RAJAL', 'REG', NULL, NULL, '2026-05-06 04:25:31', '2026-05-06 04:25:31');
INSERT INTO public.sub_lokasi VALUES (4, 3, 'MCU', 'M', NULL, NULL, '2026-05-06 04:36:30', '2026-05-06 04:36:30');
INSERT INTO public.sub_lokasi VALUES (5, 3, 'Farmasi IGD', 'FI', NULL, NULL, '2026-05-06 04:37:34', '2026-05-06 04:37:34');
INSERT INTO public.sub_lokasi VALUES (6, 3, 'Farmasi Graha', 'FG', NULL, NULL, '2026-05-06 04:38:03', '2026-05-06 04:38:03');
INSERT INTO public.sub_lokasi VALUES (7, 3, 'Pendaftaran Graha', 'PG', NULL, NULL, '2026-05-06 04:38:34', '2026-05-06 04:38:34');
INSERT INTO public.sub_lokasi VALUES (8, 1, 'Farmasi', 'FAR', NULL, NULL, '2026-05-06 04:48:17', '2026-05-06 04:48:17');
INSERT INTO public.sub_lokasi VALUES (9, 1, 'Pendaftaran RAJAL', 'PR', NULL, NULL, '2026-05-06 04:49:03', '2026-05-06 04:49:03');
INSERT INTO public.sub_lokasi VALUES (10, 1, 'Ruang Operasi', 'RO', NULL, NULL, '2026-05-06 05:00:00', '2026-05-06 05:00:00');
INSERT INTO public.sub_lokasi VALUES (11, 1, 'Ruang Radiologi', 'RR', NULL, NULL, '2026-05-06 05:00:33', '2026-05-06 05:00:33');
INSERT INTO public.sub_lokasi VALUES (12, 1, 'Ruang HD', 'HD', NULL, NULL, '2026-05-06 05:00:52', '2026-05-06 05:00:52');
INSERT INTO public.sub_lokasi VALUES (13, 8, 'Farmasi BPJS', 'FAR', NULL, NULL, '2026-05-06 05:06:46', '2026-05-06 05:06:46');
INSERT INTO public.sub_lokasi VALUES (15, 8, 'Pendaftaran RAJAL', 'PR', NULL, NULL, '2026-05-06 05:07:33', '2026-05-06 05:08:20');
INSERT INTO public.sub_lokasi VALUES (16, 8, 'Farmasi UMUM', 'FU', NULL, NULL, '2026-05-06 05:12:40', '2026-05-06 05:12:40');
INSERT INTO public.sub_lokasi VALUES (17, 8, 'Kios APM', 'KA', NULL, NULL, '2026-05-06 05:13:06', '2026-05-06 05:13:06');
INSERT INTO public.sub_lokasi VALUES (18, 8, 'Poli Mata', 'PM', NULL, NULL, '2026-05-06 05:13:31', '2026-05-06 05:13:31');
INSERT INTO public.sub_lokasi VALUES (19, 8, 'LABOR', 'LB', NULL, NULL, '2026-05-06 05:13:59', '2026-05-06 05:13:59');
INSERT INTO public.sub_lokasi VALUES (14, 8, 'Pendaftaran RANAP/UMUM', 'PR', NULL, NULL, '2026-05-06 05:07:11', '2026-05-06 05:15:07');
INSERT INTO public.sub_lokasi VALUES (20, 1, 'Farmasi IGD', 'FI', NULL, NULL, '2026-05-06 08:10:18', '2026-05-06 08:10:18');
INSERT INTO public.sub_lokasi VALUES (1, 1, 'Pendaftaran IGD', 'REG', NULL, NULL, '2026-01-11 16:11:03', '2026-05-06 08:10:46');
INSERT INTO public.sub_lokasi VALUES (21, 4, 'Farmasi', 'Fa', NULL, NULL, '2026-05-06 08:59:07', '2026-05-06 08:59:07');
INSERT INTO public.sub_lokasi VALUES (22, 4, 'Pendaftaran RAJAL', 'PR', NULL, NULL, '2026-05-06 08:59:32', '2026-05-06 08:59:32');
INSERT INTO public.sub_lokasi VALUES (23, 4, 'Admisi RANAP', 'AR', NULL, NULL, '2026-05-06 08:59:50', '2026-05-06 08:59:50');
INSERT INTO public.sub_lokasi VALUES (24, 4, 'LABOR', 'LAB', NULL, NULL, '2026-05-06 09:00:17', '2026-05-06 09:00:17');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: intiwij1_inventaris
--

INSERT INTO public.users VALUES (2, 'user', 'user@gmail.com', NULL, '$2y$12$/ovnMnbFqkQUbsuclApLBuftHgtHAqdlfWVBBumsRkv4d3DmcJk/W', NULL, '2025-08-06 05:20:12', '2025-08-06 05:20:12');
INSERT INTO public.users VALUES (3, 'developer', 'rikinurjaman@gmail.com', NULL, '$2y$12$RUuxMUKLTsAurtwLp9.ENeCEuKFnhz2aC0RlcAYzwuUqkS5e7YUdK', 'YcRvEvF8MSwy9tDjXLBwIm0kpUUhPhGWwcA9UCDTbtbiY847zlhz2GAS5SMs', '2025-08-12 04:36:15', '2025-08-12 04:37:19');
INSERT INTO public.users VALUES (1, 'admin', 'admin@gmail.com', NULL, '$2y$12$oJlWD055r6hZ.G5XZ/Ux0uzGCs0EAOclMyO4d/rYlU48lb1A3jupG', 'zQJ7p7zEHaHBTLs8UkmdhFTez2zST4MKWA7ry8B3asuuyWjuYSIBBusYOThr', '2025-07-30 13:32:22', '2025-07-30 13:32:22');


--
-- Name: asal_barang_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.asal_barang_id_seq', 3, true);


--
-- Name: barang_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.barang_id_seq', 192, true);


--
-- Name: barang_keluar_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.barang_keluar_detail_id_seq', 128, true);


--
-- Name: barang_keluar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.barang_keluar_id_seq', 68, true);


--
-- Name: barang_kembali_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.barang_kembali_detail_id_seq', 14, true);


--
-- Name: barang_kembali_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.barang_kembali_id_seq', 3, true);


--
-- Name: barang_masuk_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.barang_masuk_detail_id_seq', 192, true);


--
-- Name: barang_masuk_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.barang_masuk_id_seq', 24, true);


--
-- Name: barang_pemusnahan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.barang_pemusnahan_id_seq', 3, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: jenis_barang_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.jenis_barang_id_seq', 4, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: kategori_barang_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.kategori_barang_id_seq', 1, true);


--
-- Name: lokasi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.lokasi_id_seq', 15, true);


--
-- Name: merek_barang_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.merek_barang_id_seq', 7, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.migrations_id_seq', 31, true);


--
-- Name: model_barang_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.model_barang_id_seq', 12, true);


--
-- Name: mutasi_barang_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.mutasi_barang_id_seq', 338, true);


--
-- Name: pemusnahan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.pemusnahan_id_seq', 6, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.permissions_id_seq', 77, true);


--
-- Name: rak_barang_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.rak_barang_id_seq', 5, true);


--
-- Name: rekap_stok_barang_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.rekap_stok_barang_id_seq', 59, true);


--
-- Name: riwayat_status_barang_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.riwayat_status_barang_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: stock_opname_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.stock_opname_detail_id_seq', 7, true);


--
-- Name: stock_opname_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.stock_opname_id_seq', 3, true);


--
-- Name: sub_lokasi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.sub_lokasi_id_seq', 24, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: intiwij1_inventaris
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: asal_barang asal_barang_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.asal_barang
    ADD CONSTRAINT asal_barang_pkey PRIMARY KEY (id);


--
-- Name: barang_keluar_detail barang_keluar_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_keluar_detail
    ADD CONSTRAINT barang_keluar_detail_pkey PRIMARY KEY (id);


--
-- Name: barang_keluar barang_keluar_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_keluar
    ADD CONSTRAINT barang_keluar_pkey PRIMARY KEY (id);


--
-- Name: barang_kembali_detail barang_kembali_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_kembali_detail
    ADD CONSTRAINT barang_kembali_detail_pkey PRIMARY KEY (id);


--
-- Name: barang_kembali barang_kembali_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_kembali
    ADD CONSTRAINT barang_kembali_pkey PRIMARY KEY (id);


--
-- Name: barang_masuk_detail barang_masuk_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_masuk_detail
    ADD CONSTRAINT barang_masuk_detail_pkey PRIMARY KEY (id);


--
-- Name: barang_masuk barang_masuk_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_masuk
    ADD CONSTRAINT barang_masuk_pkey PRIMARY KEY (id);


--
-- Name: barang_pemusnahan barang_pemusnahan_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_pemusnahan
    ADD CONSTRAINT barang_pemusnahan_pkey PRIMARY KEY (id);


--
-- Name: barang barang_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang
    ADD CONSTRAINT barang_pkey PRIMARY KEY (id);


--
-- Name: barang barang_serial_number_unique; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang
    ADD CONSTRAINT barang_serial_number_unique UNIQUE (serial_number);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: jenis_barang jenis_barang_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.jenis_barang
    ADD CONSTRAINT jenis_barang_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: kategori_barang kategori_barang_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.kategori_barang
    ADD CONSTRAINT kategori_barang_pkey PRIMARY KEY (id);


--
-- Name: lokasi lokasi_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.lokasi
    ADD CONSTRAINT lokasi_pkey PRIMARY KEY (id);


--
-- Name: merek_barang merek_barang_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.merek_barang
    ADD CONSTRAINT merek_barang_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: model_barang model_barang_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.model_barang
    ADD CONSTRAINT model_barang_pkey PRIMARY KEY (id);


--
-- Name: model_has_permissions model_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type);


--
-- Name: model_has_roles model_has_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type);


--
-- Name: mutasi_barang mutasi_barang_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.mutasi_barang
    ADD CONSTRAINT mutasi_barang_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: pemusnahan pemusnahan_kode_pemusnahaan_unique; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.pemusnahan
    ADD CONSTRAINT pemusnahan_kode_pemusnahaan_unique UNIQUE (kode_pemusnahaan);


--
-- Name: pemusnahan pemusnahan_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.pemusnahan
    ADD CONSTRAINT pemusnahan_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: rak_barang rak_barang_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.rak_barang
    ADD CONSTRAINT rak_barang_pkey PRIMARY KEY (id);


--
-- Name: rekap_stok_barang rekap_stok_barang_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.rekap_stok_barang
    ADD CONSTRAINT rekap_stok_barang_pkey PRIMARY KEY (id);


--
-- Name: riwayat_status_barang riwayat_status_barang_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.riwayat_status_barang
    ADD CONSTRAINT riwayat_status_barang_pkey PRIMARY KEY (id);


--
-- Name: role_has_permissions role_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id);


--
-- Name: roles roles_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: stock_opname_detail stock_opname_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.stock_opname_detail
    ADD CONSTRAINT stock_opname_detail_pkey PRIMARY KEY (id);


--
-- Name: stock_opname stock_opname_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.stock_opname
    ADD CONSTRAINT stock_opname_pkey PRIMARY KEY (id);


--
-- Name: sub_lokasi sub_lokasi_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.sub_lokasi
    ADD CONSTRAINT sub_lokasi_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_asal_barang_created_at; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_asal_barang_created_at ON public.asal_barang USING btree (created_at DESC);


--
-- Name: idx_asal_barang_nama_lower; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_asal_barang_nama_lower ON public.asal_barang USING btree (lower((nama)::text));


--
-- Name: idx_barang_lokasi_status; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_barang_lokasi_status ON public.barang USING btree (lokasi_id, status);


--
-- Name: idx_barang_masuk_asal_barang_id; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_barang_masuk_asal_barang_id ON public.barang_masuk USING btree (asal_barang_id);


--
-- Name: idx_barang_masuk_tanggal; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_barang_masuk_tanggal ON public.barang_masuk USING btree (tanggal DESC);


--
-- Name: idx_barang_model; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_barang_model ON public.barang USING btree (model_id);


--
-- Name: idx_barang_model_id; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_barang_model_id ON public.barang USING btree (model_id);


--
-- Name: idx_barang_serial_lower; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_barang_serial_lower ON public.barang USING btree (lower((serial_number)::text));


--
-- Name: idx_bkbd_barang; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_bkbd_barang ON public.barang_kembali_detail USING btree (barang_id);


--
-- Name: idx_bkd_barang; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_bkd_barang ON public.barang_keluar_detail USING btree (barang_id);


--
-- Name: idx_bmd_barang; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_bmd_barang ON public.barang_masuk_detail USING btree (barang_id);


--
-- Name: idx_bmd_barang_id; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_bmd_barang_id ON public.barang_masuk_detail USING btree (barang_id);


--
-- Name: idx_bmd_barang_masuk_id; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_bmd_barang_masuk_id ON public.barang_masuk_detail USING btree (barang_masuk_id);


--
-- Name: idx_jenis_barang_created_at; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_jenis_barang_created_at ON public.jenis_barang USING btree (created_at DESC);


--
-- Name: idx_jenis_barang_kategori_id; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_jenis_barang_kategori_id ON public.jenis_barang USING btree (kategori_id);


--
-- Name: idx_jenis_barang_nama_lower; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_jenis_barang_nama_lower ON public.jenis_barang USING btree (lower((nama)::text));


--
-- Name: idx_kategori_created_at; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_kategori_created_at ON public.kategori_barang USING btree (created_at);


--
-- Name: idx_kategori_nama; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_kategori_nama ON public.kategori_barang USING btree (nama);


--
-- Name: idx_lokasi_created_at; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_lokasi_created_at ON public.lokasi USING btree (created_at DESC);


--
-- Name: idx_lokasi_is_gudang; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_lokasi_is_gudang ON public.lokasi USING btree (is_gudang);


--
-- Name: idx_lokasi_nama_lower; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_lokasi_nama_lower ON public.lokasi USING btree (lower((nama)::text));


--
-- Name: idx_merek_created_at; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_merek_created_at ON public.merek_barang USING btree (created_at);


--
-- Name: idx_merek_nama; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_merek_nama ON public.merek_barang USING btree (nama);


--
-- Name: idx_model_barang_jenis_id; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_model_barang_jenis_id ON public.model_barang USING btree (jenis_id);


--
-- Name: idx_model_barang_kategori_id; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_model_barang_kategori_id ON public.model_barang USING btree (kategori_id);


--
-- Name: idx_model_barang_merek_id; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_model_barang_merek_id ON public.model_barang USING btree (merek_id);


--
-- Name: idx_model_barang_nama; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_model_barang_nama ON public.model_barang USING btree (nama);


--
-- Name: idx_model_barang_nama_lower; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_model_barang_nama_lower ON public.model_barang USING btree (lower((nama)::text));


--
-- Name: idx_mutasi_barang; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_mutasi_barang ON public.mutasi_barang USING btree (barang_id);


--
-- Name: idx_mutasi_tanggal; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_mutasi_tanggal ON public.mutasi_barang USING btree (tanggal);


--
-- Name: idx_rak_barang_created_at; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_rak_barang_created_at ON public.rak_barang USING btree (created_at DESC);


--
-- Name: idx_rak_barang_lokasi_id; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_rak_barang_lokasi_id ON public.rak_barang USING btree (lokasi_id);


--
-- Name: idx_rak_barang_nama_lower; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_rak_barang_nama_lower ON public.rak_barang USING btree (lower((nama_rak)::text));


--
-- Name: idx_rekap_model_lokasi; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX idx_rekap_model_lokasi ON public.rekap_stok_barang USING btree (model_id, lokasi_id);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: model_has_permissions_model_id_model_type_index; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX model_has_permissions_model_id_model_type_index ON public.model_has_permissions USING btree (model_id, model_type);


--
-- Name: model_has_roles_model_id_model_type_index; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX model_has_roles_model_id_model_type_index ON public.model_has_roles USING btree (model_id, model_type);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: intiwij1_inventaris
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: barang barang_asal_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang
    ADD CONSTRAINT barang_asal_id_foreign FOREIGN KEY (asal_id) REFERENCES public.asal_barang(id) ON DELETE SET NULL;


--
-- Name: barang barang_jenis_barang_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang
    ADD CONSTRAINT barang_jenis_barang_id_foreign FOREIGN KEY (jenis_barang_id) REFERENCES public.jenis_barang(id) ON DELETE CASCADE;


--
-- Name: barang_keluar_detail barang_keluar_detail_barang_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_keluar_detail
    ADD CONSTRAINT barang_keluar_detail_barang_id_foreign FOREIGN KEY (barang_id) REFERENCES public.barang(id) ON DELETE CASCADE;


--
-- Name: barang_keluar_detail barang_keluar_detail_barang_keluar_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_keluar_detail
    ADD CONSTRAINT barang_keluar_detail_barang_keluar_id_foreign FOREIGN KEY (barang_keluar_id) REFERENCES public.barang_keluar(id) ON DELETE CASCADE;


--
-- Name: barang_keluar_detail barang_keluar_detail_sub_lokasi_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_keluar_detail
    ADD CONSTRAINT barang_keluar_detail_sub_lokasi_id_foreign FOREIGN KEY (sub_lokasi_id) REFERENCES public.sub_lokasi(id) ON DELETE SET NULL;


--
-- Name: barang_keluar barang_keluar_lokasi_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_keluar
    ADD CONSTRAINT barang_keluar_lokasi_id_foreign FOREIGN KEY (lokasi_id) REFERENCES public.lokasi(id) ON DELETE RESTRICT;


--
-- Name: barang_keluar barang_keluar_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_keluar
    ADD CONSTRAINT barang_keluar_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: barang_kembali_detail barang_kembali_detail_barang_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_kembali_detail
    ADD CONSTRAINT barang_kembali_detail_barang_id_foreign FOREIGN KEY (barang_id) REFERENCES public.barang(id) ON DELETE CASCADE;


--
-- Name: barang_kembali_detail barang_kembali_detail_barang_kembali_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_kembali_detail
    ADD CONSTRAINT barang_kembali_detail_barang_kembali_id_foreign FOREIGN KEY (barang_kembali_id) REFERENCES public.barang_kembali(id) ON DELETE CASCADE;


--
-- Name: barang_kembali barang_kembali_lokasi_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_kembali
    ADD CONSTRAINT barang_kembali_lokasi_id_foreign FOREIGN KEY (lokasi_id) REFERENCES public.lokasi(id) ON DELETE RESTRICT;


--
-- Name: barang_kembali barang_kembali_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_kembali
    ADD CONSTRAINT barang_kembali_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: barang barang_lokasi_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang
    ADD CONSTRAINT barang_lokasi_id_foreign FOREIGN KEY (lokasi_id) REFERENCES public.lokasi(id) ON DELETE SET NULL;


--
-- Name: barang_masuk barang_masuk_asal_barang_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_masuk
    ADD CONSTRAINT barang_masuk_asal_barang_id_foreign FOREIGN KEY (asal_barang_id) REFERENCES public.asal_barang(id) ON DELETE SET NULL;


--
-- Name: barang_masuk_detail barang_masuk_detail_barang_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_masuk_detail
    ADD CONSTRAINT barang_masuk_detail_barang_id_foreign FOREIGN KEY (barang_id) REFERENCES public.barang(id) ON DELETE CASCADE;


--
-- Name: barang_masuk_detail barang_masuk_detail_barang_masuk_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_masuk_detail
    ADD CONSTRAINT barang_masuk_detail_barang_masuk_id_foreign FOREIGN KEY (barang_masuk_id) REFERENCES public.barang_masuk(id) ON DELETE CASCADE;


--
-- Name: barang_masuk barang_masuk_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_masuk
    ADD CONSTRAINT barang_masuk_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: barang barang_model_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang
    ADD CONSTRAINT barang_model_id_foreign FOREIGN KEY (model_id) REFERENCES public.model_barang(id) ON DELETE CASCADE;


--
-- Name: barang_pemusnahan barang_pemusnahan_barang_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_pemusnahan
    ADD CONSTRAINT barang_pemusnahan_barang_id_foreign FOREIGN KEY (barang_id) REFERENCES public.barang(id) ON DELETE CASCADE;


--
-- Name: barang_pemusnahan barang_pemusnahan_pemusnahan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang_pemusnahan
    ADD CONSTRAINT barang_pemusnahan_pemusnahan_id_foreign FOREIGN KEY (pemusnahan_id) REFERENCES public.pemusnahan(id) ON DELETE CASCADE;


--
-- Name: barang barang_rak_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang
    ADD CONSTRAINT barang_rak_id_foreign FOREIGN KEY (rak_id) REFERENCES public.rak_barang(id);


--
-- Name: barang barang_sub_lokasi_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.barang
    ADD CONSTRAINT barang_sub_lokasi_id_foreign FOREIGN KEY (sub_lokasi_id) REFERENCES public.sub_lokasi(id) ON DELETE SET NULL;


--
-- Name: jenis_barang jenis_barang_kategori_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.jenis_barang
    ADD CONSTRAINT jenis_barang_kategori_id_foreign FOREIGN KEY (kategori_id) REFERENCES public.kategori_barang(id) ON DELETE CASCADE;


--
-- Name: model_barang model_barang_jenis_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.model_barang
    ADD CONSTRAINT model_barang_jenis_id_foreign FOREIGN KEY (jenis_id) REFERENCES public.jenis_barang(id) ON DELETE SET NULL;


--
-- Name: model_barang model_barang_kategori_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.model_barang
    ADD CONSTRAINT model_barang_kategori_id_foreign FOREIGN KEY (kategori_id) REFERENCES public.kategori_barang(id) ON DELETE CASCADE;


--
-- Name: model_barang model_barang_merek_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.model_barang
    ADD CONSTRAINT model_barang_merek_id_foreign FOREIGN KEY (merek_id) REFERENCES public.merek_barang(id) ON DELETE CASCADE;


--
-- Name: model_has_permissions model_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: model_has_roles model_has_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: mutasi_barang mutasi_barang_barang_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.mutasi_barang
    ADD CONSTRAINT mutasi_barang_barang_id_foreign FOREIGN KEY (barang_id) REFERENCES public.barang(id) ON DELETE CASCADE;


--
-- Name: mutasi_barang mutasi_barang_lokasi_asal_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.mutasi_barang
    ADD CONSTRAINT mutasi_barang_lokasi_asal_id_foreign FOREIGN KEY (lokasi_asal_id) REFERENCES public.lokasi(id) ON DELETE SET NULL;


--
-- Name: mutasi_barang mutasi_barang_lokasi_tujuan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.mutasi_barang
    ADD CONSTRAINT mutasi_barang_lokasi_tujuan_id_foreign FOREIGN KEY (lokasi_tujuan_id) REFERENCES public.lokasi(id) ON DELETE SET NULL;


--
-- Name: mutasi_barang mutasi_barang_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.mutasi_barang
    ADD CONSTRAINT mutasi_barang_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pemusnahan pemusnahan_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.pemusnahan
    ADD CONSTRAINT pemusnahan_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pemusnahan pemusnahan_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.pemusnahan
    ADD CONSTRAINT pemusnahan_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: rak_barang rak_barang_lokasi_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.rak_barang
    ADD CONSTRAINT rak_barang_lokasi_id_foreign FOREIGN KEY (lokasi_id) REFERENCES public.lokasi(id) ON DELETE CASCADE;


--
-- Name: rekap_stok_barang rekap_stok_barang_lokasi_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.rekap_stok_barang
    ADD CONSTRAINT rekap_stok_barang_lokasi_id_foreign FOREIGN KEY (lokasi_id) REFERENCES public.lokasi(id) ON DELETE CASCADE;


--
-- Name: rekap_stok_barang rekap_stok_barang_model_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.rekap_stok_barang
    ADD CONSTRAINT rekap_stok_barang_model_id_foreign FOREIGN KEY (model_id) REFERENCES public.model_barang(id) ON DELETE CASCADE;


--
-- Name: riwayat_status_barang riwayat_status_barang_barang_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.riwayat_status_barang
    ADD CONSTRAINT riwayat_status_barang_barang_id_foreign FOREIGN KEY (barang_id) REFERENCES public.barang(id) ON DELETE CASCADE;


--
-- Name: riwayat_status_barang riwayat_status_barang_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.riwayat_status_barang
    ADD CONSTRAINT riwayat_status_barang_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: role_has_permissions role_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: stock_opname stock_opname_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.stock_opname
    ADD CONSTRAINT stock_opname_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: stock_opname_detail stock_opname_detail_model_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.stock_opname_detail
    ADD CONSTRAINT stock_opname_detail_model_id_foreign FOREIGN KEY (model_id) REFERENCES public.model_barang(id) ON DELETE CASCADE;


--
-- Name: stock_opname_detail stock_opname_detail_stock_opname_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.stock_opname_detail
    ADD CONSTRAINT stock_opname_detail_stock_opname_id_foreign FOREIGN KEY (stock_opname_id) REFERENCES public.stock_opname(id) ON DELETE CASCADE;


--
-- Name: stock_opname stock_opname_lokasi_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.stock_opname
    ADD CONSTRAINT stock_opname_lokasi_id_foreign FOREIGN KEY (lokasi_id) REFERENCES public.lokasi(id) ON DELETE RESTRICT;


--
-- Name: stock_opname stock_opname_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.stock_opname
    ADD CONSTRAINT stock_opname_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: sub_lokasi sub_lokasi_lokasi_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: intiwij1_inventaris
--

ALTER TABLE ONLY public.sub_lokasi
    ADD CONSTRAINT sub_lokasi_lokasi_id_foreign FOREIGN KEY (lokasi_id) REFERENCES public.lokasi(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


-- Raw events. One row per pageview, click, scroll milestone, error, vital or
-- custom event. Everything the dashboard shows can be rebuilt from this table;
-- sessions and visitors below are rollups kept up to date on ingest so the
-- common queries do not have to scan it.
CREATE TABLE events (
  id      INTEGER PRIMARY KEY,
  ts      INTEGER NOT NULL,          -- ms since epoch, server corrected
  sid     TEXT    NOT NULL,
  vid     TEXT    NOT NULL,
  uid     TEXT,                      -- CodeAlgo user id once logged in
  type    TEXT    NOT NULL,          -- pageview click rage outbound scroll engage form error vital custom
  name    TEXT,                      -- custom event name, vital name, form id
  path    TEXT    NOT NULL,
  label   TEXT,                      -- visible text of a clicked element, error message
  el      TEXT,                      -- short css selector of a clicked element
  href    TEXT,
  x       REAL,                      -- click x as a fraction of page width (0..1)
  y       INTEGER,                   -- click y in page px from the top
  vw      INTEGER,                   -- viewport width at the time
  dh      INTEGER,                   -- document height at the time
  value   REAL,                      -- vital value, scroll %, engaged ms
  props   TEXT                       -- json, custom event properties
);
CREATE INDEX events_ts        ON events(ts);
CREATE INDEX events_type_ts   ON events(type, ts);
CREATE INDEX events_sid       ON events(sid, ts);
CREATE INDEX events_vid       ON events(vid, ts);
CREATE INDEX events_uid       ON events(uid, ts);
CREATE INDEX events_path_type ON events(path, type, ts);

-- One row per visit. A visit ends after 30 minutes without activity, decided
-- in the browser.
CREATE TABLE sessions (
  sid          TEXT PRIMARY KEY,
  vid          TEXT NOT NULL,
  uid          TEXT,
  role         TEXT,
  start_ts     INTEGER NOT NULL,
  end_ts       INTEGER NOT NULL,
  entry_path   TEXT,
  exit_path    TEXT,
  pageviews    INTEGER NOT NULL DEFAULT 0,
  events       INTEGER NOT NULL DEFAULT 0,
  clicks       INTEGER NOT NULL DEFAULT 0,
  engaged_ms   INTEGER NOT NULL DEFAULT 0,
  referrer     TEXT,                 -- referring host, empty for direct
  source       TEXT,                 -- utm_source, or derived from referrer
  medium       TEXT,
  campaign     TEXT,
  content      TEXT,
  term         TEXT,
  ref_code     TEXT,                 -- referral partner code (?ref=)
  country      TEXT,
  region       TEXT,
  city         TEXT,
  device       TEXT,                 -- mobile tablet desktop
  browser      TEXT,
  os           TEXT,
  screen       TEXT,
  lang         TEXT,
  tz           TEXT,
  internal     INTEGER NOT NULL DEFAULT 0,
  is_new       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX sessions_start ON sessions(start_ts);
CREATE INDEX sessions_vid   ON sessions(vid, start_ts);
CREATE INDEX sessions_uid   ON sessions(uid, start_ts);
CREATE INDEX sessions_end   ON sessions(end_ts);

-- One row per browser. first_ts is what retention cohorts are built on.
CREATE TABLE visitors (
  vid         TEXT PRIMARY KEY,
  uid         TEXT,
  role        TEXT,
  first_ts    INTEGER NOT NULL,
  last_ts     INTEGER NOT NULL,
  sessions    INTEGER NOT NULL DEFAULT 0,
  pageviews   INTEGER NOT NULL DEFAULT 0,
  first_path  TEXT,
  first_source TEXT,
  first_referrer TEXT,
  country     TEXT,
  device      TEXT,
  internal    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX visitors_first ON visitors(first_ts);
CREATE INDEX visitors_uid   ON visitors(uid);

-- Funnels saved from the dashboard.
CREATE TABLE funnels (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  steps      TEXT NOT NULL,          -- json array of {kind: "path"|"event", value}
  created_by TEXT,
  created_at INTEGER NOT NULL
);

-- Notes pinned to a date on the traffic chart ("launched Instagram ad",
-- "pricing page redesign") so a spike has an explanation next to it.
CREATE TABLE annotations (
  id         INTEGER PRIMARY KEY,
  ts         INTEGER NOT NULL,
  text       TEXT NOT NULL,
  created_by TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX annotations_ts ON annotations(ts);

INSERT INTO funnels (name, steps, created_by, created_at) VALUES
  ('Parent signup',
   '[{"kind":"path","value":"/"},{"kind":"path","value":"/pricing"},{"kind":"path","value":"/signup*"},{"kind":"event","value":"signup_completed"}]',
   'seed', 0),
  ('Educator interest',
   '[{"kind":"path","value":"/for-educators"},{"kind":"path","value":"/signup*"},{"kind":"event","value":"signup_completed"}]',
   'seed', 0);

-- DROP old tables (if any)
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS blocked_lists;

------------------------------------------------------------
-- USERS TABLE (UPDATED: email + username + password_hash)
------------------------------------------------------------
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

------------------------------------------------------------
-- FOCUS SESSIONS TABLE (same as your old)
------------------------------------------------------------
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    start_time TEXT,
    end_time TEXT,
    duration INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

------------------------------------------------------------
-- BLOCKED LISTS TABLE (same as your old)
------------------------------------------------------------
CREATE TABLE blocked_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sites TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

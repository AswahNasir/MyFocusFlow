# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import sqlite3
# from werkzeug.security import generate_password_hash, check_password_hash

# app = Flask(__name__)
# CORS(app)

# # ------------------------
# # Database helper function
# # ------------------------
# def get_db():
#     conn = sqlite3.connect("database.db")
#     conn.row_factory = sqlite3.Row
#     return conn


# # ------------------------
# # Registration Route
# # ------------------------
# @app.route('/register', methods=['POST'])
# def register():
#     data = request.get_json()
#     email = data.get("email")
#     username = data.get("username")
#     password = data.get("password")

#     if not email or not username or not password:
#         return jsonify({"error": "All fields are required"}), 400

#     conn = get_db()

#     # Check if email or username exists
#     user = conn.execute(
#         "SELECT * FROM users WHERE email = ? OR username = ?",
#         (email, username)
#     ).fetchone()

#     if user:
#         return jsonify({"error": "Email or username already exists"}), 400

#     # Save user
#     password_hash = generate_password_hash(password)

#     conn.execute(
#         "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
#         (email, username, password_hash)
#     )
#     conn.commit()
#     conn.close()

#     return jsonify({"message": "Registration successful!"}), 200


# # ------------------------
# # Login Route
# # ------------------------
# @app.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     username = data.get("username")
#     password = data.get("password")

#     conn = get_db()
#     user = conn.execute(
#         "SELECT * FROM users WHERE username = ?", (username,)
#     ).fetchone()

#     if not user:
#         return jsonify({"error": "User not found"}), 404

#     if not check_password_hash(user["password_hash"], password):
#         return jsonify({"error": "Incorrect password"}), 400

#     return jsonify({
#         "message": "Login successful!",
#         "user_id": user["id"]
#     }), 200

# @app.route('/start_session', methods=['POST'])
# def start_session():
#     data = request.get_json()
#     user_id = data.get("user_id")

#     conn = get_db()
#     conn.execute(
#         "INSERT INTO sessions (user_id, start_time) VALUES (?, datetime('now'))",
#         (user_id,)
#     )
#     conn.commit()
#     conn.close()

#     return jsonify({"message": "Session started"}), 200

# @app.route('/end_session', methods=['POST'])
# def end_session():
#     data = request.get_json()
#     user_id = data.get("user_id")

#     conn = get_db()

#     # Get the last open session
#     session = conn.execute(
#         "SELECT * FROM sessions WHERE user_id=? AND end_time IS NULL ORDER BY id DESC LIMIT 1",
#         (user_id,)
#     ).fetchone()

#     if not session:
#         return jsonify({"error": "No active session"}), 400

#     # Close the session
#     conn.execute(
#         """
#         UPDATE sessions 
#         SET end_time = datetime('now'),
#             duration = strftime('%s', 'now') - strftime('%s', start_time)
#         WHERE id = ?
#         """,
#         (session["id"],)
#     )

#     conn.commit()
#     conn.close()

#     return jsonify({"message": "Session ended"}), 200

# @app.route('/history/<int:user_id>', methods=['GET'])
# def history(user_id):
#     conn = get_db()
#     rows = conn.execute(
#         """
#         SELECT * FROM sessions
#         WHERE user_id = ?
#         AND start_time >= datetime('now', '-14 days')
#         ORDER BY id DESC
#         """,
#         (user_id,)
#     ).fetchall()
#     conn.close()

#     return jsonify([dict(row) for row in rows])


# # ------------------------
# # Run the server
# # ------------------------
# if __name__ == '__main__':
#     app.run(debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

DB_PATH = os.environ.get('DATABASE_PATH', 'database.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            start_time TEXT,
            end_time TEXT,
            duration INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
        
        CREATE TABLE IF NOT EXISTS blocked_lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            sites TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def home():
    return jsonify({
        "status": "ok",
        "message": "MyFocusFlow API is running! 🌸"
    })

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")

    if not email or not username or not password:
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ? OR username = ?",
        (email, username)
    ).fetchone()

    if user:
        conn.close()
        return jsonify({"error": "Email or username already exists"}), 400

    password_hash = generate_password_hash(password)
    conn.execute(
        "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
        (email, username, password_hash)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Registration successful!"}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ?", (username,)
    ).fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Incorrect password"}), 400

    return jsonify({
        "message": "Login successful!",
        "user_id": user["id"]
    }), 200

@app.route('/start_session', methods=['POST'])
def start_session():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    conn = get_db()
    conn.execute(
        "INSERT INTO sessions (user_id, start_time) VALUES (?, datetime('now'))",
        (user_id,)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Session started"}), 200

@app.route('/end_session', methods=['POST'])
def end_session():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    conn = get_db()
    session = conn.execute(
        "SELECT * FROM sessions WHERE user_id=? AND end_time IS NULL ORDER BY id DESC LIMIT 1",
        (user_id,)
    ).fetchone()

    if not session:
        conn.close()
        return jsonify({"error": "No active session"}), 400

    conn.execute(
        """
        UPDATE sessions 
        SET end_time = datetime('now'),
            duration = strftime('%s', 'now') - strftime('%s', start_time)
        WHERE id = ?
        """,
        (session["id"],)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Session ended"}), 200

@app.route('/history/<int:user_id>', methods=['GET'])
def history(user_id):
    conn = get_db()
    rows = conn.execute(
        """
        SELECT * FROM sessions
        WHERE user_id = ?
        AND start_time >= datetime('now', '-14 days')
        ORDER BY id DESC
        """,
        (user_id,)
    ).fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

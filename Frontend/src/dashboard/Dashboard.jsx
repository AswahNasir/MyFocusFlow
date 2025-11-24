// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function Dashboard() {
//   const user_id = localStorage.getItem("user_id");
//   const [active, setActive] = useState(false);
//   const [timer, setTimer] = useState(0);
//   const [history, setHistory] = useState([]);

//   // -----------------------------------
//   // Fetch 2-week history
//   // -----------------------------------
//   const loadHistory = async () => {
//     const res = await axios.get(`http://localhost:5000/history/${user_id}`);
//     setHistory(res.data);
//   };

//   useEffect(() => {
//     loadHistory();
//   }, []);

//   // -----------------------------------
//   // Timer logic
//   // -----------------------------------
//   useEffect(() => {
//     let interval = null;
//     if (active) {
//       interval = setInterval(() => setTimer((t) => t + 1), 1000);
//     }
//     return () => clearInterval(interval);
//   }, [active]);

//   // -----------------------------------
//   // Start session
//   // -----------------------------------
//   const startSession = async () => {
//     await axios.post("http://localhost:5000/start_session", { user_id });
//     setActive(true);
//     setTimer(0);
//   };

//   // -----------------------------------
//   // End session
//   // -----------------------------------
//   const endSession = async () => {
//     await axios.post("http://localhost:5000/end_session", { user_id });
//     setActive(false);
//     loadHistory();
//   };

//   // Helper to format seconds
//   const formatTime = (sec) => {
//     const h = Math.floor(sec / 3600);
//     const m = Math.floor((sec % 3600) / 60);
//     const s = sec % 60;
//     return `${h}h ${m}m ${s}s`;
//   };

//   return (
//     <div style={{ padding: "30px" }}>
//       <h2>Welcome to MyFocusFlow</h2>

//       <h3>Focus Timer</h3>
//       <h1>{formatTime(timer)}</h1>

//       {!active ? (
//         <button onClick={startSession}>Start Focus Session</button>
//       ) : (
//         <button onClick={endSession}>End Session</button>
//       )}

//       <hr style={{ margin: "40px 0" }} />

//       <h3>Your Last 14 Days</h3>

//       <table border="1" cellPadding="10" style={{ margin: "auto" }}>
//         <thead>
//           <tr>
//             <th>Date</th>
//             <th>Start</th>
//             <th>End</th>
//             <th>Duration (min)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {history.map((s) => (
//             <tr key={s.id}>
//               <td>{s.start_time?.split(" ")[0]}</td>
//               <td>{s.start_time}</td>
//               <td>{s.end_time || "–"}</td>
//               <td>{s.duration ? Math.floor(s.duration / 60) : "-"}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const user_id = localStorage.getItem("user_id");
  const username = localStorage.getItem("username") || "Friend";
  const navigate = useNavigate();
  
  const [active, setActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [history, setHistory] = useState([]);
  const [totalToday, setTotalToday] = useState(0);

  useEffect(() => {
    if (!user_id) {
      navigate("/");
    }
  }, [user_id, navigate]);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history/${user_id}`);
      setHistory(res.data);
      
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = res.data.filter(s => 
        s.start_time && s.start_time.startsWith(today)
      );
      const total = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      setTotalToday(Math.floor(total / 60));
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  useEffect(() => {
    if (user_id) {
      loadHistory();
    }
  }, [user_id]);

  useEffect(() => {
    let interval = null;
    if (active) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [active]);

  const startSession = async () => {
    try {
      await axios.post(`${API_URL}/start_session`, { user_id });
      setActive(true);
      setTimer(0);
    } catch (err) {
      console.error("Error starting session:", err);
    }
  };

  const endSession = async () => {
    try {
      await axios.post(`${API_URL}/end_session`, { user_id });
      setActive(false);
      loadHistory();
    } catch (err) {
      console.error("Error ending session:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    navigate("/");
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="container">
        <div 
          className="glass-card animate-fade-in"
          style={{
            padding: "20px 30px",
            marginBottom: "30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ fontSize: "2rem" }}>🌸</span>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.3rem" }}>MyFocusFlow</h2>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Welcome back, {username}! 💫
              </p>
            </div>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>
          <div className="glass-card animate-fade-in" style={{ padding: "25px", textAlign: "center", animationDelay: "0.1s" }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>⏱️</div>
            <h3 style={{ fontSize: "1rem", marginBottom: "5px" }}>Today's Focus</h3>
            <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {totalToday} min
            </p>
          </div>
          <div className="glass-card animate-fade-in" style={{ padding: "25px", textAlign: "center", animationDelay: "0.2s" }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📊</div>
            <h3 style={{ fontSize: "1rem", marginBottom: "5px" }}>Total Sessions</h3>
            <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {history.length}
            </p>
          </div>
          <div className="glass-card animate-fade-in" style={{ padding: "25px", textAlign: "center", animationDelay: "0.3s" }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🎯</div>
            <h3 style={{ fontSize: "1rem", marginBottom: "5px" }}>Status</h3>
            <p style={{ 
              fontSize: "1.2rem", 
              fontWeight: "600", 
              color: active ? "#4ade80" : "var(--text-secondary)" 
            }}>
              {active ? "Focusing... 🌟" : "Ready to focus"}
            </p>
          </div>
        </div>

        <div 
          className="glass-card animate-fade-in"
          style={{
            padding: "50px 30px",
            textAlign: "center",
            marginBottom: "30px",
            animationDelay: "0.4s"
          }}
        >
          <h2 style={{ marginBottom: "30px" }}>Focus Timer 🌷</h2>
          
          <div className={`timer-display ${active ? "animate-pulse" : ""}`} style={{ marginBottom: "30px" }}>
            {formatTime(timer)}
          </div>

          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            {!active ? (
              <button className="btn btn-primary" onClick={startSession}>
                Start Focus Session 🚀
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={endSession}>
                End Session ✨
              </button>
            )}
          </div>

          {active && (
            <p style={{ marginTop: "20px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Stay focused! You're doing amazing 💪
            </p>
          )}
        </div>

        <div 
          className="glass-card animate-fade-in"
          style={{ padding: "30px", animationDelay: "0.5s" }}
        >
          <h2 style={{ marginBottom: "20px" }}>Your Focus History 📅</h2>
          
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🌱</div>
              <p>No sessions yet. Start your first focus session!</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Started</th>
                    <th>Ended</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((s, index) => (
                    <tr key={s.id || index}>
                      <td>{s.start_time ? s.start_time.split(" ")[0] : "-"}</td>
                      <td>{formatDate(s.start_time)}</td>
                      <td>{s.end_time ? formatDate(s.end_time) : "In progress..."}</td>
                      <td>
                        {s.duration 
                          ? `${Math.floor(s.duration / 60)} min` 
                          : "-"
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ 
          textAlign: "center", 
          marginTop: "40px", 
          color: "var(--text-secondary)",
          fontSize: "0.9rem"
        }}>
          <p>Made with 💖 | MyFocusFlow © 2024</p>
        </div>
      </div>
    </div>
  );
}

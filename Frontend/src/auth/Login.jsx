// import { useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";


// export default function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [msg, setMsg] = useState("");
//   const navigate = useNavigate();


//   const handleLogin = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/login", {
//         username,
//         password,
//       });

//       localStorage.setItem("user_id", res.data.user_id);
//       setMsg("Login successful!");
//       navigate("/dashboard");

//     } catch (err) {
//       setMsg(err.response?.data?.error || "Login failed");
//     }
//   };

//   return (
//     <div style={{ padding: "40px" }}>
//       <h2>Login</h2>

//       <input 
//         placeholder="Username"
//         onChange={(e) => setUsername(e.target.value)}
//       /><br /><br />

//       <input 
//         placeholder="Password"
//         type="password"
//         onChange={(e) => setPassword(e.target.value)}
//       /><br /><br />

//       <button onClick={handleLogin}>Login</button>

//       <p>{msg}</p>

//       <p>
//         Don’t have an account? <Link to="/register">Create one</Link>
//       </p>
//     </div>
//   );
// }
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setMsg("Please fill in all fields");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("username", username);
      setMsg("Login successful! Redirecting...");
      setIsError(false);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setMsg(err.response?.data?.error || "Login failed. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div 
        className="glass-card animate-fade-in"
        style={{
          padding: "50px 40px",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center"
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🌸</div>
          <h1 style={{ marginBottom: "8px" }}>MyFocusFlow</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Stay focused, stay beautiful ✨
          </p>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <input
            className="input-field"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ marginBottom: "15px" }}
          />
          <input
            className="input-field"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: "100%",
            marginBottom: "20px",
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? "Logging in..." : "Login 💫"}
        </button>

        {msg && (
          <div className={`message ${isError ? "message-error" : "message-success"}`}>
            {msg}
          </div>
        )}

        <p style={{ marginTop: "25px", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ fontWeight: "600" }}>
            Create one 🌷
          </Link>
        </p>
      </div>
    </div>
  );
}
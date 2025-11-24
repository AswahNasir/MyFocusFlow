// import { useState } from "react";
// import axios from "axios";

// export default function Register() {
//   const [email, setEmail] = useState("");
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [msg, setMsg] = useState("");

//   const handleRegister = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/register", {
//         email,
//         username,
//         password,
//       });
//       setMsg(res.data.message);
//     } catch (err) {
//       setMsg(err.response?.data?.error || "Error registering");
//     }
//   };

//   return (
//     <div style={{ padding: "40px" }}>
//       <h2>Create Account</h2>

//       <input 
//         placeholder="Email"
//         type="email"
//         onChange={(e) => setEmail(e.target.value)}
//       /><br /><br />

//       <input 
//         placeholder="Username"
//         onChange={(e) => setUsername(e.target.value)}
//       /><br /><br />

//       <input 
//         placeholder="Password"
//         type="password"
//         onChange={(e) => setPassword(e.target.value)}
//       /><br /><br />

//       <button onClick={handleRegister}>Register</button>

//       <p>{msg}</p>
//     </div>
//   );
// }
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      setMsg("Please fill in all fields");
      setIsError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Passwords don't match");
      setIsError(true);
      return;
    }

    if (password.length < 4) {
      setMsg("Password must be at least 4 characters");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/register`, {
        email,
        username,
        password,
      });
      setMsg("Account created! Redirecting to login...");
      setIsError(false);
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.error || "Registration failed. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRegister();
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
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🌷</div>
          <h1 style={{ marginBottom: "8px" }}>Join FocusFlow</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Create your account and start focusing ✨
          </p>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <input
            className="input-field"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ marginBottom: "15px" }}
          />
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
            style={{ marginBottom: "15px" }}
          />
          <input
            className="input-field"
            placeholder="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleRegister}
          disabled={isLoading}
          style={{
            width: "100%",
            marginBottom: "20px",
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? "Creating account..." : "Create Account 🌸"}
        </button>

        {msg && (
          <div className={`message ${isError ? "message-error" : "message-success"}`}>
            {msg}
          </div>
        )}

        <p style={{ marginTop: "25px", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/" style={{ fontWeight: "600" }}>
            Login here 💫
          </Link>
        </p>
      </div>
    </div>
  );
}
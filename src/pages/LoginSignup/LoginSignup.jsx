import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import '../../styles.css';

const LoginSignup = () => {
    const [action,  setAction] = useState("Sign Up");
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (action === "Login") {
        // LOGIN
        try{
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: {
                    Authorization: "Basic " + btoa(`${username}:${pass}`),
                },
            });
            if (response.ok) {
                alert("Login successful!");
                localStorage.setItem("username", username);
                localStorage.setItem("password", pass);
                navigate('/recipeChat');
              }
               else {
                const data = await response.json();
                alert(data.detail || "Login failed.");
              }
        } catch (err){
            console.error(err);
            alert("Something went wrong during login.");
        }

            console.log("Logging in with:");
            console.log("Username:", username);
            console.log("Password:", pass);

        } else {
        // SIGN UP
            try {
                const response = await fetch("http://localhost:8000/register", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    username: username,
                    password: pass,
                  }),
                });
                if (response.ok) {
                    alert("Sign up successful!");
                    setAction("Login"); // switch to login form
                  } else {
                    const data = await response.json();
                    alert(data.detail || "Sign up failed.");
                  }
              } catch (err) {
                console.error(err);
                alert("Something went wrong during sign up.");
              }
            console.log("Signing up with:");
            console.log("Username:", username);
            console.log("Email:", email);
            console.log("Password:", pass);
        }
    }

    return (
        <div className="login-container">
            <div className="center-box">
                <h1 className="outfit-font" style={{ marginTop: "20px", color: "#EC6D53", fontSize: "65px", fontWeight: "600" }}>
                    FridgeChef
                </h1>
                <div className="header">
                    <div className="roboto-font">
                        <p style={{fontSize: "25px", marginTop: "30px"}}>{action}</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                <div className="inter-font">
                <div className="inputs">
                    <div className="input">
                        <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="Username"/>
                    </div>
                    {action==="Login"?<div></div>:<div className="input">
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email Id"/>
                    </div>}
                    <div className="input">
                        <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="Password"/>
                    </div>
                </div>
                {action==="Sign Up"?<div></div>:<div className="forgot-password">Lost Password? <span>Click Here!</span></div>}
                
                <div className="submit-container">
                    <div className={action==="Login"?"submit gray":"submit"} onClick={()=>{setAction("Sign Up")}}>
                        Sign Up
                    </div>
                    <div className={action==="Sign Up"?"submit gray":"submit"} onClick={()=>{setAction("Login")}}>
                        Login
                    </div>
                </div> 
                </div>
                <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    )
}

export default LoginSignup
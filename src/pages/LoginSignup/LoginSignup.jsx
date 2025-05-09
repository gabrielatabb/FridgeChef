import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import '../../styles.css';

const LoginSignup = () => {
    const [action, setAction] = useState("Sign Up");
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setErrorMessage('');

        if (action === "Login") {
            try {
                const response = await fetch("http://localhost:8000/login", {
                    method: "POST",
                    headers: {
                        Authorization: "Basic " + btoa(`${username}:${pass}`),
                    },
                });
                if (response.ok) {
                    localStorage.setItem("username", username);
                    localStorage.setItem("password", pass);
                    setErrorMessage('')
                    navigate('/recipeChat');
                } else {
                    const data = await response.json();
                    setErrorMessage(data.detail || "Invalid username or password.");
                }
            } catch (err) {
                console.error(err);
                setErrorMessage("Invalid username or password.");
            }
        } else {
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
                    setErrorMessage('')
                    setAction("Login");
                } else {
                    const data = await response.json();
                    setErrorMessage(data.detail || "Sign up failed.");
                }
            } catch (err) {
                setErrorMessage("Sign up failed.");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="center-box">
                <h1 className="outfit-font" style={{ marginTop: "20px", color: "#EC6D53", fontSize: "65px", fontWeight: "600" }}>
                    FridgeChef
                </h1>
                <div className="header">
                    <div className="roboto-font">
                        <p style={{ fontSize: "25px", marginTop: "30px" }}>{action}</p>
                    </div>
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="inter-font">
                        <div className="inputs">
                            <div className="input">
                                <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="Username" />
                            </div>
                            {action === "Login" ? null : (
                                <div className="input">
                                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email Id" />
                                </div>
                            )}
                            <div className="input">
                                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="Password" />
                            </div>
                        </div>

                        {action === "Sign Up" ? null : (
                            <div className="forgot-password">Lost Password? <span>Click Here!</span></div>
                        )}

                        {errorMessage && <div className="error-message">{errorMessage}</div>}

                        <div className="submit-container">
                            <div
                                className={action === "Sign Up" ? "submit" : "submit gray"}
                                onClick={() => {
                                    if (action === "Sign Up") {
                                        handleSubmit();
                                    } else {
                                        setAction("Sign Up");
                                    }
                                }}
                            >
                                Sign Up
                            </div>
                            <div
                                className={action === "Login" ? "submit" : "submit gray"}
                                onClick={() => {
                                    if (action === "Login") {
                                        handleSubmit();
                                    } else {
                                        setAction("Login");
                                    }
                                }}
                            >
                                Login
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginSignup;

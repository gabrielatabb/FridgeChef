import React, { useState } from "react";
import './LoginSignup.css';
import '../../styles.css';

const LoginSignup = () => {

    const [action,setAction] = useState("Sign Up");

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
                <div className="inter-font">
                <div className="inputs">
                    {action==="Login"?<div></div>:<div className="input">
                        <input type="text" placeholder="Name"/>
                    </div>}
                    <div className="input">
                        <input type="email" placeholder="Email Id"/>
                    </div>
                    <div className="input">
                        <input type="password" placeholder="Password"/>
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
            </div>
        </div>
    )
}

export default LoginSignup
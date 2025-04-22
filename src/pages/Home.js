import "../styles.css";

export default function Home() {
    const handleButtonClick = () => {
        window.location.href = "/login";
    };

    return (
        <div className="home-container">
            <div className="flex-container">
                <div className="column outfit-font ">
                    <h1 style={{ color: "white", fontSize: "80px", fontWeight: "600" }}>
                        FridgeChef
                    </h1>
                    <div style={{ color: "#EC6D53", fontSize: "22px", maxWidth: "100%" }}>
                        <p style={{marginTop: "20px"}}>Save money, save food, save time.</p>
                        <p> A smarter way to eat for college students</p>
                    </div>
                    <button className="outfit-font "
                        style={{
                            backgroundColor: "#9AC2D8",
                            color: "#3E5B7F",
                            padding: "10px 20px",
                            fontSize: "40px",
                            border: "none",
                            borderRadius: "50px",
                            cursor: "pointer",
                            marginTop: "30px"
                        }}
                        onClick={handleButtonClick}
                    >
                        Get Started
                    </button>
                </div>

                <div className="column">
                <video
                        src="/FridgeChef-Demo.mov"
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                            width: "150%",
                            maxWidth: "12000px",
                            height: "auto",
                            borderRadius: "20px",
                            boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)"
                        }}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </div>
    );
}

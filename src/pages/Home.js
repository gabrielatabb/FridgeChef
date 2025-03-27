import "../styles.css";

export default function Home() {
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
                </div>

                <div className="column">
                    <p>This portal has been created to provide 
                        well-thought and well-explained solutions 
                        for selected questions.
                    </p>
                    <p>Our team includes Sandeep Jain, Vaibhav Bajpai, 
                        Shikhar Goel, Dharmesh Singh, and Shubham 
                        Baranwal, all passionate developers and engineers.
                    </p>
                </div>
            </div>
        </div>
    );
}

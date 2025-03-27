import "../styles.css";

export default function Home() {
    return (
        <div className="home-container">
            <div className="flex-container">
                <div className="column">
                    <h1 style={{ color: "red", fontSize: "36px", fontWeight: "bold" }}>
                        FridgeChef
                    </h1>
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

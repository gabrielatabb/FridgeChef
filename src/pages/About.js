export default function About() {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: 'auto', fontFamily: 'Segoe UI, sans-serif', lineHeight: '1.7' }}>
        <h1 style={{ color: '#EC6D53', fontSize: '40px', marginBottom: '20px' }}>About FridgeChef</h1>
        
        <p>
          <strong>FridgeChef</strong> is an AI-powered meal planning assistant designed specifically with students in mind.
          The idea was born out of a common struggle: college students buying groceries without a plan and watching ingredients go to waste.
          Our goal is to help students make smarter use of what they already have in their fridge — saving time, money, and stress.
        </p>
  
        <p>
          By analyzing ingredients saved by each user, FridgeChef generates personalized, easy-to-follow recipes using OpenAI’s GPT-4.
          The platform encourages healthier eating habits while significantly cutting down on food waste.
        </p>
  
        <p>
          Whether you're a cooking novice or a seasoned student chef, FridgeChef helps take the guesswork out of your meals —
          making it easier to focus on academics, social life, and everything in between.
        </p>
  
        <p>
          This project is developed by the <strong>Dreyfoos Children</strong> team:
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li><strong>Remington Ewing</strong> – Back-end, AI integration</li>
            <li><strong>Gabriela Taboda</strong> – Front-end, Scrum Master</li>
          </ul>
        </p>
  
        <p style={{ marginTop: '20px' }}>
          You can follow our progress and view the code on GitHub:
          <br />
          <a href="https://github.com/gabrielatabb/FridgeChef" target="_blank" rel="noopener noreferrer">
            github.com/gabrielatabb/FridgeChef
          </a>
        </p>
      </div>
    );
  }
  
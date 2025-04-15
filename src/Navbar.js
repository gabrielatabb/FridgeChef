export default function Navbar() {
    return(
        <nav className="nav">
            <a href="/" className="site-title">FridgeChef</a>
            <ul>
                <li>
                    <a href="/Login">Login</a>
                </li>    
                <li>
                    <a href="/About">About</a>
                </li>
            </ul>    
        </nav>
    )
}
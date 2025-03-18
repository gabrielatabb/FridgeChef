export default function Navbar() {
    return(
        <nav className="nav">
            <a href="/" className="site-title">FridgeChef</a>
            <ul>
                <li>
                    <a href="/pricing">pricing</a>
                </li>    
                <li>
                    <a href="/about">about</a>
                </li>
            </ul>    
        </nav>
    )
}
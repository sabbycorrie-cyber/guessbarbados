/* Authentication component */
import {useState} from "react";

function Login({ setUser }) {

    /* Form state */
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLogin, setIsLogin] = useState(true);

    /* Form form submission */
    const handleSubmit = (e) => {
        
        // Stop default form reload
        e.preventDefault();

        // Validate required fields
        if (!username || !password) {
            alert("Please fill in both fields");
        return;
        }

        /* Login flow */
        if (isLogin) {
        
        // Retrieve saved user
        const storedUser = JSON.parse(localStorage.getItem(username));

        // Verify login credentials
        if (storedUser && storedUser.password === password) {
                
                //Set active user
                setUser(storedUser);
                } else {
                    alert("Incorrect username or password");
                }
        }

        /* Sign up flow */
        else {

            // Create user data
            const newUser = { username, password, email };

            // Store user locally
            localStorage.setItem(username, JSON.stringify(newUser));

            // Start user session
            setUser(newUser);
        }
    };

    /* Render login form */
    return (
        <div className="auth-container">
            <div className="auth-card">
            <h2>{isLogin ? "Login" : "Sign Up"}</h2>

            <form onSubmit={handleSubmit} className="form">
                <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {!isLogin && (
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                )}

                <button type="submit">
                    {isLogin ? "Login" : "Sign Up"}
                </button>
            </form>

            <p onClick={() => setIsLogin(!isLogin)}>

                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </p>
            </div>
        </div>
    );
}

export default Login;
/* Authentication component */
import {useState} from "react";
import LoadingScreen from "./LoadingScreen";
import BackgroundIntro from "../assets/intro-bg-blur.png"; 

function Login({ setUser }) {

    /* Form state */
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

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
                setLoading(true);

                setTimeout(() => {
                    setUser(storedUser);
                    setLoading(false);
                }, 3000);
            } else {
                alert("Incorrect username or password");
            }
        } else {
            /* Sign up flow */
            const newUser = { username, password, email };
            localStorage.setItem(username, JSON.stringify(newUser));

            setLoading(true);

            setTimeout(() => {
                setUser(newUser);
                setLoading(false);
            }, 3000);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    /* Render login form */
    return (
        <div className="auth-container"
                        style={{
                            backgroundImage: `url(${BackgroundIntro})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            minHeight: "100vh",
                        }}
                        >
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
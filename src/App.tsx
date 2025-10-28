import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx"; // Add this import
import IsLoggedIn from "./IsLoggedIn.tsx";
import Profile_editor from "./pages/profile-editor.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <IsLoggedIn>
                        <HomePage />
                    </IsLoggedIn>
                }
                />
                <Route path="/profile_editor" element={<Profile_editor />}/>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} /> {/* Add this route */}
            </Routes>
        </Router>
    );
}

export default App;
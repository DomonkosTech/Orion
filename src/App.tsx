import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx"; // Add this import
import IsLoggedIn from "./IsLoggedIn.tsx";
import EditUserProfile from "./pages/EditUserProfile.tsx";

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
                <Route path="/EditUserProfile" element={<EditUserProfile />}/>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} /> {/* Add this route */}
            </Routes>
        </Router>
    );
}

export default App;
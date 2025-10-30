import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import UserLoginPage from "./pages/UserLoginPage.tsx";
import UserRegisterPage from "./pages/UserRegisterPage.tsx"; // Add this import
import IsLoggedIn from "./IsLoggedIn.tsx";
import EditUserProfile from "./pages/EditUserProfile.tsx";
import ComapnyRegisterPage from "./pages/CompanyRegisterPage.tsx";
import CompanyLoginPage from "./pages/CompanyLoginPage.tsx";

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
                <Route path="/CompanyLoginPage" element={<CompanyLoginPage />}/>
                <Route path="/ComapnyRegisterPage" element={<ComapnyRegisterPage />}/>
                <Route path="/EditUserProfile" element={<EditUserProfile />}/>
                <Route path="/login" element={<UserLoginPage />} />
                <Route path="/register" element={<UserRegisterPage />} /> {/* Add this route */}
            </Routes>
        </Router>
    );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import UserLoginPage from "./pages/UserLoginPage.tsx";
import UserRegisterPage from "./pages/UserRegisterPage.tsx"; // Add this import
import IsLoggedIn from "./IsLoggedIn.tsx";
import EditUserProfile from "./pages/EditUserProfile.tsx";
import CompanyRegisterPage from "./pages/CompanyRegisterPage.tsx";
import CompanyLoginPage from "./pages/CompanyLoginPage.tsx";
import EditCompanyProfile from "./pages/EditCompanyProfile.tsx";

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
                <Route path="/CompanyRegisterPage" element={<CompanyRegisterPage />}/>
                <Route path="/EditUserProfile" element={<EditUserProfile />}/>
                <Route path="/EditCompanyProfile" element={<EditCompanyProfile />}/>
                <Route path="/UserLoginPage" element={<UserLoginPage />} />
                <Route path="/UserRegisterPage" element={<UserRegisterPage />} /> {/* Add this route */}
            </Routes>
        </Router>
    );
}

export default App;
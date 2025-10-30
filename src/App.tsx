import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import UserLoginPage from "./pages/UserLoginPage.tsx";
import UserRegisterPage from "./pages/UserRegisterPage.tsx";
import IsLoggedIn from "./IsLoggedIn.tsx";
import EditUserProfile from "./pages/EditUserProfile.tsx";
import CompanyRegisterPage from "./pages/CompanyRegisterPage.tsx";
import CompanyLoginPage from "./pages/CompanyLoginPage.tsx";
import EditCompanyProfile from "./pages/EditCompanyProfile.tsx";

function App() {
    return (
        <Router>
            <Routes>
                {/* Védett útvonalak */}
                <Route
                    path="/"
                    element={
                        <IsLoggedIn>
                            <HomePage />
                        </IsLoggedIn>
                    }
                />
                <Route
                    path="/EditUserProfile"
                    element={
                        <IsLoggedIn>
                            <EditUserProfile />
                        </IsLoggedIn>
                    }
                />
                <Route
                    path="/EditCompanyProfile"
                    element={
                        <IsLoggedIn>
                            <EditCompanyProfile />
                        </IsLoggedIn>
                    }
                />

                {/* Nyilvános oldalak */}
                <Route path="/CompanyLoginPage" element={<CompanyLoginPage />} />
                <Route path="/CompanyRegisterPage" element={<CompanyRegisterPage />} />
                <Route path="/UserLoginPage" element={<UserLoginPage />} />
                <Route path="/UserRegisterPage" element={<UserRegisterPage />} />
            </Routes>
        </Router>
    );
}

export default App;

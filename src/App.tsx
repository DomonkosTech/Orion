import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserHomePage from "./pages/UserHomePage.tsx";
import UserLoginPage from "./pages/UserLoginPage.tsx";
import UserRegisterPage from "./pages/UserRegisterPage.tsx";
import IsLoggedIn from "./IsLoggedIn.tsx";
import EditUserProfile from "./pages/EditUserProfile.tsx";
import CompanyRegisterPage from "./pages/CompanyRegisterPage.tsx";
import CompanyLoginPage from "./pages/CompanyLoginPage.tsx";
import EditCompanyProfile from "./pages/EditCompanyProfile.tsx";
import AddJob from "./pages/AddJob.tsx";
import CompanyHomePage from "./pages/CompanyHomePage.tsx";

function App() {
    return (
        <Router>
            <Routes>
                {/* 🔒 Csak USER típusú felhasználóknak */}
                <Route
                    path="/"
                    element={
                        <IsLoggedIn mode="user">
                            <UserHomePage />
                        </IsLoggedIn>
                    }
                />
                <Route
                    path="/EditUserProfile"
                    element={
                        <IsLoggedIn mode="user">
                            <EditUserProfile />
                        </IsLoggedIn>
                    }
                />

                {/* 🏢 Csak COMPANY típusú felhasználóknak */}
                <Route
                    path="/company"
                    element={
                        <IsLoggedIn mode="company">
                            <CompanyHomePage/>
                        </IsLoggedIn>
                    }
                />
                <Route
                    path="/EditCompanyProfile"
                    element={
                        <IsLoggedIn mode="company">
                            <EditCompanyProfile />
                        </IsLoggedIn>
                    }
                />
                <Route 
                    path="/AddJob" 
                    element={
                        <IsLoggedIn mode="company">
                            <AddJob />
                        </IsLoggedIn>
                    }
                />

                {/* 🚫 Csak kijelentkezve elérhető oldalak (GUEST) */}
                <Route
                    path="/UserLoginPage"
                    element={
                        <IsLoggedIn mode="guest">
                            <UserLoginPage />
                        </IsLoggedIn>
                    }
                />
                <Route
                    path="/UserRegisterPage"
                    element={
                        <IsLoggedIn mode="guest">
                            <UserRegisterPage />
                        </IsLoggedIn>
                    }
                />
                <Route
                    path="/CompanyLoginPage"
                    element={
                        <IsLoggedIn mode="guest">
                            <CompanyLoginPage />
                        </IsLoggedIn>
                    }
                />
                <Route
                    path="/CompanyRegisterPage"
                    element={
                        <IsLoggedIn mode="guest">
                            <CompanyRegisterPage />
                        </IsLoggedIn>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

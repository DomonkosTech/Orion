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
                {/* 🔒 Csak bejelentkezve elérhető oldalak */}
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

                {/* 🚫 Csak kijelentkezve elérhető oldalak */}
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

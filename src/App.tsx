import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserHomePage from "./features/user/HomePage/UserHomePage.tsx";
import UserLoginPage from "./features/user/LoginPage/UserLoginPage.tsx";
import UserRegisterPage from "./features/user/RegisterPage/UserRegisterPage.tsx";
import IsLoggedIn from "./IsLoggedIn.tsx";
import EditUserProfile from "./features/user/EditProfile/EditUserProfile.tsx";
import CompanyRegisterPage from "./features/company/RegisterPage/CompanyRegisterPage.tsx";
import CompanyLoginPage from "./features/company/LoginPage/CompanyLoginPage.tsx";
import EditCompanyProfile from "./features/company/EditProfile/EditCompanyProfile.tsx";
import AddJob from "./features/job/AddJob.tsx";
import CompanyHomePage from "./features/company/HomePage/CompanyHomePage.tsx";
import EditJob from "./features/job/EditJob.tsx";
import ListJobs from "./features/job/list_jobs.tsx";
import ShowJob from "./features/job/ShowJob.tsx";
import JobApplication from "./features/user/JobApplications/JobApplication.tsx"

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
                    path="/JobApplication"
                    element={
                        <IsLoggedIn mode="user">
                            <JobApplication />
                        </IsLoggedIn>
                    }
                />
                <Route
                    path="/job/show/:id"
                    element={
                        <IsLoggedIn mode="user">
                            <ShowJob/>
                        </IsLoggedIn>
                    }
                />

                <Route
                    path="/listjobs"
                    element={
                        <IsLoggedIn mode="user">
                            <ListJobs />
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
                    path="/company/edit/:id"
                    element={
                        <IsLoggedIn mode="company">
                            <EditJob/>
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

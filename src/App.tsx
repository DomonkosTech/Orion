import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserHomePage from "./features/user/HomePage/UserHomePage.tsx";
import UserLoginPage from "./features/user/LoginPage/UserLoginPage.tsx";
import UserRegisterPage from "./features/user/RegisterPage/UserRegisterPage.tsx";
import IsLoggedIn from "./IsLoggedIn.tsx";
import UserEditProfile from "./features/user/EditProfile/UserEditProfile.tsx";
import CompanyRegisterPage from "./features/company/RegisterPage/CompanyRegisterPage.tsx";
import CompanyLoginPage from "./features/company/LoginPage/CompanyLoginPage.tsx";
import CompanyEditProfile from "./features/company/EditProfile/CompanyEditProfile.tsx";
import AddJob from "./features/company/CompanyJobs/AddJob.tsx";
import CompanyHomePage from "./features/company/HomePage/CompanyHomePage.tsx";
import ShowListedJobs from "./features/company/ShowListedJobs/ShowListedJobs.tsx";
import EditJob from "./features/company/CompanyJobs/EditJob.tsx";
import ListJobs from "./features/user/UserJobs/ListAllJobs/ListJobs.tsx";
import ShowJob from "./features/user/UserJobs/ShowSelectedJob/ShowJob.tsx";
import JobApplications from "./features/user/JobApplications/JobApplications.tsx";
import UploadResume from "./features/user/UploadResume/UploadResume.tsx";
import ApplicantTrackingSystem from "./features/company/CompanyJobs/ApplicantTrackingSystem.tsx";
import PublicHomePage from "./features/public/PublicHomePage/PublicHomePage.tsx";
import ShowEmployees from "./features/company/ShowEmployees/ShowEmployees.tsx";
import UserVerify from "./features/user/RegisterPage/UserVerify.tsx";
import UserSendVerify from "./features/user/RegisterPage/UserSendVerify.tsx";
import CompanyVerify from "./features/company/RegisterPage/CompanyVerify.tsx";
import CompanySendVerify from "./features/company/RegisterPage/CompanySendVerify.tsx";
import UserPasswordResetRequest from "./features/user/EditProfile/UserPasswordResetRequest.tsx";
import UserPasswordResetSave from "./features/user/EditProfile/UserPasswordResetSave.tsx";
import CompanyPasswordResetRequest from "./features/company/EditProfile/CompanyPasswordResetRequest.tsx";
import CompanyPasswordResetSave from "./features/company/EditProfile/CompanyPasswordResetSave.tsx";
import Messenger from "./features/user/messenger/messenger.tsx"

function App() {
    return (
        <Router>
            <Routes>
                {/* Mindenkinek elérhető oldalak (PUBLIC) */}
                <Route
                    path="/"
                    element={<PublicHomePage />}
                />
                <Route
                    path="/user/verify"
                    element={<UserVerify />}
                />
                <Route
                    path="/user/sendverify"
                    element={<UserSendVerify />}
                />
                <Route
                    path="/company/sendverify"
                    element={<CompanySendVerify />}
                />
                <Route
                    path="/company/verify"
                    element={<CompanyVerify />}
                />
                <Route
                    path="/user/password/reset"
                    element={<UserPasswordResetRequest />}
                />
                <Route
                    path="/user/password"
                    element={<UserPasswordResetSave />}
                />
                <Route
                    path="/company/password/reset"
                    element={<CompanyPasswordResetRequest />}
                />
                <Route
                    path="/company/password"
                    element={<CompanyPasswordResetSave />}
                />

                <Route
                    path="/messenger"
                    element={<Messenger />}

                />



                {/* 🔒 Csak USER típusú felhasználóknak */}
                <Route
                    path="/userhomepage"
                    element={
                        <IsLoggedIn mode="user">
                            <UserHomePage />
                        </IsLoggedIn>
                    }
                />
                <Route
                    path="/uploadresume"
                    element={
                        <IsLoggedIn mode="user">
                            <UploadResume />
                        </IsLoggedIn>
                    }
                />
                <Route
                    path="/JobApplications"
                    element={
                        <IsLoggedIn mode="user">
                            <JobApplications />
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
                    path="/usereditprofile"
                    element={
                        <IsLoggedIn mode="user">
                            <UserEditProfile />
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
                    path="/ShowListedJobs"
                    element={
                        <IsLoggedIn mode="company">
                            <ShowListedJobs/>
                        </IsLoggedIn>
                    }
                />
                <Route
                    path="/company/ATS/:id"
                    element={
                        <IsLoggedIn mode="company">
                            <ApplicantTrackingSystem/>
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
                    path="/CompanyEditProfile"
                    element={
                        <IsLoggedIn mode="company">
                            <CompanyEditProfile />
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
                <Route
                    path="/employees"
                    element={
                        <IsLoggedIn mode="company">
                            <ShowEmployees/>
                        </IsLoggedIn>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

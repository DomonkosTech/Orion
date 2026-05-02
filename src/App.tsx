import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";

// 1. Static Import for Guard/Layout (Essential to load immediately)
import IsLoggedIn from "./IsLoggedIn.tsx";

// 2. Lazy Imports for Pages
const UserHomePage = lazy(() => import("./features/user/HomePage/UserHomePage.tsx"));
const UserLoginPage = lazy(() => import("./features/user/LoginPage/UserLoginPage.tsx"));
const UserRegisterPage = lazy(() => import("./features/user/RegisterPage/UserRegisterPage.tsx"));
const UserEditProfile = lazy(() => import("./features/user/EditProfile/UserEditProfile.tsx"));
const CompanyRegisterPage = lazy(() => import("./features/company/RegisterPage/CompanyRegisterPage.tsx"));
const CompanyLoginPage = lazy(() => import("./features/company/LoginPage/CompanyLoginPage.tsx"));
const CompanyEditProfile = lazy(() => import("./features/company/EditProfile/CompanyEditProfile.tsx"));
const AddJob = lazy(() => import("./features/company/CompanyJobs/AddJob.tsx"));
const CompanyHomePage = lazy(() => import("./features/company/HomePage/CompanyHomePage.tsx"));
const ShowListedJobs = lazy(() => import("./features/company/ShowListedJobs/ShowListedJobs.tsx"));
const EditJob = lazy(() => import("./features/company/CompanyJobs/EditJob.tsx"));
const ListJobs = lazy(() => import("./features/user/UserJobs/ListAllJobs/ListJobs.tsx"));
const ShowJob = lazy(() => import("./features/user/UserJobs/ShowSelectedJob/ShowJob.tsx"));
const JobApplications = lazy(() => import("./features/user/JobApplications/JobApplications.tsx"));
const UploadResume = lazy(() => import("./features/user/UploadResume/UploadResume.tsx"));
const ApplicantTrackingSystem = lazy(() => import("./features/company/CompanyJobs/ApplicantTrackingSystem.tsx"));
const PublicHomePage = lazy(() => import("./features/public/PublicHomePage/PublicHomePage.tsx"));
const ShowEmployees = lazy(() => import("./features/company/ShowEmployees/ShowEmployees.tsx"));
const UserVerify = lazy(() => import("./features/user/RegisterPage/UserVerify.tsx"));
const UserSendVerify = lazy(() => import("./features/user/RegisterPage/UserSendVerify.tsx"));
const CompanyVerify = lazy(() => import("./features/company/RegisterPage/CompanyVerify.tsx"));
const CompanySendVerify = lazy(() => import("./features/company/RegisterPage/CompanySendVerify.tsx"));
const UserPasswordResetRequest = lazy(() => import("./features/user/EditProfile/UserPasswordResetRequest.tsx"));
const UserPasswordResetSave = lazy(() => import("./features/user/EditProfile/UserPasswordResetSave.tsx"));
const CompanyPasswordResetRequest = lazy(() => import("./features/company/EditProfile/CompanyPasswordResetRequest.tsx"));
const CompanyPasswordResetSave = lazy(() => import("./features/company/EditProfile/CompanyPasswordResetSave.tsx"));
const Messenger = lazy(() => import("./features/user/messenger/messenger.tsx"));
const ShowFavoritesJobs = lazy(() => import("./features/user/UserJobs/Favorites/ShowFavoritesJobs.tsx"));

const PageLoader = () => {
    const { t } = useTranslation("components");
    return (
        <div style={{ padding: "20px", textAlign: "center" }}>{t("loading")}</div>
    );
};

function App() {
    return (
        <Router>
            {/* 3. Wrap Routes in Suspense */}
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Mindenkinek elérhető oldalak (PUBLIC) */}
                    <Route path="/" element={<PublicHomePage />} />
                    <Route path="/user/verify" element={<UserVerify />} />
                    <Route path="/user/sendverify" element={<UserSendVerify />} />
                    <Route path="/company/sendverify" element={<CompanySendVerify />} />
                    <Route path="/company/verify" element={<CompanyVerify />} />
                    <Route path="/user/password/reset" element={<UserPasswordResetRequest />} />
                    <Route path="/user/password" element={<UserPasswordResetSave />} />
                    <Route path="/company/password/reset" element={<CompanyPasswordResetRequest />} />
                    <Route path="/company/password" element={<CompanyPasswordResetSave />} />
                    <Route path="/messenger" element={<Messenger />} />

                    {/* Csak USER típusú felhasználóknak */}
                    <Route element={<IsLoggedIn mode="user" />}>
                        <Route path="/userhomepage" element={<UserHomePage />} />
                        <Route path="/favorites" element={<ShowFavoritesJobs />} />
                        <Route path="/uploadresume" element={<UploadResume />} />
                        <Route path="/JobApplications" element={<JobApplications />} />
                        <Route path="/job/show/:id" element={<ShowJob />} />
                        <Route path="/listjobs" element={<ListJobs />} />
                        <Route path="/usereditprofile" element={<UserEditProfile />} />
                    </Route>

                    {/* Csak COMPANY típusú felhasználóknak */}
                    <Route element={<IsLoggedIn mode="company" />}>
                        <Route path="/company" element={<CompanyHomePage />} />
                        <Route path="/ShowListedJobs" element={<ShowListedJobs />} />
                        <Route path="/company/ATS/:id" element={<ApplicantTrackingSystem />} />
                        <Route path="/company/edit/:id" element={<EditJob />} />
                        <Route path="/CompanyEditProfile" element={<CompanyEditProfile />} />
                        <Route path="/AddJob" element={<AddJob />} />
                        <Route path="/employees" element={<ShowEmployees />} />
                    </Route>

                    {/* Csak kijelentkezve elérhető oldalak (GUEST) */}
                    <Route element={<IsLoggedIn mode="guest" />}>
                        <Route path="/UserLoginPage" element={<UserLoginPage />} />
                        <Route path="/UserRegisterPage" element={<UserRegisterPage />} />
                        <Route path="/CompanyLoginPage" element={<CompanyLoginPage />} />
                        <Route path="/CompanyRegisterPage" element={<CompanyRegisterPage />} />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
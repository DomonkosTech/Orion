import React from "react";
import pageStyles from "./UserEditProfile.module.css";
import formStyles from "../../../components/EditProfile/EditProfile.module.css";
import {
    User, Mail, Phone, MapPin, Calendar, CreditCard,
    BookOpen, FileText, Trash2, Plus
} from "lucide-react";

// Components
import { Header } from "../../../components/Header/Header.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import EditProfile, { type EditProfileRenderProps } from "../../../components/EditProfile/EditProfile.tsx";
import InputField from "../../../components/InputField/InputField.tsx";
import TextArea from "../../../components/TextArea/TextArea.tsx";
import Button from "../../../components/Button/Button.tsx";

const UserEditProfile: React.FC = () => {
    return (
        <div className={pageStyles.pageWrapper}>
            <Header />
            <main className={pageStyles.container}>
                <EditProfile type="user">
                    {({ user, setUser, documents, setDocuments, editMode, resume, handleDeleteResume, navigate }: EditProfileRenderProps) => {
                        if (!user) return null;
                        return (
                            <>
                                <section className={formStyles.formCard}>
                                    <h2 className={formStyles.cardTitle}><User size={20} /> Személyes adatok</h2>
                                    <div className={formStyles.inputGroup}>
                                        <InputField
                                            label="Vezetéknév"
                                            value={user.lname}
                                            readOnly={!editMode}
                                            onChange={(e) => setUser({ ...user, lname: e.target.value })}
                                            containerClassName={formStyles.field}
                                        />
                                        <InputField
                                            label="Keresztnév"
                                            value={user.fname}
                                            readOnly={!editMode}
                                            onChange={(e) => setUser({ ...user, fname: e.target.value })}
                                            containerClassName={formStyles.field}
                                        />
                                        <InputField
                                            label={<><Calendar size={14}/> Születési dátum</>}
                                            type="date"
                                            value={user.birth_date}
                                            readOnly={!editMode}
                                            onChange={(e) => setUser({ ...user, birth_date: e.target.value })}
                                            containerClassName={formStyles.field}
                                        />
                                        <InputField
                                            label="Születési hely"
                                            value={user.birth_place}
                                            readOnly={!editMode}
                                            onChange={(e) => setUser({ ...user, birth_place: e.target.value })}
                                            containerClassName={formStyles.field}
                                        />
                                    </div>
                                </section>

                                <section className={formStyles.formCard}>
                                    <h2 className={formStyles.cardTitle}><Mail size={20} /> Elérhetőség</h2>
                                    <div className={formStyles.inputGroup}>
                                        <InputField
                                            label="Email cím"
                                            type="email"
                                            value={user.email}
                                            readOnly={!editMode}
                                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                                            containerClassName={formStyles.fieldFull}
                                        />
                                        <InputField
                                            label={<><Phone size={14}/> Telefonszám</>}
                                            value={user.phone_number}
                                            readOnly={!editMode}
                                            onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
                                            containerClassName={formStyles.fieldFull}
                                        />
                                        <InputField
                                            label={<><MapPin size={14}/> Lakcím</>}
                                            value={user.address}
                                            readOnly={!editMode}
                                            onChange={(e) => setUser({ ...user, address: e.target.value })}
                                            containerClassName={formStyles.fieldFull}
                                        />
                                    </div>
                                </section>

                                <section className={`${formStyles.formCard} ${formStyles.fullWidth}`}>
                                    <h2 className={formStyles.cardTitle}><BookOpen size={20} /> Szakmai profil</h2>
                                    <div className={formStyles.inputGroup}>
                                        <div className={formStyles.fieldFull}>
                                            <TextArea
                                                label="Rövid bemutatkozás"
                                                value={user.short_bio}
                                                readOnly={!editMode}
                                                maxLength={500}
                                                onChange={(e) => setUser({ ...user, short_bio: e.target.value })}
                                            />
                                        </div>
                                        <div className={formStyles.fieldFull}>
                                            <TextArea
                                                label="Végzettségek"
                                                value={user.qualifications}
                                                readOnly={!editMode}
                                                maxLength={1000}
                                                onChange={(e) => setUser({ ...user, qualifications: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className={`${formStyles.formCard} ${formStyles.fullWidth}`}>
                                    <h2 className={formStyles.cardTitle}><CreditCard size={20} /> Okmányok & Önéletrajz</h2>
                                    <div className={formStyles.docGrid}>
                                        <div className={formStyles.docFields}>
                                            <InputField
                                                label="Adószám"
                                                value={user.tax_number}
                                                readOnly={!editMode}
                                                onChange={(e) => setUser({ ...user, tax_number: e.target.value })}
                                                containerClassName={formStyles.field}
                                            />
                                            {documents && (
                                                <InputField
                                                    label="Személyi igazolvány"
                                                    value={documents.personal_id}
                                                    readOnly={!editMode}
                                                    onChange={(e) => setDocuments({ ...documents, personal_id: e.target.value })}
                                                    containerClassName={formStyles.field}
                                                />
                                            )}
                                            {documents && (
                                                <InputField
                                                    label="Lakcímkártya"
                                                    value={documents.address_card_number}
                                                    readOnly={!editMode}
                                                    onChange={(e) => setDocuments({ ...documents, address_card_number: e.target.value })}
                                                    containerClassName={formStyles.field}
                                                />
                                            )}
                                        </div>

                                        <div className={formStyles.resumeStatusBox}>
                                            <div className={formStyles.resumeInfo}>
                                                <FileText size={32} className={resume ? formStyles.iconActive : formStyles.iconMuted} />
                                                <div>
                                                    <h3>Önéletrajz</h3>
                                                    <p>{resume ? "Feltöltve és aktív" : "Még nincs feltöltve"}</p>
                                                </div>
                                            </div>
                                            {resume ? (
                                                <Button
                                                    type="button"
                                                    onClick={handleDeleteResume}
                                                    color="danger"
                                                    variant="secondary"
                                                >
                                                    <Trash2 size={16} style={{marginRight: '8px'}} /> Törlés
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    onClick={() => navigate("/uploadresume")}
                                                    color="orion-blue"
                                                >
                                                    <Plus size={16} style={{marginRight: '8px'}} /> Feltöltés
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </>
                        );
                    }}
                </EditProfile>
            </main>
            <Footer />
        </div>
    );
};

export default UserEditProfile;
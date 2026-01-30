import React from "react";
import pageStyles from "./CompanyEditProfile.module.css";
import formStyles from "../../../components/EditProfile/EditProfile.module.css";
import {
    Building2, Phone, FileText
} from "lucide-react";

// Components
import { Header } from "../../../components/Header/Header.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import EditProfile, { type EditProfileRenderProps } from "../../../components/EditProfile/EditProfile.tsx";
import InputField from "../../../components/InputField/InputField.tsx";
import TextArea from "../../../components/TextArea/TextArea.tsx";

const CompanyEditProfile: React.FC = () => {
    return (
        <div className={pageStyles.pageWrapper}>
            <Header />
            <main className={pageStyles.container}>
                <EditProfile type="company">
                    {({ company, setCompany, editMode }: EditProfileRenderProps) => {
                        if (!company) return null;
                        return (
                            <>
                                <section className={formStyles.formCard}>
                                    <h2 className={formStyles.cardTitle}><Building2 size={20}/> Általános információk</h2>
                                    <div className={formStyles.inputGroup}>
                                        <div className={formStyles.fieldFull}>
                                            <InputField
                                                label="Cég neve"
                                                value={company.name}
                                                readOnly={!editMode}
                                                onChange={(e) => setCompany({...company, name: e.target.value})}
                                                containerClassName={formStyles.fieldFull}
                                            />
                                        </div>
                                        <InputField
                                            label="Adószám"
                                            value={company.tax_number}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, tax_number: e.target.value})}
                                            containerClassName={formStyles.field}
                                        />
                                        <InputField
                                            label="Tevékenységi kör"
                                            value={company.activity_scope}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, activity_scope: e.target.value})}
                                            containerClassName={formStyles.field}
                                        />
                                        <div className={formStyles.fieldFull}>
                                            <InputField
                                                label="Weboldal (URL)"
                                                type="url"
                                                value={company.website}
                                                readOnly={!editMode}
                                                onChange={(e) => setCompany({...company, website: e.target.value})}
                                                containerClassName={formStyles.fieldFull}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className={formStyles.formCard}>
                                    <h2 className={formStyles.cardTitle}><Phone size={20}/> Elérhetőség</h2>
                                    <div className={formStyles.inputGroup}>
                                        <InputField
                                            label="Kapcsolattartó neve"
                                            value={company.contact_person_name}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, contact_person_name: e.target.value})}
                                            containerClassName={formStyles.fieldFull}
                                        />
                                        <InputField
                                            label="Telefonszám"
                                            value={company.phone_number}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, phone_number: e.target.value})}
                                            containerClassName={formStyles.fieldFull}
                                        />
                                        <InputField
                                            label="Cím"
                                            value={company.address}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, address: e.target.value})}
                                            containerClassName={formStyles.fieldFull}
                                        />
                                    </div>
                                </section>

                                <section className={`${formStyles.formCard} ${formStyles.fullWidth}`}>
                                    <h2 className={formStyles.cardTitle}><FileText size={20}/> Céges bemutatkozás</h2>
                                    <div className={formStyles.fieldFull}>
                                        <TextArea
                                            label=""
                                            rows={6}
                                            value={company.short_description}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, short_description: e.target.value})}
                                            placeholder="Írjon pár szót a cég küldetéséről és céljairól..."
                                        />
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

export default CompanyEditProfile;
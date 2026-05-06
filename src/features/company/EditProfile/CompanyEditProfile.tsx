import React from "react";
import { useTranslation } from "react-i18next";
import pageStyles from "./CompanyEditProfile.module.css";
import formStyles from "../../../components/base/EditProfile/EditProfile.module.css";
import {
    Building2, Phone, FileText
} from "lucide-react";

// Components
import EditProfile, { type EditProfileRenderProps } from "../../../components/base/EditProfile/EditProfile.tsx";
import InputField from "../../../components/ui/InputField/InputField.tsx";
import TextArea from "../../../components/ui/TextArea/TextArea.tsx";
import { BIO_MAX_LENGTH } from "../../../constants/limits.ts";

const CompanyEditProfile: React.FC = () => {
    const { t } = useTranslation('company');

    return (
        <div className={pageStyles.pageWrapper}>
            <main className={pageStyles.container}>
                <EditProfile type="company">
                    {({ company, setCompany, editMode }: EditProfileRenderProps) => {
                        if (!company) return null;
                        return (
                            <>
                                <section className={formStyles.formCard}>
                                    <h2 className={formStyles.cardTitle}><Building2 size={20}/> {t('editProfile.general.title')}</h2>
                                    <div className={formStyles.inputGroup}>
                                        <div className={formStyles.fieldFull}>
                                            <InputField
                                                label={t('editProfile.general.companyName')}
                                                value={company.name}
                                                readOnly={!editMode}
                                                onChange={(e) => setCompany({...company, name: e.target.value})}
                                                containerClassName={formStyles.fieldFull}
                                            />
                                        </div>
                                        <InputField
                                            label={t('editProfile.general.taxNumber')}
                                            value={company.tax_number}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, tax_number: e.target.value})}
                                            containerClassName={formStyles.field}
                                        />
                                        <InputField
                                            label={t('editProfile.general.activityScope')}
                                            value={company.activity_scope}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, activity_scope: e.target.value})}
                                            containerClassName={formStyles.field}
                                        />
                                        <div className={formStyles.fieldFull}>
                                            <InputField
                                                label={t('editProfile.general.website')}
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
                                    <h2 className={formStyles.cardTitle}><Phone size={20}/> {t('editProfile.contact.title')}</h2>
                                    <div className={formStyles.inputGroup}>
                                        <InputField
                                            label={t('editProfile.contact.contactPerson')}
                                            value={company.contact_person_name}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, contact_person_name: e.target.value})}
                                            containerClassName={formStyles.fieldFull}
                                        />
                                        <InputField
                                            label={t('editProfile.contact.phone')}
                                            value={company.phone_number}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, phone_number: e.target.value})}
                                            containerClassName={formStyles.fieldFull}
                                        />
                                        <InputField
                                            label={t('editProfile.contact.address')}
                                            value={company.address}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, address: e.target.value})}
                                            containerClassName={formStyles.fieldFull}
                                        />
                                    </div>
                                </section>

                                <section className={`${formStyles.formCard} ${formStyles.fullWidth}`}>
                                    <h2 className={formStyles.cardTitle}><FileText size={20}/> {t('editProfile.introduction.title')}</h2>
                                    <div className={formStyles.fieldFull}>
                                        <TextArea
                                            label=""
                                            rows={6}
                                            value={company.short_description}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, short_description: e.target.value})}
                                            maxLength={BIO_MAX_LENGTH}
                                            placeholder={t('editProfile.introduction.placeholder')}
                                        />
                                    </div>
                                </section>
                            </>
                        );
                    }}
                </EditProfile>
            </main>
        </div>
    );
};

export default CompanyEditProfile;
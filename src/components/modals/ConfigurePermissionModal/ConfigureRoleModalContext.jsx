import React, { createContext, useContext, useState } from 'react';

const ConfigurePermissionModalContext = createContext();

export const ConfigurePermissionModalProvider = ({ children }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [users, setUsers] = useState([]);
    const [originalUsers, setOriginalUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [originalRoles, setOriginalRoles] = useState([]);

    const [deleteStage, setDeleteStage] = useState("Delete Permission");
    const [isDeleteAccordionOpened, setIsDeleteAccordionOpened] = useState(false);

    return (
        <ConfigurePermissionModalContext.Provider
            value={{
                name,
                setName,
                description,
                setDescription,
                users,
                setUsers,
                originalUsers,
                setOriginalUsers,
                roles,
                setRoles,
                originalRoles,
                setOriginalRoles,
                deleteStage,
                setDeleteStage,
                isDeleteAccordionOpened,
                setIsDeleteAccordionOpened,
            }}
        >
            {children}
        </ConfigurePermissionModalContext.Provider>
    );
};

export const useConfigurePermissionModal = () => {
    return useContext(ConfigurePermissionModalContext);
};

export const ConfigureRoleModalProvider = ConfigurePermissionModalProvider;
export const useConfigureRoleModal = useConfigurePermissionModal;

export default ConfigurePermissionModalContext;
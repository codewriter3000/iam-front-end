import React, { createContext, useContext, useState } from 'react';

const ConfigureRoleModalContext = createContext();

export const ConfigureRoleModalProvider = ({ children }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [users, setUsers] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [originalPermissions, setOriginalPermissions] = useState([]);

    const [deleteStage, setDeleteStage] = useState("Delete Role");
    const [isDeleteAccordionOpened, setIsDeleteAccordionOpened] = useState(false);

    return (
        <ConfigureRoleModalContext.Provider
            value={{
                name,
                setName,
                description,
                setDescription,
                users,
                setUsers,
                permissions,
                setPermissions,
                originalPermissions,
                setOriginalPermissions,
                deleteStage,
                setDeleteStage,
                isDeleteAccordionOpened,
                setIsDeleteAccordionOpened,
            }}
        >
            {children}
        </ConfigureRoleModalContext.Provider>
    );
};

export const useConfigureRoleModal = () => {
    return useContext(ConfigureRoleModalContext);
};

export default ConfigureRoleModalContext;
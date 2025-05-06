import React, { createContext, useContext, useState } from 'react';

const ConfigureUserModalContext = createContext();

export const ConfigureUserModalProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [deleteStage, setDeleteStage] = useState("Delete Account");
    const [isDeleteAccordionOpened, setIsDeleteAccordionOpened] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");

    const [searchString, setSearchString] = useState("");
    const [allRoles, setAllRoles] = useState([]);
    const [rolesBelongingToUser, setRolesBelongingToUser] = useState([]);
    const [originalRolesBelongingToUser, setOriginalRolesBelongingToUser] = useState([]);

    return (
        <ConfigureUserModalContext.Provider
            value={{
                isAdmin,
                setIsAdmin,
                isEnabled,
                setIsEnabled,
                deleteStage,
                setDeleteStage,
                isDeleteAccordionOpened,
                setIsDeleteAccordionOpened,
                firstName,
                setFirstName,
                lastName,
                setLastName,
                email,
                setEmail,
                username,
                setUsername,
                searchString,
                setSearchString,
                allRoles,
                setAllRoles,
                rolesBelongingToUser,
                setRolesBelongingToUser,
                originalRolesBelongingToUser,
                setOriginalRolesBelongingToUser,
            }}
        >
            {children}
        </ConfigureUserModalContext.Provider>
    );
};

export const useConfigureUserModal = () => {
    return useContext(ConfigureUserModalContext);
};

export default ConfigureUserModalContext;
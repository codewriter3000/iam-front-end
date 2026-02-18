import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Tab, TabList, Tabs, TabPanels } from "@carbon/react";
import { useConfigureRoleModal } from "./ConfigureRoleModalContext";
import {
    createRole,
    updateRole,
    deleteRole,
    getPermissionsForRole,
    addPermissionToRole,
    removePermissionFromRole,
} from "@/../lib";

import { BasicInformationPanel, ManagePermissionsPanel, ManageUsersPanel } from "./index.js";

const ConfigureRoleModal = ({ role, open, setOpen }) => {
    const context = useConfigureRoleModal();

    if (!context) {
        throw new Error(
            "useConfigureRoleModal must be used within a ConfigureRoleModalProvider"
        );
    }

    const {
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
    } = context;

    useEffect(() => {
        console.log("Role in ConfigureRoleModal:", role);
        setName(role?.["name"]);
        setDescription(role?.["description"]);
        setDeleteStage("Delete Role");
        setUsers(role?.["users"] || []);

        if (!open || !role?.["id"]) {
            setPermissions([]);
            setOriginalPermissions([]);
            return;
        }

        getPermissionsForRole(role["id"])
            .then((rolePermissions) => {
                const permissionIds = (rolePermissions || []).map((permission) => Number(permission.id || permission["id"]));
                setPermissions(permissionIds);
                setOriginalPermissions(permissionIds);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [
        open,
        role,
        setDeleteStage,
        setDescription,
        setName,
        setOriginalPermissions,
        setPermissions,
        setUsers,
    ]);

    const tabs = useMemo(
        () => [
            {
                label: "Role Information",
                panel: <BasicInformationPanel role={role} />,
            },
            {
                label: "Manage Users",
                panel: <ManageUsersPanel role={role} />,
            },
            {
                label: "Manage Permissions",
                panel: <ManagePermissionsPanel role={role} />,
            },
        ],
        [role]
    );

    useEffect(() => {
        setRenderedTabs(tabs);
    }, [tabs]);

    const [renderedTabs, setRenderedTabs] = useState(tabs);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleTabChange = (evt) => {
    setSelectedIndex(evt.selectedIndex);
    };

    const handleClose = () => {
        setOpen(false);
        setName("");
        setDescription("");
        setPermissions([]);
        setOriginalPermissions([]);
        setDeleteStage("Delete Role");
        setIsDeleteAccordionOpened(false);
    };

    const handleSave = () => {
        if (role) {
            updateRole(role?.["id"], name, description)
                .then(() => {
                    handleClose();
                })
                .catch((err) => {
                    console.error(err);
                });
        } else {
            createRole(name, description)
                .then(() => {
                    handleClose();
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    };

    const handleDelete = () => {
        if (deleteStage === "Delete Role") {
            setDeleteStage("Are you sure?");
        } else {
            deleteRole(role?.["id"])
                .then(() => {
                    handleClose();
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    };

    return (
        <Modal
            preventCloseOnClickOutside={true}
            open={open}
            onRequestClose={() => handleClose()}
            modalHeading={`Configure ${role?.["name"]}`}
            modalLabel="Role configuration"
            secondaryButtonText="Cancel"
            primaryButtonText="Save Changes"
            onRequestSubmit={async () => {
                const updatedRolePayload = {
                    name: name,
                    description: description,
                    users: users.map((user) => ({ id: user.id })),
                };

                try {
                    await updateRole(role["id"], updatedRolePayload);

                    const permissionsToAdd = (permissions || []).filter(
                        (id) => !(originalPermissions || []).map(String).includes(String(id))
                    );
                    const permissionsToRemove = (originalPermissions || []).filter(
                        (id) => !(permissions || []).map(String).includes(String(id))
                    );

                    if (permissionsToAdd.length > 0) {
                        await Promise.all(
                            permissionsToAdd.map((permissionID) => addPermissionToRole(Number(role["id"]), Number(permissionID)))
                        );
                    }

                    if (permissionsToRemove.length > 0) {
                        await Promise.all(
                            permissionsToRemove.map((permissionID) => removePermissionFromRole(Number(role["id"]), Number(permissionID)))
                        );
                    }

                    console.log("updatedRolePayload", updatedRolePayload);
                    console.log("Role successfully updated");
                    handleClose();
                } catch (err) {
                    console.error(err);
                }

            }}
        >
            <Tabs selectedIndex={selectedIndex} onChange={handleTabChange}>
                <TabList aria-label="List of tabs">
                    {tabs.map((tab, index) => (
                        <Tab key={index}>{tab.label}</Tab>
                    ))}
                </TabList>
                <TabPanels>
                    {renderedTabs
                        .filter((_, index) => index === selectedIndex)
                        .map((tab, index) => (
                            <div key={`tab-panel-${index}`}>{tab.panel}</div>
                        ))}
                </TabPanels>
            </Tabs>
        </Modal>
    );
}

export default ConfigureRoleModal;
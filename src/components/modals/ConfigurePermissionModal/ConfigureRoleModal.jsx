import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Tab, TabList, Tabs, TabPanels } from "@carbon/react";
import { useConfigurePermissionModal } from "./ConfigurePermissionModalContext";
import {
    updatePermission,
    deletePermission,
    getUsersWithPermission,
    addManyUsersToPermission,
    removeManyUsersFromPermission,
    getRolesWithPermission,
    addPermissionToRole,
    removePermissionFromRole,
} from "@/../lib";

import { BasicInformationPanel, ManageUsersPanel, ManageRolesPanel } from "./index.js";

const ConfigurePermissionModal = ({ permission, open, setOpen, isReadOnly = false }) => {
    const context = useConfigurePermissionModal();

    if (!context) {
        throw new Error(
            "useConfigurePermissionModal must be used within a ConfigurePermissionModalProvider"
        );
    }

    const {
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
    } = context;

    useEffect(() => {
        setName(permission?.["name"] || "");
        setDescription(permission?.["description"] || "");
        setDeleteStage("Delete Permission");

        if (!open || !permission?.["id"]) {
            setUsers([]);
            setOriginalUsers([]);
            setRoles([]);
            setOriginalRoles([]);
            return;
        }

        getUsersWithPermission(permission["id"])
            .then((permissionUsers) => {
                const userIds = (permissionUsers || []).map((user) => Number(user.id || user["id"]));
                setUsers(userIds);
                setOriginalUsers(userIds);
            })
            .catch((err) => {
                console.error(err);
            });

        getRolesWithPermission(permission["id"])
            .then((permissionRoles) => {
                const roleIds = (permissionRoles || []).map((role) => Number(role.id || role["id"]));
                setRoles(roleIds);
                setOriginalRoles(roleIds);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [
        open,
        permission,
        setDeleteStage,
        setDescription,
        setName,
        setOriginalRoles,
        setOriginalUsers,
        setRoles,
        setUsers,
    ]);

    const tabs = useMemo(
        () => [
            {
                label: "Permission Information",
                panel: <BasicInformationPanel permission={permission} isReadOnly={isReadOnly} />,
            },
            {
                label: "Manage Users",
                panel: <ManageUsersPanel isReadOnly={isReadOnly} />,
            },
            {
                label: "Manage Roles",
                panel: <ManageRolesPanel isReadOnly={isReadOnly} />,
            }
        ],
        [permission, isReadOnly]
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
        setUsers([]);
        setOriginalUsers([]);
        setRoles([]);
        setOriginalRoles([]);
        setDeleteStage("Delete Permission");
        setIsDeleteAccordionOpened(false);
    };

    const handleDelete = () => {
        if (deleteStage === "Delete Permission") {
            setDeleteStage("Are you sure?");
        } else {
            deletePermission(permission?.["id"])
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
            modalHeading={`Configure ${permission?.["name"]}`}
            modalLabel="Permission configuration"
            secondaryButtonText="Cancel"
            primaryButtonText="Save Changes"
            primaryButtonDisabled={isReadOnly}
            onRequestSubmit={async () => {
                if (isReadOnly) {
                    return;
                }

                if (!permission?.["id"]) {
                    handleClose();
                    return;
                }

                const updatedPermissionPayload = {
                    name: name,
                    description: description,
                };

                try {
                    await updatePermission(permission["id"], updatedPermissionPayload);

                    const usersToAdd = (users || []).filter(
                        (id) => !(originalUsers || []).map(String).includes(String(id))
                    );
                    const usersToRemove = (originalUsers || []).filter(
                        (id) => !(users || []).map(String).includes(String(id))
                    );

                    if (usersToAdd.length > 0) {
                        await addManyUsersToPermission(permission["id"], usersToAdd.map(Number));
                    }

                    if (usersToRemove.length > 0) {
                        await removeManyUsersFromPermission(permission["id"], usersToRemove.map(Number));
                    }

                    const rolesToAdd = (roles || []).filter(
                        (id) => !(originalRoles || []).map(String).includes(String(id))
                    );
                    const rolesToRemove = (originalRoles || []).filter(
                        (id) => !(roles || []).map(String).includes(String(id))
                    );

                    if (rolesToAdd.length > 0) {
                        await Promise.all(
                            rolesToAdd.map((roleID) => addPermissionToRole(Number(roleID), Number(permission["id"])))
                        );
                    }

                    if (rolesToRemove.length > 0) {
                        await Promise.all(
                            rolesToRemove.map((roleID) => removePermissionFromRole(Number(roleID), Number(permission["id"])))
                        );
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    handleClose();
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

export default ConfigurePermissionModal;
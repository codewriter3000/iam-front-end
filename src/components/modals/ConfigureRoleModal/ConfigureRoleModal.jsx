import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Tab, TabList, Tabs, TabPanels } from "@carbon/react";
import { useConfigureRoleModal } from "./ConfigureRoleModalContext";
import { createRole, updateRole, deleteRole } from "@/../lib";

import { BasicInformationPanel, ManageUsersPanel } from "./index.js";

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
        deleteStage,
        setDeleteStage,
        isDeleteAccordionOpened,
        setIsDeleteAccordionOpened,
    } = context;

    useEffect(() => {
        setName(role?.["name"]);
        setDescription(role?.["description"]);
        setDeleteStage("Delete Role");
    }, [role, setDeleteStage, setDescription, setName]);

    useEffect(() => {
        if (role) {
            setName(role?.["name"]);
            setDescription(role?.["description"]);
        }
    }, [role, setDescription, setName]);

    const tabs = useMemo(
        () => [
            {
                label: "Role Information",
                panel: <BasicInformationPanel role={role} />,
            },
            {
                label: "Manage Users",
                panel: <ManageUsersPanel role={role} />,
            }
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
            onRequestSubmit={() => {
                const updatedRolePayload = {
                    name: name,
                    description: description,
                };

                updateRole(role["id"], updatedRolePayload).then(() => {
                    console.log("Role successfully updated");
                });

                setOpen(false);
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
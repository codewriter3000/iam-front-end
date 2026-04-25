import { useState, useEffect, useMemo } from "react";
import { Modal, Tab, TabList, Tabs, TabPanels } from "@carbon/react";
import { useConfigurePermissionModal } from "./ConfigurePermissionModalContext.jsx";
import { createPermission, updatePermission, deletePermission } from "@/../lib";

import { BasicInformationPanel, ManageRolesPanel } from "./index.js";

const ConfigurePermissionModal = ({ permission, open, setOpen }) => {
  const context = useConfigurePermissionModal();

  if (!context) {
    throw new Error(
      "useConfigurePermissionModal must be used within a ConfigurePermissionsModalProvider"
    );
  }

  const {
    name,
    setName,
    description,
    setDescription,
    users,
    setUsers,
    deleteStage,
    setDeleteStage,
    isDeleteAccordionOpened,
    setIsDeleteAccordionOpened,
  } = context;

  useEffect(() => {
    console.log("Permission in ConfigurePermissionsModal:", permission);
    setName(permission?.["name"]);
    setDescription(permission?.["description"]);
    setDeleteStage("Delete Permission");
    setUsers(permission?.["users"] || []);
  }, [permission, setDeleteStage, setDescription, setName, setUsers]);

  const tabs = useMemo(
    () => [
      {
        label: "Permission Information",
        panel: <BasicInformationPanel setOpen={setOpen} permission={permission} />,
      },
      {
        label: "Manage Roles",
        panel: <ManageRolesPanel permission={permission} />,
      },
    ],
    [permission, setOpen]
  );

  useEffect(() => {
    setRenderedTabs(tabs);
  }, [tabs]);

  const [renderedTabs, setRenderedTabs] = useState(tabs);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleTabChange = (evt) => {
    setSelectedIndex(evt.selectedIndex);
  };

  return (
    <Modal
      open={open}
      onRequestClose={() => setOpen(false)}
      modalHeading="Configure Permission"
      primaryButtonText="Save"
      secondaryButtonText="Cancel"
      onRequestSubmit={() => {
        const updatedPermissionPayload = {
          name: name,
          description: description,
          users: users.map((user) => ({ id: user.id })),
        }

        updatePermission(permission?.["id"], updatedPermissionPayload).then(() => {
          console.log("Permission updated successfully", updatedPermissionPayload);
        });

        setOpen(false);
      }}
      size="lg"
    >
      <Tabs selectedIndex={selectedIndex} onChange={handleTabChange}>
        <TabList aria-label="Configure Permission Tabs">
          {renderedTabs.map((tab, index) => (
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
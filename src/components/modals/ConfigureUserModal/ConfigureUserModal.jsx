import {
  Accordion,
  AccordionItem,
  Button,
  Modal,
  Stack,
  TextInput,
  Toggle,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  Search,
  CheckboxGroup,
  Checkbox,
  FilterableMultiSelect,
} from "@carbon/react";
import { useEffect, useState, useMemo } from "react";
import {
  updateUser,
  deleteUser,
  getRolesForUser,
  getRoles,
  addManyRolesToUser,
  removeManyRolesFromUser,
} from "@/../lib";

import { useConfigureUserModal, UserInformationPanel, UserRolesPanel } from "@/components/modals/ConfigureUserModal/index.js";

const ConfigureUserModal = ({ user, open, setOpen }) => {
  const context = useConfigureUserModal();

  if (!context) {
    throw new Error(
      "useConfigureUserModal must be used within a ConfigureUserModalProvider"
    );
  }

  const {
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
    allRoles,
    setAllRoles,
    rolesBelongingToUser,
    setRolesBelongingToUser,
    originalRolesBelongingToUser,
    setOriginalRolesBelongingToUser,
  } = context;

  useEffect(() => {
    setIsAdmin(user?.["is_admin"]);
    setIsEnabled(user?.["is_enabled"]);
    setDeleteStage("Delete Account");
    setFirstName(user?.["first_name"]);
    setLastName(user?.["last_name"]);
    setEmail(user?.["email"]);
    setUsername(user?.["username"]);

    getRoles().then((roles) => {
      setAllRoles(roles);
    });

    if (!user) {
      return;
    }

    getRolesForUser(user?.["id"])
      .then((roles) => {
        setRolesBelongingToUser(roles);
        setOriginalRolesBelongingToUser(roles);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [open, setAllRoles, setDeleteStage, setEmail, setFirstName, setIsAdmin, setIsEnabled, setLastName, setOriginalRolesBelongingToUser, setRolesBelongingToUser, setUsername, user]);

  const tabs = useMemo(
    () => [
      {
        label: "User Information",
        panel: <UserInformationPanel user={user} />,
      },
      {
        label: "User Roles",
        panel: <UserRolesPanel user={user} />,
      },
    ],
    [user]
  );

  useEffect(() => {
    setRenderedTabs(tabs);
  }, [
    tabs,
    allRoles,
    rolesBelongingToUser,
    username,
    firstName,
    lastName,
    email,
    isAdmin,
    isEnabled,
  ]);

  const [renderedTabs, setRenderedTabs] = useState(tabs);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleTabChange = (evt) => {
    setSelectedIndex(evt.selectedIndex);
  };

  const handleClose = () => {
    setOpen(false);
    setIsDeleteAccordionOpened(false);
  };

  return (
      <Modal
        open={open}
        onRequestClose={() => handleClose()}
        modalHeading={`Configure ${user?.["username"]}`}
        modalLabel="User configuration"
        secondaryButtonText="Cancel"
        primaryButtonText="Save Changes"
        onRequestSubmit={() => {
          const updatedUserPayload = {
            username: user["username"],
            first_name: firstName,
            last_name: lastName,
            email: email,
            is_admin: isAdmin,
            is_enabled: isEnabled,
          };

          updateUser(user["id"], updatedUserPayload).then(() => {
            console.log("User successfully updated");
          });

          const rolesToAdd = rolesBelongingToUser.filter(
            (role) => !originalRolesBelongingToUser.includes(role)
          );

          const rolesToRemove = originalRolesBelongingToUser.filter(
            (role) => !rolesBelongingToUser.includes(role)
          );

          addManyRolesToUser(user["id"], rolesToAdd).then(() => {
            console.log("Roles successfully added");
          });

          removeManyRolesFromUser(user["id"], rolesToRemove).then(() => {
            console.log("Roles successfully removed");
          });

          setOpen(false);
        }}
      >
        <Tabs selectedIndex={selectedIndex} onChange={handleTabChange}>
          <TabList aria-label="List of tabs">
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
};

export default ConfigureUserModal;

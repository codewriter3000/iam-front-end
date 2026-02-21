import {
  Modal,
  Tabs,
  TabList,
  Tab,
  TabPanels,
} from "@carbon/react";
import { useEffect, useState, useMemo } from "react";
import {
  updateUser,
  getRolesForUser,
  getUserPermissions,
  getRoles,
  addManyRolesToUser,
  removeManyRolesFromUser,
  getPermissionByName,
  addPermissionToUser,
  removePermissionFromUser,
} from "@/../lib";

import {
  useConfigureUserModal,
  UserInformationPanel,
  RolesAndPermissionsPanel,
} from "@/components/modals/ConfigureUserModal/index.js";

const ConfigureUserModal = ({ user, open, setOpen, isReadOnly = false }) => {
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
    if (!open) {
      return;
    }

    setDeleteStage("Delete Account");
    setFirstName(user?.["first_name"]);
    setLastName(user?.["last_name"]);
    setEmail(user?.["email"]);
    setUsername(user?.["username"]);

    getRoles()
      .then((roles) => {
        setAllRoles(Array.isArray(roles) ? roles : []);
      })
      .catch((err) => {
        console.error(err);
        setAllRoles([]);
      });

    if (!user) {
      return;
    }

    getUserPermissions(user?.["id"])
      .then((permissions) => {
        const permissionNames = (permissions || [])
          .map((permission) => (permission?.name || permission?.permission || "").toLowerCase());

        const hasAdminPermission =
          permissionNames.includes("administrator") || permissionNames.includes("admin");
        const hasActivePermission =
          permissionNames.includes("active") || permissionNames.includes("enabled");

        setIsAdmin(hasAdminPermission);
        setIsEnabled(hasActivePermission);
        setOriginalIsAdmin(hasAdminPermission);
        setOriginalIsEnabled(hasActivePermission);
      })
      .catch((err) => {
        console.error(err);
        const fallbackIsAdmin = !!user?.["is_admin"];
        const fallbackIsEnabled = !!user?.["is_enabled"];
        setIsAdmin(fallbackIsAdmin);
        setIsEnabled(fallbackIsEnabled);
        setOriginalIsAdmin(fallbackIsAdmin);
        setOriginalIsEnabled(fallbackIsEnabled);
      });

    getRolesForUser(user?.["id"])
      .then((roles) => {
        const roleIds = Array.isArray(roles) ? roles.map(r => r.id || r["id"]) : [];
        setRolesBelongingToUser(roleIds);
        setOriginalRolesBelongingToUser(roleIds);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [open, setAllRoles, setDeleteStage, setEmail, setFirstName, setIsAdmin, setIsEnabled, setLastName, setOriginalRolesBelongingToUser, setRolesBelongingToUser, setUsername, user]);

  const tabs = useMemo(
    () => [
      {
        label: "User Information",
        panel: (
          <UserInformationPanel
            user={user}
            setOpen={setOpen}
            isReadOnly={isReadOnly}
          />
        ),
      },
      {
        label: "Roles and Permissions",
        panel: <RolesAndPermissionsPanel user={user} isReadOnly={isReadOnly} />,
      },
    ],
    [user, setOpen, isReadOnly]
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
  const [originalIsAdmin, setOriginalIsAdmin] = useState(false);
  const [originalIsEnabled, setOriginalIsEnabled] = useState(false);

  const resolvePermissionId = async (possibleNames) => {
    for (const permissionName of possibleNames) {
      try {
        const permission = await getPermissionByName(permissionName);
        if (permission?.id) {
          return Number(permission.id);
        }
      } catch (err) {
      }
    }

    return null;
  };

  const handleTabChange = (evt) => {
    setSelectedIndex(evt.selectedIndex);
  };

  const handleClose = () => {
    setOpen(false);
    setIsDeleteAccordionOpened(false);
  };

  return (
      <Modal
        preventCloseOnClickOutside={true}
        open={open}
        onRequestClose={() => handleClose()}
        modalHeading={`Configure ${user?.["username"]}`}
        modalLabel="User configuration"
        secondaryButtonText="Cancel"
        primaryButtonText="Save Changes"
        primaryButtonDisabled={isReadOnly}
        onRequestSubmit={async () => {
          if (isReadOnly) {
            return;
          }

          const updatedUserPayload = {
            username: username,
            first_name: firstName,
            last_name: lastName,
            email: email,
          };

          try {
            await updateUser(user["id"], updatedUserPayload);
            console.log("User successfully updated");

            const rolesToAdd = (rolesBelongingToUser || []).filter(
              (role) => !(originalRolesBelongingToUser || []).map(String).includes(String(role))
            );

            const rolesToRemove = (originalRolesBelongingToUser || []).filter(
              (role) => !(rolesBelongingToUser || []).map(String).includes(String(role))
            );

            if (rolesToAdd.length > 0) {
              await addManyRolesToUser(user["id"], rolesToAdd.map((id) => Number(id)));
              console.log("Roles successfully added");
            }

            if (rolesToRemove.length > 0) {
              await removeManyRolesFromUser(user["id"], rolesToRemove.map((id) => Number(id)));
              console.log("Roles successfully removed");
            }

            const adminPermissionId = await resolvePermissionId(["Administrator", "Admin"]);
            const activePermissionId = await resolvePermissionId(["Active", "Enabled"]);

            if (adminPermissionId && isAdmin !== originalIsAdmin) {
              if (isAdmin) {
                await addPermissionToUser(adminPermissionId, user["id"]);
              } else {
                await removePermissionFromUser(adminPermissionId, user["id"]);
              }
            }

            if (activePermissionId && isEnabled !== originalIsEnabled) {
              if (isEnabled) {
                await addPermissionToUser(activePermissionId, user["id"]);
              } else {
                await removePermissionFromUser(activePermissionId, user["id"]);
              }
            }

            setOriginalRolesBelongingToUser(rolesBelongingToUser || []);
            setOriginalIsAdmin(isAdmin);
            setOriginalIsEnabled(isEnabled);
            setOpen(false);
          } catch (err) {
            console.error("Failed to save user role changes:", err);
          }
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

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
  Search, CheckboxGroup, Checkbox
} from "@carbon/react";
import { useEffect, useState } from "react";
import { updateUser, deleteUser, getRolesForUser,
  getRoles, addManyRolesToUser, removeManyRolesFromUser } from "@/../lib";

const ConfigureUserModal = ({ user, open, setOpen }) => {
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
  }, [open, user]);

  const tabs = [
    {
      label: "User Information",
      panel: (
        <Stack gap={7}>
          <p
            style={{
              marginBottom: "1rem",
              marginTop: "1rem",
            }}
          >
            This is where you can configure the user account status for a
            particular user. You can change information about a user, change
            their admin status, or even disable, enable, or delete their
            account.
          </p>
          <TextInput
            data-modal-primary-focus
            id="username-config"
            labelText="Username"
            defaultValue={user?.["username"]}
            value={username}
            onChange={(evt) => setUsername(evt.target.value)}
          />
          <TextInput
            data-modal-primary-focus
            id="first-name-config"
            labelText="First name"
            defaultValue={user?.["first_name"]}
            value={firstName}
            onChange={(evt) => setFirstName(evt.target.value)}
          />
          <TextInput
            data-modal-primary-focus
            id="last-name-config"
            labelText="Last name"
            defaultValue={user?.["last_name"]}
            value={lastName}
            onChange={(evt) => setLastName(evt.target.value)}
          />
          <TextInput
            type="email"
            data-model-primary-focus
            id="email-config"
            labelText="Email"
            defaultValue={user?.["email"]}
            value={email}
            onChange={(evt) => setEmail(evt.target.value)}
          />
          <div className="grid grid-cols-2">
            <div>
              <Toggle
                labelText="Is admin"
                id="isAdmin-config"
                labelA="Standard user"
                labelB="Admin user"
                toggled={isAdmin}
                onClick={() => setIsAdmin((curr) => !curr)}
              />
            </div>
            <div>
              <Toggle
                labelText="Is account enabled"
                id="isDisabled-config"
                labelB="Enabled account"
                labelA="Disabled account"
                toggled={isEnabled}
                onClick={() => setIsEnabled(!isEnabled)}
              />
            </div>
          </div>
          <Accordion>
            <AccordionItem
              open={isDeleteAccordionOpened}
              title="Delete Account"
            >
              <div className="flex">
                <div>
                  <Button
                    kind="danger"
                    onClick={() => {
                      if (deleteStage === "Confirm Delete") {
                        deleteUser(user?.["id"]).then((r) => {
                          console.log("User successfully deleted");
                        });
                        setOpen(false);
                        return;
                      }

                      setDeleteStage("Confirm Delete");
                    }}
                  >
                    {deleteStage}
                  </Button>
                </div>
                {deleteStage === "Confirm Delete" && (
                  <div className="m-auto">
                    Are you sure you want to delete this account? This action
                    cannot be undone.
                  </div>
                )}
              </div>
            </AccordionItem>
          </Accordion>
        </Stack>
      ),
    },
    {
      label: "User Roles",
      panel: (
        <Stack gap={7}>
          <p
            style={{
              marginBottom: "1rem",
              marginTop: "1rem",
            }}
          >
            This is where you can configure the roles for a user. You can add or
            remove roles from a user.
          </p>
          <div className="overflow-y-auto h-40">
            <Search
              labelText="Search roles"
              id="search-roles"
              placeHolderText="Search roles"
              onChange={(evt) => setSearchString(evt.target.value)}
            />
            <CheckboxGroup>
              {allRoles?.filter((role) => role["name"].includes(searchString))
                .map((role) => (
                  <Checkbox
                    key={"role/" + role["id"]}
                    labelText={role["name"]}
                    id={"role/" + role["id"]}
                    checked={rolesBelongingToUser?.includes(role["id"])}
                    onChange={(evt) => {
                      if (evt.target.checked) {
                        setRolesBelongingToUser([...rolesBelongingToUser, role["id"]]);
                      } else {
                        setRolesBelongingToUser(rolesBelongingToUser.filter((id) => id !== role["id"]));
                      }
                    }}
                  />
                ))}
            </CheckboxGroup>
          </div>
        </Stack>
      ),
    },
  ];
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
            <Tab key={index}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>{renderedTabs
          .filter((_, index) => index === selectedIndex)
          .map((tab, index) => (
            <div key={`tab-panel-${index}`}>
              {tab.panel}
            </div>
          ))}
        </TabPanels>
      </Tabs>
    </Modal>
  );
};

export default ConfigureUserModal;

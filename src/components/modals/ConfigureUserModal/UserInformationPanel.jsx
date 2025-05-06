import {
  Stack,
  TextInput,
  Toggle,
  Accordion,
  AccordionItem,
  Button,
} from "@carbon/react";
import { useConfigureUserModal } from "./index";

const UserInformationPanel = ({ user }) => {
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
  } = useConfigureUserModal();

  return (
      <Stack gap={7}>
        <p
          style={{
            marginBottom: "1rem",
            marginTop: "1rem",
          }}
        >
          This is where you can configure the user account status for a
          particular user. You can change information about a user, change their
          admin status, or even disable, enable, or delete their account.
        </p>
        <TextInput
          data-modal-primary-focus
          id="username-config"
          labelText="Username"
          defaultValue={user?.["username"]}
          value={username || ""}
          onChange={(evt) => setUsername(evt.target.value)}
        />
        <TextInput
          data-modal-primary-focus
          id="first-name-config"
          labelText="First name"
          defaultValue={user?.["first_name"]}
          value={firstName || ""}
          onChange={(evt) => setFirstName(evt.target.value)}
        />
        <TextInput
          data-modal-primary-focus
          id="last-name-config"
          labelText="Last name"
          defaultValue={user?.["last_name"]}
          value={lastName || ""}
          onChange={(evt) => setLastName(evt.target.value)}
        />
        <TextInput
          type="email"
          data-model-primary-focus
          id="email-config"
          labelText="Email"
          defaultValue={user?.["email"]}
          value={email || ""}
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
          <AccordionItem open={isDeleteAccordionOpened} title="Delete Account">
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
  );
};

export default UserInformationPanel;

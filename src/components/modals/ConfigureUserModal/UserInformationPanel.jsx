import {
  Stack,
  TextInput,
  Toggle,
  Accordion,
  AccordionItem,
  Button,
  InlineNotification,
} from "@carbon/react";
import { useConfigureUserModal } from "./index";
import { deleteUser, forcePasswordReset } from "@/../lib";
import { useState } from "react";

const UserInformationPanel = ({ user, setOpen, isReadOnly = false }) => {
  const [isForcingReset, setIsForcingReset] = useState(false);
  const [forceResetMessage, setForceResetMessage] = useState("");
  const [forceResetError, setForceResetError] = useState("");

  const isRootUser = (user?.["username"] || "").toLowerCase() === "root";
  const isRootRestricted = isReadOnly || isRootUser;

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
          value={username || ""}
          readOnly={isRootRestricted}
          onChange={(evt) => setUsername(evt.target.value)}
        />
        {!isRootUser ? (
          <>
            <TextInput
              data-modal-primary-focus
              id="first-name-config"
              labelText="First name"
              value={firstName || ""}
              readOnly={isReadOnly}
              onChange={(evt) => setFirstName(evt.target.value)}
            />
            <TextInput
              data-modal-primary-focus
              id="last-name-config"
              labelText="Last name"
              value={lastName || ""}
              readOnly={isReadOnly}
              onChange={(evt) => setLastName(evt.target.value)}
            />
          </>
        ) : null}
        <TextInput
          type="email"
          data-model-primary-focus
          id="email-config"
          labelText="Email"
          value={email || ""}
          readOnly={isReadOnly}
          onChange={(evt) => setEmail(evt.target.value)}
        />
        {forceResetError ? (
          <InlineNotification
            lowContrast
            kind="error"
            title="Force reset failed"
            subtitle={forceResetError}
            onCloseButtonClick={() => setForceResetError("")}
          />
        ) : null}
        {forceResetMessage ? (
          <InlineNotification
            lowContrast
            kind="success"
            title="Password reset required"
            subtitle={forceResetMessage}
            onCloseButtonClick={() => setForceResetMessage("")}
          />
        ) : null}
        <div>
          <Button
            kind="tertiary"
            disabled={isReadOnly || isForcingReset}
            onClick={async () => {
              setForceResetError("");
              setForceResetMessage("");
              setIsForcingReset(true);

              try {
                const response = await forcePasswordReset(user?.["id"]);
                setForceResetMessage(response?.message || "Password reset will be required on next sign in");
              } catch (err) {
                setForceResetError(err.message || "Unable to force password reset");
              } finally {
                setIsForcingReset(false);
              }
            }}
          >
            {isForcingReset ? "Forcing password reset..." : "Force Password Reset"}
          </Button>
        </div>
        <div className="grid grid-cols-2">
          <div>
            <Toggle
              labelText="Is admin"
              id="isAdmin-config"
              labelA="Standard user"
              labelB="Admin user"
              toggled={isAdmin}
              disabled={isRootRestricted}
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
              disabled={isRootRestricted}
              onClick={() => setIsEnabled(!isEnabled)}
            />
          </div>
        </div>
        {!isRootUser ? (
          <Accordion>
            <AccordionItem open={isDeleteAccordionOpened} title="Delete Account">
              <div className="flex">
                <div>
                  <Button
                    kind="danger"
                    disabled={isReadOnly}
                    onClick={() => {
                      if (isReadOnly) {
                        return;
                      }

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
        ) : null}
      </Stack>
  );
};

export default UserInformationPanel;

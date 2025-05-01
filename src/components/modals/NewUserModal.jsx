import {
  EmailInput,
  Modal,
  PasswordInput,
  Stack,
  TextInput,
  Toggle,
} from "@carbon/react";
import { useEffect, useState } from "react";
import { registerUser } from "@/../lib";
import { Email } from "@carbon/icons-react";

const NewUserModal = ({ open, setOpen }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [usernameInvalid, setUsernameInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [firstNameInvalid, setFirstNameInvalid] = useState(false);
  const [lastNameInvalid, setLastNameInvalid] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);

  const [usernameInvalidText, setUsernameInvalidText] = useState("");
  const [passwordInvalidText, setPasswordInvalidText] = useState("");
  const [firstNameInvalidText, setFirstNameInvalidText] = useState("");
  const [lastNameInvalidText, setLastNameInvalidText] = useState("");
  const [emailInvalidText, setEmailInvalidText] = useState("");

  useEffect(() => {
    setUsername("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setIsAdmin(false);
    setIsEnabled(true);
  }, [open]);

  return (
    <Modal
      preventCloseOnClickOutside={true}
      open={open}
      onRequestClose={() => setOpen(false)}
      onRequestSubmit={(evt) => {
        // asdfsfssdfS5$
        if (username.length < 3 || username.length > 20) {
          setUsernameInvalid(true);
          setUsernameInvalidText("Username must be at least 3 characters long.");
          return;
        }
        if (password.length < 8 || password.length > 20) {
          setPasswordInvalid(true);
          setPasswordInvalidText("Password must be at least 8 characters long.");
          return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
        if (!passwordRegex.test(password)) {
          setPasswordInvalid(true);
          setPasswordInvalidText(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
          );
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setEmailInvalid(true);
          setEmailInvalidText("Please enter a valid email address.");
          return;
        }

        setUsernameInvalid(false);
        setPasswordInvalid(false);
        setFirstNameInvalid(false);
        setLastNameInvalid(false);

        registerUser({
          username: username,
          password: password,
          first_name: firstName,
          last_name: lastName,
          email: email,
          is_admin: isAdmin,
          is_enabled: isEnabled,
        })
          .then((res) => {
            const errorResult = JSON.parse(res);
            if (errorResult?.error !== undefined) {
              const field = /^([A-Za-z]+)/.exec(errorResult["error"])[1].toLowerCase();
              if (field === "username") {
                setUsernameInvalid(true);
                setUsernameInvalidText(errorResult["error"]);
              } else if (field === "password") {
                setPasswordInvalid(true);
                setPasswordInvalidText(errorResult["error"]);
              } else if (field === "first") {
                setFirstNameInvalid(true);
                setFirstNameInvalidText(errorResult["error"]);
              } else if (field === "last") {
                setLastNameInvalid(true);
                setLastNameInvalidText(errorResult["error"]);
              } else if (field === "email") {
                setEmailInvalid(true);
                setEmailInvalidText(errorResult["error"]);
              }
            } else {
              setOpen(false);
            }
          })
          .catch((err) => {
            console.log(`error: ${JSON.stringify(err)}`);
          });
      }}
      modalHeading="New User"
      modalLabel="User creation"
      secondaryButtonText="Cancel"
      primaryButtonText="Create user"
    >
      <Stack gap={7}>
        <p
          style={{
            marginBottom: "1rem",
          }}
        >
          This is where you can create a new user for your application. You can
          add their first name, last name, username, and whether or not you want
          their account to be an admin or enabled.
        </p>
        <TextInput
          data-modal-primary-focus
          id="username"
          labelText="Username"
          value={username}
          invalid={usernameInvalid}
          invalidText={usernameInvalidText}
          onChange={(evt) => setUsername(evt.target.value)}
        />
        <PasswordInput
          data-modal-primary-focus
          id="password"
          labelText="Password"
          value={password}
          invalid={passwordInvalid}
          invalidText={passwordInvalidText}
          onChange={(evt) => setPassword(evt.target.value)}
        />
        <TextInput
          data-modal-primary-focus
          id="first-name"
          labelText="First name"
          value={firstName}
          invalid={firstNameInvalid}
          invalidText={firstNameInvalidText}
          onChange={(evt) => setFirstName(evt.target.value)}
        />
        <TextInput
          data-modal-primary-focus
          id="last-name"
          labelText="Last name"
          value={lastName}
          invalid={lastNameInvalid}
          invalidText={lastNameInvalidText}
          onChange={(evt) => setLastName(evt.target.value)}
        />
        <TextInput
          data-modal-primary-focus
          id="email"
          labelText="Email"
          value={email}
          invalid={emailInvalid}
          invalidText={emailInvalidText}
          onChange={(evt) => setEmail(evt.target.value)}
        />
        <div className="grid grid-cols-2">
          <div>
            <Toggle
              labelText="Is admin"
              id="isAdmin"
              labelA="Standard user"
              labelB="Admin user"
              toggled={isAdmin}
              onClick={() => setIsAdmin((curr) => !curr)}
            />
          </div>
          <div>
            <Toggle
              labelText="Is account enabled"
              id="isDisabled"
              labelB="Enabled account"
              labelA="Disabled account"
              toggled={isEnabled}
              onClick={() => setIsEnabled(!isEnabled)}
            />
          </div>
        </div>
      </Stack>
    </Modal>
  );
};

export default NewUserModal;

import React from "react";
import { Stack, TextInput } from "@carbon/react";
import { useConfigureRoleModal } from "./ConfigureRoleModalContext";

const BasicInformationPanel = ({ role, isReadOnly = false }) => {
  const { name, setName, description, setDescription } =
    useConfigureRoleModal();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  return (
    <Stack gap={7}>
      <p
        style={{
          marginBottom: "1rem",
          marginTop: "1rem",
        }}
      >
        This is where you can configure the name and description of a role. You
        can change the name and description of the role to better reflect its
        purpose.
      </p>
      <TextInput
        data-modal-primary-focus
        id="role-name-config"
        labelText="Role Name"
        value={name}
        defaultValue={role?.["name"]}
        readOnly={isReadOnly}
        onChange={handleNameChange}
      />
      <TextInput
        id="role-description-config"
        labelText="Description"
        value={description}
        defaultValue={role?.["description"]}
        readOnly={isReadOnly}
        onChange={handleDescriptionChange}
        rows={4}
      />
    </Stack>
  );
};

export default BasicInformationPanel;

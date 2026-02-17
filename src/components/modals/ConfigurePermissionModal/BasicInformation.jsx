import React from "react";
import { Stack, TextInput } from "@carbon/react";
import { useConfigurePermissionModal } from "./ConfigurePermissionModalContext";

const BasicInformationPanel = ({ permission }) => {
  const { name, setName, description, setDescription } =
    useConfigurePermissionModal();

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
        This is where you can configure the name and description of a permission. You
        can change the name and description of the permission to better reflect its
        purpose.
      </p>
      <TextInput
        data-modal-primary-focus
        id="permission-name-config"
        labelText="Permission Name"
        value={name}
        defaultValue={permission?.["name"]}
        onChange={handleNameChange}
      />
      <TextInput
        id="permission-description-config"
        labelText="Description"
        value={description}
        defaultValue={permission?.["description"]}
        onChange={handleDescriptionChange}
        rows={4}
      />
    </Stack>
  );
};

export default BasicInformationPanel;

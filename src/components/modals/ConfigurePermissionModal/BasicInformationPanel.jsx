import {
  Stack,
  TextInput,
  Button,
  Accordion,
  AccordionItem,
} from "@carbon/react";
import { useConfigurePermissionModal } from "./ConfigurePermissionModalContext";

import { deletePermission } from "@/../lib";

const BasicInformationPanel = ({ permission, setOpen }) => {
  console.log("BasicInformationPanel rendered with permission:", permission);

  const {
    name,
    setName,
    description,
    setDescription,
    deleteStage,
    setDeleteStage,
    isDeleteAccordionOpened,
    setIsDeleteAccordionOpened,
  } = useConfigurePermissionModal();

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
        This is where you can configure the name and description of a
        permission. You can change the name and description of the permission to
        better reflect its purpose.
      </p>
      <TextInput
        data-modal-primary-focus
        id="permission-name-config"
        readOnly={permission?.["system_permission"] || false}
        labelText="Permission Name"
        value={name}
        defaultValue={permission?.["name"]}
        onChange={handleNameChange}
      />
      <TextInput
        id="permission-description-config"
        readOnly={permission?.["system_permission"] || false}
        labelText="Description"
        value={description}
        defaultValue={permission?.["description"]}
        onChange={handleDescriptionChange}
        rows={4}
      />
      <Accordion>
        <AccordionItem
          title="Delete Permission"
          open={isDeleteAccordionOpened}
          onClick={() => setIsDeleteAccordionOpened(!isDeleteAccordionOpened)}
        >
          <p>
            Deleting a permission will remove it from the system. This action
            cannot be undone.
          </p>
          <Button
            kind="danger"
            onClick={() => {
              deletePermission(permission.id);
              setOpen(false);
            }}
          >
            {deleteStage}
          </Button>
        </AccordionItem>
      </Accordion>
    </Stack>
  );
};

export default BasicInformationPanel;

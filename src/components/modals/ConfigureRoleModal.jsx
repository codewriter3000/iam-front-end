import {
  Accordion,
  AccordionItem,
  Button,
  Modal,
  Stack,
  TextInput,
} from "@carbon/react";
import { useEffect, useState } from "react";
import { updateRole, deleteRole } from "@/../lib";

const ConfigureRoleModal = ({ role, open, setOpen }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [deleteStage, setDeleteStage] = useState("Delete Role");
  const [isDeleteAccordionOpened, setIsDeleteAccordionOpened] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setIsDeleteAccordionOpened(false);
  };

  useEffect(() => {
    setName(role?.["name"]);
    setDescription(role?.["description"]);
    setDeleteStage("Delete Role");
  }, [role]);

  return (
    <Modal
      open={open}
      onRequestClose={() => handleClose()}
      modalHeading={`Configure ${role?.["name"]}`}
      modalLabel="Role configuration"
      secondaryButtonText="Cancel"
      primaryButtonText="Save Changes"
      onRequestSubmit={() => {
        const updatedRolePayload = {
          name: name,
          description: description,
        };

        updateRole(role["id"], updatedRolePayload).then(() => {
          console.log("Role successfully updated");
        });

        setOpen(false);
      }}
    >
      <Stack gap={7}>
        <TextInput
          id="role-name"
          labelText="Role Name"
          value={name}
          onChange={(evt) => setName(evt.target.value)}
        />
        <TextInput
          id="role-description"
          labelText="Role Description"
          value={description}
          onChange={(evt) => setDescription(evt.target.value)}
        />
        <Accordion>
          <AccordionItem title={deleteStage} open={isDeleteAccordionOpened}>
            <Stack>
              <Button
                kind="danger"
                onClick={() => {
                  if (deleteStage === "Confirm Delete") {
                    deleteRole(role["id"]).then(() => {
                      console.log("Role successfully deleted");
                    });
                    setOpen(false);
                    return;
                  }

                  setDeleteStage("Confirm Delete");
                }}
              >
                {deleteStage}
              </Button>
            </Stack>
            {deleteStage === "Confirm Delete" && (
              <div className="m-auto">
                Are you sure you want to delete this role? This action cannot be
                undone.
              </div>
              )}
          </AccordionItem>
        </Accordion>
      </Stack>
    </Modal>
  );
};

export default ConfigureRoleModal;

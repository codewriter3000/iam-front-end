import {
    Modal,
    Stack,
    TextInput,
    Toggle,
} from "@carbon/react";
import { useEffect, useState } from "react";
import { createPermission } from "@/../lib";

const NewPermissionModal = ({ open, setOpen }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [permissions, setPermissions] = useState([]);

    const [nameInvalid, setNameInvalid] = useState(false);
    const [descriptionInvalid, setDescriptionInvalid] = useState(false);

    const [nameInvalidText, setNameInvalidText] = useState("");
    const [descriptionInvalidText, setDescriptionInvalidText] = useState("");

    useEffect(() => {
        setName("");
        setDescription("");
    }, [open]);

    return (
        <Modal
            open={open}
            onRequestClose={() => setOpen(false)}
            onRequestSubmit={(evt) => {
                setNameInvalid(false);
                setDescriptionInvalid(false);

                console.log("Creating role with name:", name);
                console.log("Creating role with description:", description);

                createPermission({
                    name: name,
                    description: description,
                    //permissions: permissions,
                })
                    .then(() => {
                        setOpen(false);
                    })
                    .catch((err) => {
                        if (err.response.status === 400) {
                            if (err.response.data["name"]) {
                                setNameInvalid(true);
                                setNameInvalidText(err.response.data["name"]);
                            }

                            if (err.response.data["description"]) {
                                setDescriptionInvalid(true);
                                setDescriptionInvalidText(err.response.data["description"]);
                            }
                        }
                    });
            }}
            modalHeading="New Permission"
            modalLabel="Create a new permission"
            secondaryButtonText="Cancel"
            primaryButtonText="Create Permission"
        >
            <Stack gap={7}>
                <p
                    style={{
                        marginBottom: "1rem",
                        marginTop: "1rem",
                    }}>
                    This is where you can create a new permission. You can set the name and description of the role to better reflect its purpose.
                </p>
                <TextInput
                    id="name"
                    labelText="Name"
                    value={name}
                    invalid={nameInvalid}
                    invalidText={nameInvalidText}
                    onChange={(evt) => setName(evt.target.value)}
                />
                <TextInput
                    id="description"
                    labelText="Description"
                    value={description}
                    invalid={descriptionInvalid}
                    invalidText={descriptionInvalidText}
                    onChange={(evt) => setDescription(evt.target.value)}
                />
            </Stack>
        </Modal>
    );
};

export default NewPermissionModal;

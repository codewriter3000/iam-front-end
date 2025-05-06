import {
    CheckboxGroup,
    Checkbox,
    Modal,
    Search,
    Stack,
} from "@carbon/react";
import { useCallback, useState, useEffect } from "react";
import { getUsers, getUsersWithRole, addManyUsersToRole, removeManyUsersFromRole } from "@/../lib";

const ManageUsersForRoleModal = ({ role, open, setOpen }) => {
    const [searchString, setSearchString] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [usersWithRole, setUsersWithRole] = useState([]);
    const [originalUsersWithRole, setOriginalUsersWithRole] = useState([]);

    const handleClose = () => {
        setOpen(false);
        setUsersWithRole([]);
        setOriginalUsersWithRole([]);
    };

    const handleSave = () => {
        const usersToAdd = usersWithRole.filter(
            (id) => !originalUsersWithRole.includes(id)
        );

        const usersToRemove = originalUsersWithRole.filter(
            (id) => !usersWithRole.includes(id)
        );

        addManyUsersToRole(role?.["id"], usersToAdd)
        removeManyUsersFromRole(role?.["id"], usersToRemove)

        setOpen(false);
    }

    useEffect(() => {
        getUsers()
            .then((users) => {
                setAllUsers(users);
            })
            .catch((err) => {
                console.error(err);
            });

        if (!role) {
            return;
        }

        getUsersWithRole(role?.["id"])
            .then((users) => {
                setUsersWithRole(users);
                setOriginalUsersWithRole(users);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [open, role]);

    return (
        <Modal
            open={open}
            onRequestClose={() => handleClose()}
            modalHeading={`Manage Users for ${role?.["name"]}`}
            modalLabel="Role configuration"
            secondaryButtonText="Cancel"
            primaryButtonText="Save Changes"
            onRequestSubmit={() => handleSave()}
        >
        <Stack gap={7}>
            <div className="overflow-y-auto h-40">
                <Search
                    labelText="Search users"
                    id="search-users"
                    placeholdertext="Search users"
                    onChange={evt => setSearchString(evt.target.value)}
                />
                <CheckboxGroup>
                    {allUsers?.filter(user => user["username"].includes(searchString))
                        .map((user) => (
                        <Checkbox
                            key={"user/" + user["id"]}
                            labelText={user["username"]}
                            id={"user/" + user["id"]}
                            checked={usersWithRole?.includes(user["id"])}
                            onChange={(evt) => {
                                if (evt.target.checked) {
                                    setUsersWithRole([...usersWithRole, user["id"]]);
                                } else {
                                    setUsersWithRole(usersWithRole.filter(id => id !== user["id"]));
                                }
                            }}
                        />
                    ))}
                </CheckboxGroup>
            </div>
        </Stack>
        </Modal>
    );
}

export default ManageUsersForRoleModal;
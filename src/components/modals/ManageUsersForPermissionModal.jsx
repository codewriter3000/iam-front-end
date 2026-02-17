import {
    CheckboxGroup,
    Checkbox,
    Modal,
    Search,
    Stack,
} from "@carbon/react";
import { useCallback, useState, useEffect } from "react";
import { getUsers, getUsersWithPermission, addManyUsersToPermission, removeManyUsersFromPermission } from "@/../lib";

const ManageUsersForPermissionModal = ({ permission, open, setOpen }) => {
    const [searchString, setSearchString] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [usersWithPermission, setUsersWithPermission] = useState([]);
    const [originalUsersWithPermission, setOriginalUsersWithPermission] = useState([]);

    const handleClose = () => {
        setOpen(false);
        setUsersWithPermission([]);
        setOriginalUsersWithPermission([]);
    };

    const handleSave = () => {
        const usersToAdd = usersWithPermission.filter(
            (id) => !originalUsersWithPermission.includes(id)
        );

        const usersToRemove = originalUsersWithPermission.filter(
            (id) => !usersWithPermission.includes(id)
        );

        addManyUsersToPermission(permission?.["id"], usersToAdd)
        removeManyUsersFromPermission(permission?.["id"], usersToRemove)

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

        if (!permission) {
            return;
        }

        getUsersWithPermission(permission?.["id"])
            .then((users) => {
                setUsersWithPermission(users);
                setOriginalUsersWithPermission(users);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [open, permission]);

    return (
        <Modal
            open={open}
            onRequestClose={() => handleClose()}
            modalHeading={`Manage Users for ${permission?.["name"]}`}
            modalLabel="Permission configuration"
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
                            checked={usersWithPermission?.includes(user["id"])}
                            onChange={(evt) => {
                                if (evt.target.checked) {
                                    setUsersWithPermission([...usersWithPermission, user["id"]]);
                                } else {
                                    setUsersWithPermission(usersWithPermission.filter(id => id !== user["id"]));
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

export default ManageUsersForPermissionModal;

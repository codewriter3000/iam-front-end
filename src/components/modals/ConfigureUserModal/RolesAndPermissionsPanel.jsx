import { Stack, FilterableMultiSelect } from "@carbon/react";
import { useConfigureUserModal, Permissions } from "./index";

const RolesAndPermissionsPanel = () => {
  const { allRoles, rolesBelongingToUser, setRolesBelongingToUser } =
    useConfigureUserModal();

  return (
      <Stack gap={7}>
        <p
          style={{
            marginBottom: "1rem",
            marginTop: "1rem",
          }}
        >
          This is where you can configure the roles and permissions for a user. You can add or
          remove roles and permissions as needed.
        </p>
        <div>
          {allRoles.length > 0 ? (
            <FilterableMultiSelect
              items={allRoles?.map((role) => ({
                id: role["id"],
                text: role["name"],
              }))}
              itemToString={(item) => (item ? item.text : "")}
              initialSelectedItems={allRoles
                ?.filter((role) => rolesBelongingToUser?.includes(role["id"]))
                .map((role) => ({
                  id: role["id"],
                  text: role["name"],
                }))}
              onChange={({ selectedItems }) => {
                setRolesBelongingToUser(selectedItems.map((item) => item.id));
              }}
              label="Roles"
              placeholder="Select roles"
              titleText="Roles"
            />
          ) : (
            <div className="text-center">There are no roles in the system.</div>
          )}
        </div>
        <Permissions />
      </Stack>
  );
};

export default RolesAndPermissionsPanel;

import { Stack, FilterableMultiSelect } from "@carbon/react";
import { useConfigureUserModal, Permissions } from "./index";

const RolesAndPermissionsPanel = ({ user }) => {
  const { allRoles, rolesBelongingToUser, setRolesBelongingToUser } =
    useConfigureUserModal();

  const roleItems = (allRoles || []).map((role) => ({
    id: role["id"],
    text: role["name"],
  }));

  const selectedRoleItems = roleItems.filter((item) =>
    (rolesBelongingToUser || []).map(String).includes(String(item.id))
  );

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
              items={roleItems}
              itemToString={(item) => (item ? item.text : "")}
              selectedItems={selectedRoleItems}
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
        <Permissions userID={user?.["id"]} selectedRoles={selectedRoleItems} />
      </Stack>
  );
};

export default RolesAndPermissionsPanel;

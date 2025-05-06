import { Stack, FilterableMultiSelect } from "@carbon/react";
import { useConfigureUserModal } from "./index";

const UserRolesPanel = () => {
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
          This is where you can configure the roles for a user. You can add or
          remove roles from a user.
        </p>
        <div className="overflow-y-auto h-40">
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
            <div className="text-center">No roles available</div>
          )}
        </div>
      </Stack>
  );
};

export default UserRolesPanel;

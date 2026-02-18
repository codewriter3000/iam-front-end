import { Information } from "@carbon/icons-react";
import {
  Search,
  Pagination,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
  Tooltip,
} from "@carbon/react";

import { useEffect, useState } from "react";

import { getUserPermissions } from "@/../lib/users";
import { getPermissionsForRole } from "@/../lib/roles";

const Permissions = ({ userID, selectedRoles = [] }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [realData, setRealData] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      const fetchedUserPermissions = (await getUserPermissions(userID)) || [];

      const normalizedUserPermissions = fetchedUserPermissions.map((item) => {
        const name = item.name || item.permission || "";
        return {
          id: `user-${item.id || name}`,
          permission: name,
          assignedFrom: item.assignedFrom || null,
          systemAssigned: name === "Administrator" || name === "Active" || !!item.systemAssigned,
        };
      });

      const rolePermissionTasks = (selectedRoles || []).map(async (role) => {
        const permissions = (await getPermissionsForRole(role.id)) || [];

        return permissions.map((permission) => ({
          id: `role-${role.id}-${permission.id || permission.name}`,
          permission: permission.name || permission.permission || "",
          assignedFrom: role.text,
          systemAssigned: false,
        }));
      });

      const rolePermissionsNested = await Promise.all(rolePermissionTasks);
      const normalizedRolePermissions = rolePermissionsNested.flat();

      const merged = [...normalizedUserPermissions, ...normalizedRolePermissions];
      const deduped = Array.from(
        new Map(merged.map((item) => [`${item.permission}-${item.assignedFrom || "none"}-${item.id}`, item])).values()
      );

      setRealData(deduped);

      if (searchString.length > 0) {
        setSearchResults(
          deduped.filter((result) => {
            return (
              result["permission"] &&
              result["permission"].toLowerCase().includes(searchString.toLowerCase())
            );
          })
        );
      } else {
        setSearchResults(deduped);
      }

      setPage(1);
    };

    fetchPermissions();
  }, [userID, searchString, selectedRoles]);

  const changePaginationState = (pageInfo) => {
    if (page !== pageInfo.page) {
      setPage(pageInfo.page);
    }

    if (pageSize !== pageInfo.pageSize) {
      setPageSize(pageInfo.pageSize);
    }
  };

  const safeResults = Array.isArray(searchResults) ? searchResults : [];

  return (
    <div>
      <Search
        size="lg"
        placeholder="Find a permission"
        labelText="Search"
        id="user-search"
        onChange={(evt) => setSearchString(evt.target.value)}
      />
      <Pagination
        backwardText="Previous page"
        forwardText="Next page"
        itemsPerPageText="Items per page"
        onChange={changePaginationState}
        page={page}
        pageSize={pageSize}
        pageSizes={[6]}
        size="md"
        totalItems={safeResults.length}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Permission</TableHeader>
            <TableHeader>Assigned From</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {safeResults
            .filter((_, idx) => {
              return idx < page * pageSize && idx >= (page - 1) * pageSize;
            })
            .map((searchResult) => {
              return (
                <TableRow key={searchResult.id}>
                  <TableCell>{searchResult.permission}</TableCell>
                  <TableCell>
                    {searchResult?.assignedFrom ? (
                      searchResult?.assignedFrom
                    ) : searchResult?.systemAssigned ? (
                      <span className="inline-flex items-center">
                        <Tag type="blue">System</Tag>
                        <Tooltip className="ml-1" label="Added by the system.">
                          <Information size={16} />
                        </Tooltip>
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <Tag type="red">Manual</Tag>
                        <Tooltip
                          className="ml-1"
                          label="Added manually by an administrator. Not recommended."
                        >
                          <Information size={16} />
                        </Tooltip>
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
};

export default Permissions;

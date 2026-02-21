import { useEffect, useState, useCallback } from "react";
import {
  DataTable,
  Pagination,
  Search,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
  TableContainer,
} from "@carbon/react";
import { useConfigurePermissionModal } from "./ConfigurePermissionModalContext";

import { getRoles } from "@/../lib";

const ManageRolesPanel = ({ isReadOnly = false }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [realData, setRealData] = useState([]);

  const context = useConfigurePermissionModal();

  if (!context) {
    throw new Error(
      "useConfigurePermissionModal must be used within a ConfigurePermissionModalProvider"
    );
  }

  const { roles, setRoles } = context;

  const isRowSelected = useCallback(
    (row) => (roles || []).map(String).includes(String(row.id || row["id"])),
    [roles]
  );

  useEffect(() => {
    getRoles()
      .then((items) => {
        setRealData(items || []);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const changePaginationState = (pageInfo) => {
    if (page !== pageInfo.page) {
      setPage(pageInfo.page);
    }

    if (pageSize !== pageInfo.pageSize) {
      setPageSize(pageInfo.pageSize);
    }
  };

  const headers = [
    { key: "name", header: "Role Name" },
    { key: "description", header: "Description" },
  ];

  useEffect(() => {
    setSearchResults([...realData]);

    if (searchString.length > 0) {
      setSearchResults(
        realData.filter((result) => {
          return (
            (result["name"] &&
              result["name"]
                .toLowerCase()
                .includes(searchString.toLowerCase())) ||
            (result["description"] &&
              result["description"]
                .toLowerCase()
                .includes(searchString.toLowerCase()))
          );
        })
      );
    }

    setPage(1);
  }, [searchString, realData]);

  return (
    <Stack gap={7}>
      <p
        style={{
          marginBottom: "1rem",
          marginTop: "1rem",
        }}
      >
        This is where you can view and manage the roles that include this
        permission.
      </p>
      <div>
        <Search
          size="lg"
          placeholder="Find a role"
          labelText="Search"
          id="role-search"
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
          totalItems={searchResults.length}
        />
        <DataTable
          checked={true}
          rows={searchResults}
          headers={headers}
          render={({
            rows,
            headers,
            getHeaderProps,
            getRowProps,
            getSelectionProps,
            getTableProps,
            getTableContainerProps,
          }) => (
            <TableContainer
              title="Roles"
              description="List of roles"
              {...getTableContainerProps()}
            >
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableSelectAll {...getSelectionProps()} disabled={isReadOnly} />
                    {headers.map((header) => (
                      <TableHeader
                        key={header.key}
                        {...getHeaderProps({ header })}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows
                    .filter((role) => {
                      return (
                        page * pageSize > rows.indexOf(role) &&
                        (page - 1) * pageSize <= rows.indexOf(role)
                      );
                    })
                    .map((role) => (
                      <TableRow
                        key={role["id"]}
                        {...getRowProps({ row: role })}
                      >
                        <TableSelectRow
                          {...getSelectionProps({ row: role })}
                          disabled={isReadOnly}
                          checked={isRowSelected(role)}
                          onSelect={() => {
                            if (isReadOnly) {
                              return;
                            }

                            const rowId = role.id || role["id"];
                            if (isRowSelected(role)) {
                              setRoles((prevRoles) =>
                                (prevRoles || []).filter((id) => String(id) !== String(rowId))
                              );
                            } else {
                              setRoles((prevRoles) => [
                                ...(prevRoles || []),
                                rowId,
                              ]);
                            }
                          }}
                        />
                        {role.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        />
      </div>
    </Stack>
  );
};

export default ManageRolesPanel;

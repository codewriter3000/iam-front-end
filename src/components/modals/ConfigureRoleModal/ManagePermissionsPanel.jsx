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
import { useConfigureRoleModal } from "./ConfigureRoleModalContext";

import { getPermissions } from "@/../lib";

const ManagePermissionsPanel = ({ isReadOnly = false }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [realData, setRealData] = useState([]);

  const context = useConfigureRoleModal();

  const { permissions, setPermissions } = context;

  if (!context) {
    throw new Error(
      "useConfigureRoleModal must be used within a ConfigureRoleModalProvider"
    );
  }

  // Ensure isRowSelected always reflects the latest permissions state
  const isRowSelected = useCallback(
    (row) => (permissions || []).map(String).includes(String(row.id || row["id"])),
    [permissions]
  );

  useEffect(() => {
    getPermissions()
      .then((permissions) => {
        console.log(permissions);
        setRealData(permissions);
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
    { key: "name", header: "Name" },
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
        This is where you can view and remove the permissions that have been assigned to this
        role.
      </p>
      <div>
        <Search
          size="lg"
          placeholder="Find a permission"
          labelText="Search"
          id="permission-search"
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
              title="Permissions"
              description="List of permissions"
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
                    .filter((permission) => {
                      return (
                        page * pageSize > rows.indexOf(permission) &&
                        (page - 1) * pageSize <= rows.indexOf(permission)
                      );
                    })
                    .map((permission) => (
                        <TableRow
                          key={permission["id"]}
                          {...getRowProps({ row: permission })}
                        >
                          <TableSelectRow
                            {...getSelectionProps({ row: permission })}
                            disabled={isReadOnly}
                            checked={isRowSelected(permission)}
                            onSelect={() => {
                              if (isReadOnly) {
                                return;
                              }

                              const rowId = permission.id || permission["id"];
                              if (isRowSelected(permission)) {
                                setPermissions((prevPermissions) =>
                                  (prevPermissions || []).filter((id) => String(id) !== String(rowId))
                                );
                              } else {
                                setPermissions((prevPermissions) => [
                                  ...(prevPermissions || []),
                                  rowId,
                                ]);
                              }
                            }}
                          />
                          {permission.cells.map((cell) => (
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

export default ManagePermissionsPanel;

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

import { getUsers } from "@/../lib";

const ManageUsersPanel = ({ isReadOnly = false }) => {
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

  const { users, setUsers } = context;

  // Ensure isRowSelected always reflects the latest users state
  const isRowSelected = useCallback(
    (row) => (users || []).map(String).includes(String(row.id || row["id"])),
    [users]
  );

  useEffect(() => {
    getUsers()
      .then((users) => {
        console.log(users);
        setRealData(users);
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
    { key: "last_name", header: "Last Name" },
    { key: "first_name", header: "First Name" },
    { key: "username", header: "Username" },
  ];

  useEffect(() => {
    setSearchResults([...realData]);

    if (searchString.length > 0) {
      setSearchResults(
        realData.filter((result) => {
          return (
            (result["username"] &&
              result["username"]
                .toLowerCase()
                .includes(searchString.toLowerCase())) ||
            (result["first_name"] &&
              result["first_name"]
                .toLowerCase()
                .includes(searchString.toLowerCase())) ||
            (result["last_name"] &&
              result["last_name"]
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
        Directly adding or removing permissions from users is not recommended, as it can lead to a complex and hard-to-maintain permission structure. Instead, consider managing permissions through roles.
      </p>
      <div>
        <Search
          size="lg"
          placeholder="Find a user"
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
              title="Users"
              description="List of users"
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
                    .filter((user) => {
                      return (
                        page * pageSize > rows.indexOf(user) &&
                        (page - 1) * pageSize <= rows.indexOf(user)
                      );
                    })
                    .map((user) => (
                        <TableRow
                          key={user["id"]}
                          {...getRowProps({ row: user })}
                        >
                          <TableSelectRow
                            {...getSelectionProps({ row: user })}
                            disabled={isReadOnly}
                            checked={isRowSelected(user)}
                            onSelect={() => {
                              if (isReadOnly) {
                                return;
                              }

                              const rowId = user.id || user["id"];
                              if (isRowSelected(user)) {
                                setUsers((prevUsers) =>
                                  (prevUsers || []).filter((id) => String(id) !== String(rowId))
                                );
                              } else {
                                setUsers((prevUsers) => [
                                  ...(prevUsers || []),
                                  rowId,
                                ]);
                              }
                            }}
                          />
                          {user.cells.map((cell) => (
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

export default ManageUsersPanel;

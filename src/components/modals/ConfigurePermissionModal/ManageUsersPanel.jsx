import { useEffect, useState, useCallback } from "react";
import {
  Button,
  DataTable,
  Pagination,
  Search,
  Stack,
  Tag,
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

import { getUsers } from "@/../lib";

const ManageUsersPanel = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [realData, setRealData] = useState([]);

  const context = useConfigureRoleModal();

  const { users, setUsers } = context;

  if (!context) {
    throw new Error(
      "useConfigureRoleModal must be used within a ConfigureRoleModalProvider"
    );
  }

  const { role } = context;

  // Ensure isRowSelected always reflects the latest users state
  const isRowSelected = useCallback(
    (row) => users && users.some((u) => u.id === row.id),
    [users]
  );

  const getSelectionPropsCI = useCallback(
    (props = {}) => {
      const baseProps = context.getSelectionProps
        ? context.getSelectionProps(props)
        : {};
      if (props.row) {
        return {
          ...baseProps,
          checked: isRowSelected(props.row),
        };
      }
      return baseProps;
    },
    [context, isRowSelected]
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
        This is where you can view and remove the users that have access to this
        role.
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
                    <TableSelectAll {...getSelectionProps()} />
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
                            checked={isRowSelected(user)}
                            onSelect={() => {
                              // Extract the row id here
                              const rowId = user.id || user["id"];
                              console.log("Row selected, id:", rowId);
                              console.log("Selected users:", users);
                              if (isRowSelected(user)) {
                                setUsers((prevUsers) =>
                                  prevUsers.filter((u) => u.id !== rowId)
                                );
                              } else {
                                setUsers((prevUsers) => [
                                  ...prevUsers,
                                  user,
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

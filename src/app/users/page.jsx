"use client";
import {
  DataTable,
  Button,
  Column,
  Grid,
  Heading,
  Pagination,
  Search,
  Section,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
} from "@carbon/react";
import { useEffect, useState, useMemo } from "react";
import { getUsers } from "@/../lib";
import { NewUserModal } from "@/components/modals";
import { ErrorBoundary } from "@/components/misc";
import {
  ConfigureUserModalProvider,
  ConfigureUserModal,
} from "@/components/modals/ConfigureUserModal/index.js";

import "./_users-page.scss";

const filterUsers = (users, searchString) => {
  if (!searchString) return users;
  const lower = searchString.toLowerCase();
  return users.filter(
    (user) =>
      (user.id && user.id.toString().includes(lower)) ||
      (user.username && user.username.toLowerCase().includes(lower)) ||
      (user.first_name && user.first_name.toLowerCase().includes(lower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(lower))
  );
};

const UsersPage = () => {
  const [configureOpen, setConfigureOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [user, setUser] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchString, setSearchString] = useState("");
  const [realData, setRealData] = useState([]);
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [sortBy, setSortBy] = useState({ key: "last_name", direction: "asc" });

  useEffect(() => {
    getUsers()
      .then(setRealData)
      .catch(() => setShouldThrowError(true));
  }, [newOpen, configureOpen]);

  const searchResults = useMemo(
    () => filterUsers(realData, searchString),
    [realData, searchString]
  );

  const tableHeaders = [
    { key: "last_name", header: "Last Name", isSortable: true },
    { key: "first_name", header: "First Name", isSortable: true },
    { key: "username", header: "Username", isSortable: true },
    { key: "actions", header: "Actions" }, // actions column is not sortable
  ];

  const sortedResults = useMemo(() => {
    const sorted = [...searchResults];
    if (sortBy.key && sortBy.key !== "actions") {
      sorted.sort((a, b) => {
        const aVal = a[sortBy.key] || "";
        const bVal = b[sortBy.key] || "";
        if (aVal < bVal) return sortBy.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortBy.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [searchResults, sortBy]);

  const paginatedResults = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedResults.slice(start, start + pageSize);
  }, [sortedResults, page, pageSize]);

  const changePaginationState = ({ page: newPage, pageSize: newPageSize }) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  return (
    <ErrorBoundary trigger={shouldThrowError}>
      <NewUserModal open={newOpen} setOpen={setNewOpen} />
      <ConfigureUserModalProvider>
        <ConfigureUserModal
          open={configureOpen}
          setOpen={setConfigureOpen}
          user={user}
        />
      </ConfigureUserModalProvider>
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <DataTable
            rows={paginatedResults}
            headers={tableHeaders}
            render={({
              rows,
              headers,
              getHeaderProps,
              getRowProps,
              getTableProps,
              getTableContainerProps,
              getToolbarProps,
            }) => (
              <TableContainer
                title="Users"
                description="Manage users, view details, and configure access."
                {...getTableContainerProps()}
              >
                <TableToolbar {...getToolbarProps()}>
                  <TableToolbarContent>
                    <TableToolbarSearch
                      value={searchString}
                      onChange={(e) => {
                        setSearchString(e.target.value);
                        setPage(1);
                      }}
                    />
                    <Button kind="primary" onClick={() => setNewOpen(true)}>
                      New User
                    </Button>
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => {
                        const { key, ...rest } = getHeaderProps({ header });
                        return (
                          <TableHeader
                            key={header.key}
                            {...rest}
                            isSortable={header.isSortable}
                            isSortHeader={sortBy.key === header.key}
                            sortDirection={sortBy.direction}
                            onClick={() => {
                              if (!header.isSortable) return;
                              setSortBy((prev) => ({
                                key: header.key,
                                direction:
                                  prev.key === header.key &&
                                  prev.direction === "asc"
                                    ? "desc"
                                    : "asc",
                              }));
                            }}
                          >
                            {header.header}
                            {header.isSortable &&
                              !(sortBy.key === header.key) && (
                                <span style={{ visibility: "hidden" }}>
                                  {/* This matches the sort icon's width */}▲
                                </span>
                              )}
                          </TableHeader>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      const { key, ...rest } = getRowProps({ row });
                      return (
                        <TableRow key={row.id} {...rest}>
                          <TableCell>
                            {
                              row.cells.find(
                                (cell) => cell.info.header === "last_name"
                              ).value
                            }
                          </TableCell>
                          <TableCell>
                            {
                              row.cells.find(
                                (cell) => cell.info.header === "first_name"
                              ).value
                            }
                          </TableCell>
                          <TableCell>
                            {
                              row.cells.find(
                                (cell) => cell.info.header === "username"
                              ).value
                            }
                          </TableCell>
                          <TableCell>
                            <Button
                              id={row.id}
                              kind="ghost"
                              onClick={(event) => {
                                event.preventDefault();
                                setUser(
                                  realData.filter(
                                    (usr) =>
                                      usr["id"].toString() ===
                                      event.target["id"]
                                  )[0]
                                );
                                setConfigureOpen(true);
                              }}
                            >
                              Configure
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          />
          <Pagination
            backwardText="Previous page"
            forwardText="Next page"
            itemsPerPageText="Items per page"
            onChange={changePaginationState}
            page={page}
            pageSize={pageSize}
            pageSizes={[10, 25, 50]}
            size="md"
            totalItems={searchResults.length}
          />
        </Column>
      </Grid>
    </ErrorBoundary>
  );
};

export default UsersPage;

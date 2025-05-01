"use client";
import {
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
    TableHead,
    TableHeader,
    TableRow,
    Tag
} from "@carbon/react";
import { useCallback, useEffect, useState } from "react";
import { getUsers, getUserByID } from "@/../lib";
import { NewUserModal, ConfigureUserModal } from "@/components/modals";
import { ErrorBoundary } from "@/components/misc";

const UsersPage = () => {

  const [configureOpen, setConfigureOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [user, setUser] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [realData, setRealData] = useState([]);

  const [shouldThrowError, setShouldThrowError] = useState(false);

  useEffect(() => {
    getUsers()
      .then((users) => {
        setRealData(users);
      })
      .catch((err) => {
        setShouldThrowError(true);
      });
  }, [newOpen, configureOpen]);

  const getUserFromUsername = useCallback(
    (username) => {
      const user = realData.find((usr) => usr["username"] === username);

      return user;
    },
    [user]
  );

  const changePaginationState = (pageInfo) => {
    if (page !== pageInfo.page) {
      setPage(pageInfo.page);
    }

    if (pageSize !== pageInfo.pageSize) {
      setPageSize(pageInfo.pageSize);
    }
  };

  useEffect(() => {
    // if (!realData) {
    //   setSearchResults([...getUsers()]);
    // } else {
      setSearchResults([...realData]);
    // }

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
    <ErrorBoundary
      trigger={shouldThrowError}
      fallback={<h1>An error has occurred</h1>}
    >
      <NewUserModal open={newOpen} setOpen={setNewOpen} />
      <ConfigureUserModal
        open={configureOpen}
        setOpen={setConfigureOpen}
        user={user}
      />
      <Grid>
        <Column className="" lg={16} md={8} sm={4}>
          <Section level={1}>
            <Heading className='mb-4' style={{'fontSize': 28}}>Users</Heading>
          </Section>
          <Button onClick={() => setNewOpen(!newOpen)}>New User</Button>
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
            pageSizes={[10, 25, 50]}
            size="md"
            totalItems={searchResults.length}
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Last Name</TableHeader>
                <TableHeader>First Name</TableHeader>
                <TableHeader>Username</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {searchResults
                .filter((user) => {
                  return (
                    page * pageSize > searchResults.indexOf(user) &&
                    (page - 1) * pageSize <= searchResults.indexOf(user)
                  );
                })
                .map((user) => {
                  return (
                    <TableRow key={user["id"]}>
                      <TableCell>{user["last_name"]}</TableCell>
                      <TableCell>{user["first_name"]}</TableCell>
                      <TableCell>
                        {user["username"]}
                        {user["is_admin"] && (
                          <>
                            {" "}
                            <Tag type="blue">Administrator</Tag>
                          </>
                        )}
                        {user["is_enabled"] === false && (
                          <>
                            {" "}
                            <Tag type="red">Disabled</Tag>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          id={user["id"]}
                          kind="ghost"
                          onClick={(event) => {
                            event.preventDefault();
                            setUser(
                              realData.filter((usr) => usr["id"].toString() === event.target["id"])[0]);
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
        </Column>
      </Grid>
    </ErrorBoundary>
  );
};

export default UsersPage;
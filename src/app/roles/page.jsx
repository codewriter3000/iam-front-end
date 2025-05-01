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
  Tag,
} from "@carbon/react";
import { useCallback, useEffect, useState } from "react";
import { getRoles } from "@/../lib";
import { NewRoleModal, ConfigureRoleModal, ManageUsersForRoleModal } from "@/components/modals";
import { ErrorBoundary } from "@/components/misc";

const RolesPage = () => {
  const [configureOpen, setConfigureOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [manageUsersOpen, setManageUsersOpen] = useState(false);
  const [role, setRole] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [realData, setRealData] = useState([]);

  const [shouldThrowError, setShouldThrowError] = useState(false);

  useEffect(() => {
    getRoles()
      .then((roles) => {
        setRealData(roles);
      })
      .catch((err) => {
        setShouldThrowError(true);
      });
  }, [newOpen, configureOpen]);

  const getRoleFromName = useCallback(
    (name) => {
      const role = realData.find((rl) => rl["name"] === name);

      console.log(`role: ${JSON.stringify(role)}`)

      return role;
    },
    [realData]
  );

  const getRoleFromID = useCallback(
    (id) => {
      const role = realData.find((rl) => rl["id"] === id);
      console.log(`getRoleFromID: ${JSON.stringify(role)}`)
      return role;
    },
    [realData]
  );

  const changePaginationState = (pageInfo) => {
    if (page !== pageInfo.page) {
      setPage(pageInfo.page);
    }

    if (pageSize !== pageInfo.pageSize) {
      setPageSize(pageInfo.pageSize);
    }
  };

  return (
    <ErrorBoundary
      shouldThrowError={shouldThrowError}
      errorMessage={<h1>An error has occurred</h1>}
    >
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <Section level={1}>
            <Heading className='mb-4' style={{'fontSize': 20}}>Roles</Heading>
            <Button onClick={() => setNewOpen(true)} kind="primary">
              New Role
            </Button>
            <NewRoleModal open={newOpen} setOpen={setNewOpen} />
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {realData
                  .filter((role) => {
                    return role["name"]
                      .toLowerCase()
                      .includes(searchString.toLowerCase());
                  })
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((role) => {
                    return (
                      <TableRow key={"role/" + role["id"]}>
                        <TableCell>{role["name"]}</TableCell>
                        <TableCell>{role["description"]}</TableCell>
                        <TableCell>
                          <Button
                            id={"role/configure/" + role["id"]}
                            kind="ghost"
                            onClick={() => {
                              setRole(getRoleFromName(role["name"]));
                              setConfigureOpen(true);
                            }}
                          >
                            Configure
                          </Button>
                          <Button
                            id={"role/manageusers/" + role["id"]}
                            kind="ghost"
                            onClick={() => {
                              setRole(getRoleFromID(role["id"]));
                              setManageUsersOpen(true);
                            }}
                          >
                            Manage Users
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
            <Pagination
              page={page}
              pageSize={pageSize}
              pageSizes={[10, 20, 30, 40, 50]} // Add this line
              totalItems={realData.length}
              onChange={changePaginationState}
            />
          </Section>
        </Column>
        <ConfigureRoleModal
          open={configureOpen}
          setOpen={setConfigureOpen}
          role={role}
        />
        <ManageUsersForRoleModal
          open={manageUsersOpen}
          setOpen={setManageUsersOpen}
          role={role}
        />
      </Grid>
    </ErrorBoundary>
  );
};

export default RolesPage;

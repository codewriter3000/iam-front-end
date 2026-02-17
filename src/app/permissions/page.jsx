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
import { getPermissions } from "@/../lib";
/*import { NewPermissionModal, ConfigurePermissionModal, ManageUsersForPermissionModal } from "@/components/modals";*/
import { ErrorBoundary } from "@/components/misc";

const PermissionsPage = () => {
  const [configureOpen, setConfigureOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [manageUsersOpen, setManageUsersOpen] = useState(false);
  const [permission, setPermission] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [realData, setRealData] = useState([]);

  const [shouldThrowError, setShouldThrowError] = useState(false);

  useEffect(() => {
    getPermissions()
      .then((permissions) => {
        setRealData(permissions);
      })
      .catch((err) => {
        setShouldThrowError(true);
      });
  }, [newOpen, configureOpen]);

  const getPermissionFromName = useCallback(
    (name) => {
      const permission = realData.find((rl) => rl["name"] === name);

      console.log(`permission: ${JSON.stringify(permission)}`)

      return permission;
    },
    [realData]
  );

  const getPermissionFromID = useCallback(
    (id) => {
      const permission = realData.find((rl) => rl["id"] === id);
      console.log(`getPermissionFromID: ${JSON.stringify(permission)}`)
      return permission;
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
            <Heading className='mb-4' style={{'fontSize': 20}}>Permissions</Heading>
            <Button onClick={() => setNewOpen(true)} kind="primary">
              New Permission
            </Button>
	  {/*<NewPermissionModal open={newOpen} setOpen={setNewOpen} />*/}
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
                  .filter((permission) => {
                    return permission["name"]
                      .toLowerCase()
                      .includes(searchString.toLowerCase());
                  })
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((permission) => {
                    return (
                      <TableRow key={"permission/" + permission["id"]}>
                        <TableCell>{permission["name"]}</TableCell>
                        <TableCell>{permission["description"]}</TableCell>
                        <TableCell>
                          <Button
                            id={"permission/configure/" + permission["id"]}
                            kind="ghost"
                            onClick={() => {
                              setPermission(getPermissionFromName(permission["name"]));
                              setConfigureOpen(true);
                            }}
                          >
                            Configure
                          </Button>
                          <Button
                            id={"permission/manageusers/" + permission["id"]}
                            kind="ghost"
                            onClick={() => {
                              setPermission(getPermissionFromID(permission["id"]));
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
	  {/*<ConfigurePermissionModal
          open={configureOpen}
          setOpen={setConfigureOpen}
          permission={permission}
        />*/}
	  {/*<ManageUsersForPermissionModal
          open={manageUsersOpen}
          setOpen={setManageUsersOpen}
          permission={permission}
        />*/}
      </Grid>
    </ErrorBoundary>
  );
};

export default PermissionsPage;

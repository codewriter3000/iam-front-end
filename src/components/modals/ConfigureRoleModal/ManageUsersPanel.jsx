import { useEffect, useState } from "react";
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
} from "@carbon/react";

import { getUsers } from "@/../lib";

const ManageUsersPanel = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [realData, setRealData] = useState([]);

  useEffect(() => {
    // Simulate fetching data from an API
    getUsers()
      .then((users) => {
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
          rows={["Last Name", "First Name", "Username"]}
          headers={[
            { key: "last_name", header: "Last Name" },
            { key: "first_name", header: "First Name" },
            { key: "username", header: "Username" },
          ]}
        >
          {({
            rows,
            headers,
            getTableProps,
            getHeaderProps,
            getSelectionProps,
            getRowProps,
            selectAll = true,
          }) => (
            <Table>
              <TableHead>
                <TableRow>
                  <TableSelectAll {...getSelectionProps({ selectAll })} />
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
                        <TableSelectRow {...getSelectionProps({ user })} />
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
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </DataTable>
      </div>
    </Stack>
  );
};

export default ManageUsersPanel;

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

const Permissions = ({ userID }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [realData, setRealData] = useState([]);

  const mockData = [
    {
      id: 1,
      permission: "Permission 1A",
      assignedFrom: "Role 1",
    },
    {
      id: 2,
      permission: "Permission 1B",
      assignedFrom: "Role 1",
    },
    {
      id: 3,
      permission: "Permission 2A",
      assignedFrom: "Role 2",
    },
    {
      id: 4,
      permission: "Permission 2B",
      assignedFrom: "Role 2",
    },
    {
      id: 5,
      permission: "Permission 2C",
      assignedFrom: "Role 2",
    },
    {
      id: 6,
      permission: "Permission 2D",
      assignedFrom: "Role 2",
    },
    {
      id: 7,
      permission: "Permission 2E",
      assignedFrom: "Role 2",
    },
    {
      id: 8,
      permission: "Permission 3A",
      assignedFrom: "Role 3",
    },
    {
      id: 9,
      permission: "Permission 3B",
      assignedFrom: "Role 3",
    },
    {
      id: 10,
      permission: "Permission 3C",
      assignedFrom: "Role 3",
    },
    {
      id: 11,
      permission: "Administrator",
      systemAssigned: true,
    },
    {
      id: 12,
      permission: "Enabled",
      systemAssigned: true,
    },
    {
      id: 13,
      permission: "Permission 4A",
    },
  ];

  useEffect(() => {
    const fetchPermissions = async () => {
      const fetched = (await getUserPermissions(userID)) || [];
      console.log("Fetched permissions:", JSON.stringify(fetched));

      const normalized = fetched.map((item) => {
        const name = item.name || item.permission || "";
        return {
          id: item.id,
          permission: name,
          assignedFrom: item.assignedFrom || null,
          systemAssigned: name === "Administrator" || name === "Active" || !!item.systemAssigned,
        };
      });

      setRealData(normalized);

      if (searchString.length > 0) {
        setSearchResults(
          normalized.filter((result) => {
            return (
              result["permission"] &&
              result["permission"].toLowerCase().includes(searchString.toLowerCase())
            );
          })
        );
      } else {
        setSearchResults(normalized);
      }

      setPage(1);
    };

    fetchPermissions();
  }, [userID, searchString]);

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

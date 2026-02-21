"use client";

import {
  Button,
  Checkbox,
  Column,
  Grid,
  Heading,
  InlineNotification,
  Layer,
  Modal,
  Pagination,
  Section,
  Select,
  SelectItem,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextArea,
  TextInput,
} from "@carbon/react";
import { useEffect, useMemo, useState } from "react";
import useAdminAccess from "@/hooks/useAdminAccess";
import {
  createOAuthClient,
  createOAuthScope,
  deleteOAuthClient,
  getOAuthClients,
  getOAuthClientById,
  getOAuthScopes,
  updateOAuthClient,
} from "@/../lib/oauthApps";

import "./_oauth-apps-page.scss";

const defaultForm = {
  client_id: "",
  client_name: "",
  client_secret: "",
  token_endpoint_auth_method: "client_secret_basic",
  is_confidential: true,
  redirect_uris: "",
  grants: "authorization_code,refresh_token",
  scopes: "openid,profile,email",
};

const splitCsv = (value) =>
  (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const supportedGrants = new Set(["authorization_code", "refresh_token", "client_credentials"]);

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const validateCreateForm = (form) => {
  const errors = {};
  const grants = splitCsv(form.grants);
  const scopes = splitCsv(form.scopes);
  const redirectUris = splitCsv(form.redirect_uris);

  if (!form.client_id?.trim()) {
    errors.client_id = "Client ID is required";
  } else if (!/^[a-zA-Z0-9._-]+$/.test(form.client_id.trim())) {
    errors.client_id = "Use only letters, numbers, period, underscore, or hyphen";
  }

  if (!form.client_name?.trim()) {
    errors.client_name = "Client Name is required";
  }

  if (grants.length === 0) {
    errors.grants = "Provide at least one grant type";
  } else {
    const invalidGrants = grants.filter((grant) => !supportedGrants.has(grant));
    if (invalidGrants.length > 0) {
      errors.grants = `Unsupported grant(s): ${invalidGrants.join(", ")}`;
    }
  }

  if (grants.includes("authorization_code")) {
    if (redirectUris.length === 0) {
      errors.redirect_uris = "Redirect URI is required for authorization_code flow";
    } else if (redirectUris.some((uri) => !isValidHttpUrl(uri))) {
      errors.redirect_uris = "Every redirect URI must be a valid http(s) URL";
    }
  }

  if (scopes.length === 0) {
    errors.scopes = "Provide at least one scope";
  }

  if (form.token_endpoint_auth_method === "none" && form.is_confidential) {
    errors.token_endpoint_auth_method = "Confidential clients cannot use auth method 'none'";
  }

  return errors;
};

const toCsv = (value) => (Array.isArray(value) ? value.join(",") : "");

export default function OAuthAppsPage() {
  const { isAdmin, isResolved } = useAdminAccess();
  const [clients, setClients] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [createForm, setCreateForm] = useState(defaultForm);
  const [scopeName, setScopeName] = useState("");
  const [scopeDescription, setScopeDescription] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createModalTabIndex, setCreateModalTabIndex] = useState(0);
  const [createValidation, setCreateValidation] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createdSecret, setCreatedSecret] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pagedClients = useMemo(() => {
    const start = (page - 1) * pageSize;
    return clients.slice(start, start + pageSize);
  }, [clients, page, pageSize]);

  const loadAll = async () => {
    const [clientResult, scopeResult] = await Promise.all([
      getOAuthClients(),
      getOAuthScopes(),
    ]);
    setClients(clientResult);
    setScopes(scopeResult);
  };

  useEffect(() => {
    if (!isResolved || !isAdmin) {
      return;
    }

    loadAll().catch((err) => setError(err.message || "Failed to load OAuth data"));
  }, [isResolved, isAdmin]);

  if (!isResolved) {
    return null;
  }

  if (!isAdmin) {
    return (
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <Heading className="mb-4" style={{ fontSize: 20 }}>
            Not Authorized
          </Heading>
        </Column>
      </Grid>
    );
  }

  const setCreateField = (key, value) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
    setCreateValidation((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const onCreateClient = async () => {
    setError("");
    setMessage("");
    setCreatedSecret("");

    const validation = validateCreateForm(createForm);
    setCreateValidation(validation);
    if (Object.keys(validation).length > 0) {
      setCreateModalTabIndex(0);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOAuthClient({
        client_id: createForm.client_id,
        client_name: createForm.client_name,
        client_secret: createForm.client_secret || undefined,
        token_endpoint_auth_method: createForm.token_endpoint_auth_method,
        is_confidential: createForm.is_confidential,
        redirect_uris: splitCsv(createForm.redirect_uris),
        grants: splitCsv(createForm.grants),
        scopes: splitCsv(createForm.scopes),
      });

      setCreateForm(defaultForm);
      setIsCreateOpen(false);
      setCreateModalTabIndex(0);
      setCreateValidation({});
      setCreatedSecret(result.client_secret || "");
      setMessage("OAuth app created successfully");
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to create OAuth app");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCreateScope = async () => {
    setError("");
    setMessage("");

    try {
      await createOAuthScope({ name: scopeName, description: scopeDescription || null });
      setScopeName("");
      setScopeDescription("");
      setMessage("Scope created successfully");
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to create scope");
    }
  };

  const onOpenEdit = async (clientId) => {
    setError("");
    setMessage("");

    try {
      const client = await getOAuthClientById(clientId);
      setSelectedClient(client);
      setEditForm({
        client_id: client.client_id,
        client_name: client.client_name,
        client_secret: "",
        token_endpoint_auth_method: client.token_endpoint_auth_method,
        is_confidential: client.is_confidential,
        redirect_uris: toCsv(client.redirect_uris),
        grants: toCsv(client.grants),
        scopes: toCsv(client.scopes),
      });
      setIsEditOpen(true);
    } catch (err) {
      setError(err.message || "Failed to load client details");
    }
  };

  const onUpdateClient = async () => {
    if (!selectedClient) return;

    setError("");
    setMessage("");
    setCreatedSecret("");
    setIsSubmitting(true);

    try {
      const result = await updateOAuthClient(selectedClient.id, {
        client_name: editForm.client_name,
        client_secret: editForm.client_secret || undefined,
        token_endpoint_auth_method: editForm.token_endpoint_auth_method,
        is_confidential: editForm.is_confidential,
        redirect_uris: splitCsv(editForm.redirect_uris),
        grants: splitCsv(editForm.grants),
        scopes: splitCsv(editForm.scopes),
      });

      setIsEditOpen(false);
      setCreatedSecret(result.client_secret || "");
      setMessage("OAuth app updated successfully");
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to update OAuth app");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteClient = async (clientId) => {
    setError("");
    setMessage("");

    try {
      await deleteOAuthClient(clientId);
      setMessage("OAuth app deleted successfully");
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to delete OAuth app");
    }
  };

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <Layer level={1}>
          <Heading className="mb-4" style={{ fontSize: 20 }}>
            OAuth Apps
          </Heading>

          {error ? (
            <InlineNotification
              className="mb-4"
              lowContrast
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError("")}
            />
          ) : null}

          {message ? (
            <InlineNotification
              className="mb-4"
              lowContrast
              kind="success"
              title="Success"
              subtitle={message}
              onCloseButtonClick={() => setMessage("")}
            />
          ) : null}

          {createdSecret ? (
            <InlineNotification
              className="mb-4"
              lowContrast
              kind="warning"
              title="Save this client secret now"
              subtitle={createdSecret}
              onCloseButtonClick={() => setCreatedSecret("")}
            />
          ) : null}

          <Layer>
            <div className="oauth-apps-surface mb-5 p-5">
              <div className="flex items-center justify-between">
                <Heading style={{ fontSize: 16 }}>Add OAuth App</Heading>
                <Button
                  kind="primary"
                  onClick={() => {
                    setCreateValidation({});
                    setCreateModalTabIndex(0);
                    setIsCreateOpen(true);
                  }}
                >
                  Add OAuth App
                </Button>
              </div>
            </div>
          </Layer>

          <Layer>
            <div className="mb-5 p-5">
              <Heading className="mb-3" style={{ fontSize: 16 }}>
                Add Scope
              </Heading>
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput
                  id="oauth-scope-name"
                  labelText="Scope Name"
                  value={scopeName}
                  onChange={(event) => setScopeName(event.target.value)}
                />
                <TextInput
                  id="oauth-scope-description"
                  labelText="Scope Description"
                  value={scopeDescription}
                  onChange={(event) => setScopeDescription(event.target.value)}
                />
              </div>
              <div className="mt-3">
                <Button kind="secondary" onClick={onCreateScope}>
                  Add Scope
                </Button>
              </div>
            </div>
          </Layer>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Client ID</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Auth Method</TableHeader>
                <TableHeader>Confidential</TableHeader>
                <TableHeader>Scopes</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedClients.map((client) => (
                <TableRow key={`oauth-client/${client.id}`}>
                  <TableCell>{client.client_id}</TableCell>
                  <TableCell>{client.client_name}</TableCell>
                  <TableCell>{client.token_endpoint_auth_method}</TableCell>
                  <TableCell>{client.is_confidential ? "Yes" : "No"}</TableCell>
                  <TableCell>{(client.scopes || []).join(", ")}</TableCell>
                  <TableCell>
                    <Button kind="ghost" size="sm" onClick={() => onOpenEdit(client.id)}>
                      Configure
                    </Button>
                    <Button kind="danger--ghost" size="sm" onClick={() => onDeleteClient(client.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            page={page}
            pageSize={pageSize}
            pageSizes={[10, 20, 30, 40, 50]}
            totalItems={clients.length}
            onChange={({ page: newPage, pageSize: newPageSize }) => {
              setPage(newPage);
              setPageSize(newPageSize);
            }}
          />
        </Layer>
      </Column>

      <Modal
        open={isCreateOpen}
        modalHeading="Add OAuth App"
        primaryButtonText={isSubmitting ? "Adding..." : "Add OAuth App"}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isSubmitting}
        onRequestClose={() => {
          if (!isSubmitting) {
            setIsCreateOpen(false);
            setCreateModalTabIndex(0);
            setCreateValidation({});
          }
        }}
        onRequestSubmit={onCreateClient}
      >
        <Tabs
          selectedIndex={createModalTabIndex}
          onChange={(evt) => setCreateModalTabIndex(evt.selectedIndex)}
        >
          <TabList aria-label="Add OAuth App modal tabs">
            <Tab>Form</Tab>
            <Tab>Help</Tab>
          </TabList>
          <TabPanels>
            {createModalTabIndex === 0 ? (
              <div className="grid gap-3 md:grid-cols-2 mt-3">
                <TextInput
                  id="oauth-client-id"
                  labelText="Client ID"
                  value={createForm.client_id}
                  invalid={Boolean(createValidation.client_id)}
                  invalidText={createValidation.client_id}
                  onChange={(event) => setCreateField("client_id", event.target.value)}
                />
                <TextInput
                  id="oauth-client-name"
                  labelText="Client Name"
                  value={createForm.client_name}
                  invalid={Boolean(createValidation.client_name)}
                  invalidText={createValidation.client_name}
                  onChange={(event) => setCreateField("client_name", event.target.value)}
                />
                <TextInput
                  id="oauth-client-secret"
                  labelText="Client Secret (optional)"
                  value={createForm.client_secret}
                  onChange={(event) => setCreateField("client_secret", event.target.value)}
                />
                <Select
                  id="oauth-auth-method"
                  labelText="Token Endpoint Auth Method"
                  value={createForm.token_endpoint_auth_method}
                  invalid={Boolean(createValidation.token_endpoint_auth_method)}
                  invalidText={createValidation.token_endpoint_auth_method}
                  onChange={(event) => setCreateField("token_endpoint_auth_method", event.target.value)}
                >
                  <SelectItem value="client_secret_basic" text="client_secret_basic" />
                  <SelectItem value="client_secret_post" text="client_secret_post" />
                  <SelectItem value="none" text="none" />
                </Select>
                <TextArea
                  id="oauth-redirect-uris"
                  labelText="Redirect URIs (comma separated)"
                  value={createForm.redirect_uris}
                  invalid={Boolean(createValidation.redirect_uris)}
                  invalidText={createValidation.redirect_uris}
                  onChange={(event) => setCreateField("redirect_uris", event.target.value)}
                />
                <TextArea
                  id="oauth-grants"
                  labelText="Grant Types (comma separated)"
                  value={createForm.grants}
                  invalid={Boolean(createValidation.grants)}
                  invalidText={createValidation.grants}
                  onChange={(event) => setCreateField("grants", event.target.value)}
                />
                <TextArea
                  id="oauth-scopes"
                  labelText="Scopes (comma separated)"
                  value={createForm.scopes}
                  invalid={Boolean(createValidation.scopes)}
                  invalidText={createValidation.scopes}
                  onChange={(event) => setCreateField("scopes", event.target.value)}
                />
                <div className="pt-6">
                  <Checkbox
                    id="oauth-is-confidential"
                    labelText="Confidential client"
                    checked={createForm.is_confidential}
                    onChange={(_, data) => setCreateField("is_confidential", Boolean(data?.checked))}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <p><strong>Client ID</strong>: Unique app identifier; use letters, numbers, period, underscore, or hyphen.</p>
                <p><strong>Client Name</strong>: Human-readable app name shown in admin views.</p>
                <p><strong>Client Secret</strong>: Optional; leave blank to auto-generate for confidential clients.</p>
                <p><strong>Token Endpoint Auth Method</strong>: Client authentication style at token/introspection endpoints.</p>
                <p><strong>Redirect URIs</strong>: Comma-separated callback URLs used by authorization code flow.</p>
                <p><strong>Grant Types</strong>: Comma-separated; supported: authorization_code, refresh_token, client_credentials.</p>
                <p><strong>Scopes</strong>: Comma-separated scope names this app can request.</p>
                <p><strong>Confidential client</strong>: Enable when the app can securely store credentials (server-side apps).</p>
              </div>
            )}
          </TabPanels>
        </Tabs>
      </Modal>

      <Modal
        open={isEditOpen}
        modalHeading="Configure OAuth App"
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsEditOpen(false)}
        onRequestSubmit={onUpdateClient}
      >
        <div className="grid gap-3">
          <TextInput id="edit-client-id" labelText="Client ID" value={editForm.client_id} readOnly />
          <TextInput
            id="edit-client-name"
            labelText="Client Name"
            value={editForm.client_name}
            onChange={(event) => setEditForm((prev) => ({ ...prev, client_name: event.target.value }))}
          />
          <TextInput
            id="edit-client-secret"
            labelText="New Client Secret (optional rotation)"
            value={editForm.client_secret}
            onChange={(event) => setEditForm((prev) => ({ ...prev, client_secret: event.target.value }))}
          />
          <Select
            id="edit-auth-method"
            labelText="Token Endpoint Auth Method"
            value={editForm.token_endpoint_auth_method}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, token_endpoint_auth_method: event.target.value }))
            }
          >
            <SelectItem value="client_secret_basic" text="client_secret_basic" />
            <SelectItem value="client_secret_post" text="client_secret_post" />
            <SelectItem value="none" text="none" />
          </Select>
          <Checkbox
            id="edit-is-confidential"
            labelText="Confidential client"
            checked={editForm.is_confidential}
            onChange={(_, data) =>
              setEditForm((prev) => ({ ...prev, is_confidential: Boolean(data?.checked) }))
            }
          />
          <TextArea
            id="edit-redirect-uris"
            labelText="Redirect URIs (comma separated)"
            value={editForm.redirect_uris}
            onChange={(event) => setEditForm((prev) => ({ ...prev, redirect_uris: event.target.value }))}
          />
          <TextArea
            id="edit-grants"
            labelText="Grant Types (comma separated)"
            value={editForm.grants}
            onChange={(event) => setEditForm((prev) => ({ ...prev, grants: event.target.value }))}
          />
          <TextArea
            id="edit-scopes"
            labelText="Scopes (comma separated)"
            value={editForm.scopes}
            onChange={(event) => setEditForm((prev) => ({ ...prev, scopes: event.target.value }))}
          />
        </div>
      </Modal>
    </Grid>
  );
}

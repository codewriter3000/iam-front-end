import { apiFetch } from './config.js';

async function parseJsonSafely(response) {
    if (response.status === 204) {
        return {};
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

export async function getRoles() {
    const response = await apiFetch('/role/', { method: 'GET' });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let done = false;

    while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        result += decoder.decode(value, { stream: true });
    }

    const data = JSON.parse(result);

    return data.roles;
}

export async function getRoleByID(roleID) {
    const response = await apiFetch('/role/' + roleID, { method: 'GET' });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let done = false;

    while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        result += decoder.decode(value, { stream: true });
    }

    const data = JSON.parse(result);

    return data.role;
}

export async function createRole(role) {
    console.log(`role: ${JSON.stringify({
            name: role['name'],
            description: role['description'],
            //permission: role['permission'],
        })}`)

    const response = await apiFetch('/role/', {
        method: 'POST',
        body: JSON.stringify({
            name: role['name'],
            description: role['description'],
            //permission: role['permission'],
        })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let done = false;

    while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        result += decoder.decode(value, { stream: true });
    }

    return result;
}

export async function updateRole(roleID, payload) {
    console.log(JSON.stringify(payload));
    return apiFetch(`/role/${roleID}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }).then(res => res.json())
}

export async function deleteRole(roleID) {
    return apiFetch(`/role/${roleID}`, {
        method: 'DELETE',
    }).then(res => res.json())
}

export async function getRolesForUser(userID) {
    const response = await apiFetch(`/user/${userID}/roles`, { method: 'GET' });

    const data = await response.json();

    return data.roles;
}

export async function addManyRolesToUser(userID, roleIDs) {
    return apiFetch(`/user/${userID}/roles`, {
        method: 'POST',
        body: JSON.stringify({ roles: roleIDs })
    }).then(res => res.json())
}

export async function removeManyRolesFromUser(userID, roleIDs) {
    return apiFetch(`/user/${userID}/roles`, {
        method: 'DELETE',
        body: JSON.stringify({ roles: roleIDs })
    }).then(res => res.json())
}

export async function getUsersWithRole(roleID) {
    return apiFetch(`/role/${roleID}/user`, { method: 'GET' }).then(async res => {
        const data = await res.json();
        return data.users || [];
    })
}

export async function addUserToRole(roleID, userID) {
    return apiFetch(`/role/${roleID}/user/${userID}`, { method: 'POST' }).then(res => res.json())
}

export async function addManyUsersToRole(roleID, userIDs) {
    return apiFetch(`/role/${roleID}/users`, {
        method: 'POST',
        body: JSON.stringify({ "user-ids": userIDs })
    }).then(res => res.json())
}

export async function removeUserFromRole(roleID, userID) {
    return apiFetch(`/role/${roleID}/user/${userID}`, { method: 'DELETE' }).then(res => res.json())
}

export async function removeManyUsersFromRole(roleID, userIDs) {
    return apiFetch(`/role/${roleID}/users`, {
        method: 'DELETE',
        body: JSON.stringify({ "user-ids": userIDs })
    }).then(res => res.json())
}

export async function getPermissionsForRole(roleID) {
    return apiFetch(`/role/${roleID}/permission`, { method: 'GET' }).then(async res => {
        const data = await res.json();
        return data.permissions || [];
    })
}

export async function addPermissionToRole(roleID, permissionID) {
    return apiFetch(`/role/${roleID}/permission/${permissionID}`, { method: 'POST' }).then(parseJsonSafely)
}

export async function removePermissionFromRole(roleID, permissionID) {
    return apiFetch(`/role/${roleID}/permission/${permissionID}`, { method: 'DELETE' }).then(parseJsonSafely)
}

export async function getRolesWithPermission(permissionID) {
    const allRoles = await getRoles();

    const roleChecks = (allRoles || []).map(async (role) => {
        try {
            const permissions = await getPermissionsForRole(role.id || role["id"]);
            const hasPermission = (permissions || []).some(
                (permission) => String(permission.id || permission["id"]) === String(permissionID)
            );

            return hasPermission ? role : null;
        } catch (err) {
            return null;
        }
    });

    const resolvedRoles = await Promise.all(roleChecks);
    return resolvedRoles.filter(Boolean);
}
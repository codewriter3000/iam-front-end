import { apiFetch } from './config.js';

async function parseJsonSafely(response) {
    if (response.status === 204) {
        return {};
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

function toValidId(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function getPermissions() {
    const response = await apiFetch('/permission/', { method: 'GET' });

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

    return data.permissions;
}

export async function getPermissionByName(permissionName) {
    const response = await apiFetch('/permission/name/' + permissionName, { method: 'GET' });

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

    return data.permission;
}

export async function getPermissionByID(permissionID) {
    const response = await apiFetch('/permission/' + permissionID, { method: 'GET' });

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

    return data.permission;
}

export async function createPermission(permission) {
    const response = await apiFetch('/permission/', {
        method: 'POST',
        body: JSON.stringify({
            name: permission['name'],
            description: permission['description'],
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

export async function updatePermission(permissionID, payload) {
    return apiFetch(`/permission/${permissionID}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }).then(res => res.json())
}

export async function deletePermission(permissionID) {
    return apiFetch(`/permission/${permissionID}`, {
        method: 'DELETE',
    }).then(res => res.json())
}

export async function addPermissionToUser(permissionID, userID) {
    const permissionIdValue = toValidId(permissionID);
    const userIdValue = toValidId(userID);

    if (!permissionIdValue || !userIdValue) {
        throw new Error(`Invalid permission/user id. permissionID=${permissionID}, userID=${userID}`);
    }

    return apiFetch(`/permission/${permissionIdValue}/user/${userIdValue}`, {
	method: 'POST',
    }).then(parseJsonSafely)
}

export async function getUsersWithPermission(permissionID) {
    return apiFetch(`/permission/${permissionID}/user`, {
	method: 'GET',
    }).then(async res => {
        const data = await res.json();
        return data.users || [];
    })
}

export async function removePermissionFromUser(permissionID, userID) {
    const permissionIdValue = toValidId(permissionID);
    const userIdValue = toValidId(userID);

    if (!permissionIdValue || !userIdValue) {
        throw new Error(`Invalid permission/user id. permissionID=${permissionID}, userID=${userID}`);
    }

    return apiFetch(`/permission/${permissionIdValue}/user/${userIdValue}`, {
    method: 'DELETE',
    }).then(parseJsonSafely)
}

export async function addManyUsersToPermission(permissionID, userIDs) {
    const tasks = (userIDs || []).map((userID) => addPermissionToUser(permissionID, userID));
    return Promise.all(tasks);
}

export async function removeManyUsersFromPermission(permissionID, userIDs) {
    const tasks = (userIDs || []).map((userID) => removePermissionFromUser(permissionID, userID));
    return Promise.all(tasks);
}

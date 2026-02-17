import { baseURL } from './config.js';

function toValidId(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function getPermissions() {
    const response = await fetch(baseURL + '/permission/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

    const data = JSON.parse(result);

    return data.permissions;
}

export async function getPermissionByName(permissionName) {
    const response = await fetch(baseURL + '/permission/name/' + permissionName, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

    const data = JSON.parse(result);

    return data.permission;
}

export async function getPermissionByID(permissionID) {
    const response = await fetch(baseURL + '/permission/' + permissionID, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
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

    const data = JSON.parse(result);

    return data.permission;
}

export async function createPermission(permission) {
    const response = await fetch(baseURL + '/permission/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
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
    return fetch(baseURL + `/permission/${permissionID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(res => res.json())
}

export async function deletePermission(permissionID) {
    return fetch(baseURL + `/permission/${permissionID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(res => res.json())
}

export async function addPermissionToUser(permissionID, userID) {
    const permissionIdValue = toValidId(permissionID);
    const userIdValue = toValidId(userID);

    if (!permissionIdValue || !userIdValue) {
        throw new Error(`Invalid permission/user id. permissionID=${permissionID}, userID=${userID}`);
    }

    return fetch(baseURL + `/permission/${permissionIdValue}/user/${userIdValue}`, {
	method: 'POST',
	headers: {
	    'Content-Type': 'application/json'
	},
    }).then(res => res.json())
}

export async function getUsersWithPermission(permissionID) {
    return fetch(baseURL + `/permission/${permissionID}/user`, {
	method: 'GET',
	headers: {
	    'Content-Type': 'application/json'
	},
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

    return fetch(baseURL + `/permission/${permissionIdValue}/user/${userIdValue}`, {
	method: 'DELETE',
	headers: {
	    'Content-Type': 'application/json'
	},
    }).then(res => res.json())
}

export async function addManyUsersToPermission(permissionID, userIDs) {
    const tasks = (userIDs || []).map((userID) => addPermissionToUser(permissionID, userID));
    return Promise.all(tasks);
}

export async function removeManyUsersFromPermission(permissionID, userIDs) {
    const tasks = (userIDs || []).map((userID) => removePermissionFromUser(permissionID, userID));
    return Promise.all(tasks);
}

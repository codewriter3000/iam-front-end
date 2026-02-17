import { baseURL } from './config.js';

export async function getRoles() {
    const response = await fetch(baseURL + '/role/', {
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

    return data.roles;
}

export async function getRoleByID(roleID) {
    const response = await fetch(baseURL + '/role/' + roleID, {
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

    return data.role;
}

export async function createRole(role) {
    console.log(`role: ${JSON.stringify({
            name: role['name'],
            description: role['description'],
            //permission: role['permission'],
        })}`)

    const response = await fetch(baseURL + '/role/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
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
    return fetch(baseURL + `/role/${roleID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(res => res.json())
}

export async function deleteRole(roleID) {
    return fetch(baseURL + `/role/${roleID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(res => res.json())
}

export async function getRolesForUser(userID) {
    const response = await fetch(baseURL + `/user/${userID}/roles`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    const data = await response.json();

    return data.roles;
}

export async function addManyRolesToUser(userID, roleIDs) {
    return fetch(baseURL + `/user/${userID}/roles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roles: roleIDs })
    }).then(res => res.json())
}

export async function removeManyRolesFromUser(userID, roleIDs) {
    return fetch(baseURL + `/user/${userID}/roles`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roles: roleIDs })
    }).then(res => res.json())
}

export async function getUsersWithRole(roleID) {
    return fetch(baseURL + `/role/${roleID}/user`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(res => res.json())
}

export async function addUserToRole(roleID, userID) {
    return fetch(baseURL + `/role/${roleID}/user/${userID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(res => res.json())
}

export async function addManyUsersToRole(roleID, userIDs) {
    return fetch(baseURL + `/role/${roleID}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userIDs)
    }).then(res => res.json())
}

export async function removeUserFromRole(roleID, userID) {
    return fetch(baseURL + `/role/${roleID}/user/${userID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(res => res.json())
}

export async function removeManyUsersFromRole(roleID, userIDs) {
    return fetch(baseURL + `/role/${roleID}/users`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userIDs)
    }).then(res => res.json())
}
import { baseURL } from './config.js';
import { addPermissionToUser, getPermissionByName } from './permissions.js';

async function resolvePermissionId(possibleNames) {
    for (const permissionName of possibleNames) {
        try {
            const permission = await getPermissionByName(permissionName);
            if (permission?.id) {
                return permission.id;
            }
        } catch (err) {
            // try next name
        }
    }

    return null;
}

export async function getUsers() {
    const response = await fetch(baseURL + '/user/', {
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

    return data.users;
}

export async function getUserByID(userID) {
    const response = await fetch(baseURL + '/user/' + userID, {
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

    return data;
}

export async function registerUser(user) {
    const response = await fetch(baseURL + '/user/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: user['username'],
            password: user['password'],
            first_name: user['first_name'] || '',
            last_name: user['last_name'] || '',
            email: user['email'],
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

    let createdUserId = null;

    try {
        const parsed = JSON.parse(result);
        createdUserId = parsed?.user?.id || parsed?.id || null;
    } catch (e) {
        createdUserId = null;
    }

    if (!createdUserId) {
        try {
            const users = await getUsers();
            const createdUser = users.find((u) => u.username === user['username']);
            createdUserId = createdUser?.id || null;
        } catch (err) {
            console.error("Error resolving created user ID:", err);
        }
    }

    if (createdUserId && user['is_admin']) {
        const adminPermissionId = await resolvePermissionId(["Administrator", "Admin"]);
        if (adminPermissionId) {
            addPermissionToUser(adminPermissionId, createdUserId).then(() => {
                console.log("Admin permission added to user");
            }).catch((err) => {
                console.error("Error adding admin permission to user:", err);
            });
        } else {
            console.warn("Could not resolve Administrator permission ID");
        }
    }

    if (createdUserId && user['is_enabled']) {
        const enabledPermissionId = await resolvePermissionId(["Active", "Enabled"]);
        if (enabledPermissionId) {
            addPermissionToUser(enabledPermissionId, createdUserId).then(() => {
                console.log("Enabled permission added to user");
            }).catch((err) => {
                console.error("Error adding enabled permission to user:", err);
            });
        } else {
            console.warn("Could not resolve Active/Enabled permission ID");
        }
    }

    return result;
}

export async function updateUser(userID, payload) {
    return fetch(baseURL + `/user/${userID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(res => res.json())
}

export async function deleteUser(userID) {
    return fetch(baseURL + `/user/${userID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(async res => {
        const text = await res.text();
        return text ? JSON.parse(text) : {};
    });
}

export async function getUserPermissions(userID) {
    return fetch(baseURL + `/user/${userID}/permissions`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(async res => {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        return data.permissions || [];
    });
}

export async function getUserRoles(userID) {
    return fetch(baseURL + `/user/${userID}/roles`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(async res => {
        const text = await res.text();
        return text ? JSON.parse(text) : {};
    });
}

export async function addRolesToUser(userID, roles) {
    return fetch(baseURL + `/user/${userID}/roles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
	body: roles
    }).then(async res => {
        const text = await res.text();
        return text ? JSON.parse(text) : {};
    });
}

export async function removeRolesFromUser(userID, roles) {
    return fetch(baseURL + `/user/${userID}/roles`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
	body: roles
    }).then(async res => {
        const text = await res.text();
        return text ? JSON.parse(text) : {};
    });
}

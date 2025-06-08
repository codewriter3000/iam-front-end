import users from "../public/users.json";

import {
  getUsers,
  getUserByID,
  registerUser,
  updateUser,
  deleteUser,
} from "./users.js";

import {
  getRoles,
  getRoleByID,
  createRole,
  updateRole,
  deleteRole,
  getRolesForUser,
  getUsersWithRole,
  addUserToRole,
  addManyUsersToRole,
  removeUserFromRole,
  removeManyUsersFromRole,
} from "./roles.js";

import {
  getPermissions,
  getPermissionByID,
  createPermission,
  updatePermission,
  deletePermission,
} from "./permissions.js";

export {
    users,
    getUsers,
    getUserByID,
    registerUser,
    updateUser,
    deleteUser,
    getRolesForUser,
    getRoles,
    getRoleByID,
    createRole,
    updateRole,
    deleteRole,
    getUsersWithRole,
    addUserToRole,
    addManyUsersToRole,
    removeUserFromRole,
    removeManyUsersFromRole,
    getPermissions,
    getPermissionByID,
    createPermission,
    updatePermission,
    deletePermission,
};
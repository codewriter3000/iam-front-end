import users from "../public/users.json";

import {
  getUsers,
  getUserByID,
  registerUser,
  updateUser,
  deleteUser,
  getUserPermissions,
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
  addManyRolesToUser,
  removeUserFromRole,
  removeManyUsersFromRole,
  removeManyRolesFromUser,
} from "./roles.js";

import {
  getPermissions,
  getPermissionByID,
  getPermissionByName,
  createPermission,
  updatePermission,
  deletePermission,
  addPermissionToUser,
  removePermissionFromUser,
} from "./permissions.js";

export {
    users,
    getUsers,
    getUserByID,
    registerUser,
    updateUser,
    deleteUser,
    getUserPermissions,
    getRolesForUser,
    getRoles,
    getRoleByID,
    createRole,
    updateRole,
    deleteRole,
    getUsersWithRole,
    addUserToRole,
    addManyUsersToRole,
    addManyRolesToUser,
    removeUserFromRole,
    removeManyUsersFromRole,
    removeManyRolesFromUser,
    getPermissions,
    getPermissionByID,
    getPermissionByName,
    createPermission,
    updatePermission,
    deletePermission,
    addPermissionToUser,
    removePermissionFromUser,
};
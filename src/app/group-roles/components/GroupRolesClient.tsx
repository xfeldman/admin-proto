'use client';

import React, { useState, useRef, useEffect } from 'react';

// Types for our data structure
type Permission = 'Read' | 'Add' | 'Edit' | 'Modify' | 'Delete' | 'Post';

type Resource = {
  name: string;
  permissions: Permission[];
};

type Role = {
  id: number;
  name: string;
  description: string;
  resources: Resource[];
};

// Initial mock data
const initialRoles: Role[] = [
  {
    id: 1,
    name: 'Member',
    description: 'Basic access for regular users',
    resources: [
      { name: 'Group Members', permissions: ['Read', 'Add', 'Delete'] },
      { name: 'Forum Categories', permissions: ['Read', 'Add', 'Modify', 'Delete', 'Post'] },
      { name: 'Category1', permissions: ['Edit', 'Delete', 'Post'] },
      { name: 'Category2', permissions: ['Post'] },
    ]
  },
  {
    id: 2,
    name: 'Admin',
    description: 'Full access for administrators',
    resources: [
      { name: 'Group Members', permissions: ['Read', 'Add', 'Delete'] },
      { name: 'Forum Categories', permissions: ['Read', 'Add', 'Modify', 'Delete', 'Post'] },
    ]
  },
  {
    id: 3,
    name: 'Moderator',
    description: 'Moderation capabilities for forum content',
    resources: [
      { name: 'Forum Categories', permissions: ['Read', 'Edit', 'Modify', 'Delete', 'Post'] },
      { name: 'Category1', permissions: ['Read', 'Edit', 'Delete', 'Post'] },
      { name: 'Category2', permissions: ['Read', 'Edit', 'Post'] },
    ]
  }
];

// All available permissions
const allPermissions: Permission[] = ['Read', 'Add', 'Edit', 'Modify', 'Delete', 'Post'];

// All available resources
const allResources: string[] = ['Group Members', 'Forum Categories', 'Category1', 'Category2', 'User Profiles', 'System Settings', 'Audit Logs'];

// Resource descriptions
const resourceDescriptions: Record<string, string> = {
  'Group Members': 'Manage members of your groups',
  'Forum Categories': 'Organize discussions by topics',
  'Category1': 'First level categorization',
  'Category2': 'Second level categorization',
  'User Profiles': 'User account information',
  'System Settings': 'Configure system parameters',
  'Audit Logs': 'Track system activities'
};

// Permission descriptions
const permissionDescriptions: Record<Permission, string> = {
  'Read': 'View the resource and its contents',
  'Add': 'Create new items within the resource',
  'Edit': 'Make changes to existing items',
  'Modify': 'Change resource settings and properties',
  'Delete': 'Remove items from the resource',
  'Post': 'Submit content to the resource'
};

export default function GroupRolesClient() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState<number>(1);
  const [editingRole, setEditingRole] = useState<Role>(initialRoles[0]);
  const [newResourceName] = useState<string>('');
  const [isResourceDropdownOpen, setIsResourceDropdownOpen] = useState<boolean>(false);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);
  const resourceDropdownRef = useRef<HTMLDivElement | null>(null);

  // Get the currently selected role
  const selectedRole = roles.find(role => role.id === selectedRoleId) || roles[0];

  // Handle role selection
  const handleSelectRole = (roleId: number) => {
    setSelectedRoleId(roleId);
    const role = roles.find(r => r.id === roleId);
    if (role) {
      setEditingRole({ ...role });
    }
  };

  // Handle role name change
  const handleRoleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingRole({ ...editingRole, name: e.target.value });
  };

  // Handle role description change
  const handleRoleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingRole({ ...editingRole, description: e.target.value });
  };

  // Handle permission change
  const handlePermissionChange = (resourceIndex: number, permission: Permission) => {
    const updatedResources = [...editingRole.resources];
    const currentPermissions = updatedResources[resourceIndex].permissions;

    // Toggle the permission (add if not present, remove if present)
    if (currentPermissions.includes(permission)) {
      updatedResources[resourceIndex] = {
        ...updatedResources[resourceIndex],
        permissions: currentPermissions.filter(p => p !== permission)
      };
    } else {
      updatedResources[resourceIndex] = {
        ...updatedResources[resourceIndex],
        permissions: [...currentPermissions, permission]
      };
    }

    setEditingRole({ ...editingRole, resources: updatedResources });
  };

  // Close resource dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle resource dropdown
      if (isResourceDropdownOpen && 
          resourceDropdownRef.current && 
          !resourceDropdownRef.current.contains(event.target as Node)) {
        setIsResourceDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isResourceDropdownOpen]);


  // Save changes
  const handleSaveChanges = () => {
    setRoles(roles.map(role => role.id === editingRole.id ? editingRole : role));
  };

  // Add new role
  const handleAddRole = () => {
    const newId = Math.max(...roles.map(role => role.id)) + 1;
    const newRole: Role = {
      id: newId,
      name: `New ${newId}`,
      description: '',
      resources: []
    };

    setRoles([...roles, newRole]);
    setSelectedRoleId(newId);
    setEditingRole(newRole);
  };

  // Delete role
  const handleDeleteRole = (roleId: number) => {
    // Set the role as being deleted (for confirmation)
    setDeletingRoleId(roleId);
  };

  // Confirm delete role
  const confirmDeleteRole = () => {
    if (deletingRoleId === null) return;

    // Filter out the role to be deleted
    const updatedRoles = roles.filter(role => role.id !== deletingRoleId);

    // Update the roles state
    setRoles(updatedRoles);

    // If the deleted role was the selected role, select another role
    if (selectedRoleId === deletingRoleId) {
      const newSelectedId = updatedRoles.length > 0 ? updatedRoles[0].id : 0;
      setSelectedRoleId(newSelectedId);

      // Update the editing role
      const newEditingRole = updatedRoles.length > 0 ? { ...updatedRoles[0] } : null;
      if (newEditingRole) {
        setEditingRole(newEditingRole);
      }
    }

    // Reset the deleting role id
    setDeletingRoleId(null);
  };

  // Cancel delete role
  const cancelDeleteRole = () => {
    setDeletingRoleId(null);
  };

  // Remove resource
  const handleRemoveResource = (index: number) => {
    const updatedResources = [...editingRole.resources];
    updatedResources.splice(index, 1);
    setEditingRole({ ...editingRole, resources: updatedResources });
  };

  return (
    <div className="h-screen p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Group Roles</h1>

      {/* Confirmation Dialog */}
      {deletingRoleId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this role? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded"
                onClick={cancelDeleteRole}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                onClick={confirmDeleteRole}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
        {/* Left Panel - Roles List */}
        <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Group Roles</h2>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={handleAddRole}
            >
              Add New Role
            </button>
          </div>

          <ul className="space-y-2">
            {roles.map(role => (
              <li 
                key={role.id}
                className={`p-2 rounded ${
                  selectedRoleId === role.id 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="cursor-pointer flex-grow flex flex-col"
                       onClick={() => handleSelectRole(role.id)}>
                    <span>{role.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {role.description}
                    </span>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRole(role.id);
                    }}
                    aria-label={`Delete ${role.name}`}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Panel - Role Editing */}
        <div className="w-full md:w-3/4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col overflow-y-auto h-full">
          <h2 className="text-lg font-semibold mb-4">Edit Role: {selectedRole.name}</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={editingRole.name}
              onChange={handleRoleNameChange}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={editingRole.description}
              onChange={handleRoleDescriptionChange}
              placeholder="Enter a description for this role"
              rows={3}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-200 dark:border-gray-600 p-2 text-left">Resources</th>
                  <th className="border border-gray-200 dark:border-gray-600 p-2 text-left">Permissions</th>
                </tr>
              </thead>
              <tbody>
                {editingRole.resources.map((resource, index) => (
                  <tr key={index} className="border-b dark:border-gray-600">
                    <td className="border border-gray-200 dark:border-gray-600 p-2">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span>{resource.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {resourceDescriptions[resource.name] || ''}
                          </span>
                        </div>
                        <button
                          className="text-red-500 hover:text-red-700 ml-2"
                          onClick={() => handleRemoveResource(index)}
                          aria-label={`Remove ${resource.name}`}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-200 dark:border-gray-600 p-2">
                      <div className="flex flex-wrap gap-2">
                        {allPermissions.map(permission => {
                          const isEnabled = resource.permissions.includes(permission);
                          return (
                            <div 
                              key={permission}
                              className={`flex items-center p-1 rounded cursor-pointer ${
                                isEnabled 
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' 
                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                              }`}
                              onClick={() => handlePermissionChange(index, permission)}
                              title={permissionDescriptions[permission]}
                            >
                              <span className="mr-1">
                                {isEnabled 
                                  ? '✓' // Green checkmark for enabled
                                  : '✗' // Red X for disabled
                                }
                              </span>
                              <span>{permission}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          <div className="mt-4 mb-4">
            <div className="relative w-1/2" ref={resourceDropdownRef}>
              <button
                type="button"
                className="w-full p-1 text-sm border rounded flex justify-between items-center dark:bg-gray-700 dark:border-gray-600"
                onClick={() => setIsResourceDropdownOpen(!isResourceDropdownOpen)}
              >
                <span className={newResourceName ? "" : "text-gray-400"}>
                  {newResourceName || "Select a resource to add it to the table"}
                </span>
                <span className="ml-2 flex-shrink-0">
                  {isResourceDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {isResourceDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg max-h-40 overflow-y-auto">
                  {allResources
                    .filter(resource => !editingRole.resources.some(r => r.name === resource))
                    .map(resource => (
                      <div 
                        key={resource}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => {
                          setIsResourceDropdownOpen(false);
                          setEditingRole({
                            ...editingRole,
                            resources: [
                              ...editingRole.resources,
                              { name: resource, permissions: [] }
                            ]
                          });
                        }}
                      >
                        <div className="flex flex-col">
                          <span>{resource}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {resourceDescriptions[resource] || ''}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button 
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded"
              onClick={() => handleSelectRole(selectedRoleId)}
            >
              Cancel
            </button>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
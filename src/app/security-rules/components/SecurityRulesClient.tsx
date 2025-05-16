'use client';

import React, { useState, useRef, useEffect } from 'react';

// Types for our data structure
type Permission = 'Read' | 'Add' | 'Edit' | 'Modify' | 'Delete' | 'Post';

type Resource = {
  name: string;
  permissions: Permission[];
};

type Rule = {
  id: number;
  name: string;
  resources: Resource[];
};

// Initial mock data
const initialRules: Rule[] = [
  {
    id: 1,
    name: 'Default Rule',
    resources: [
      { name: 'Group Members', permissions: ['Read', 'Add', 'Delete'] },
      { name: 'Forum Categories', permissions: ['Read', 'Add', 'Modify', 'Delete', 'Post'] },
      { name: 'Category1', permissions: ['Edit', 'Delete', 'Post'] },
      { name: 'Category2', permissions: ['Post'] },
    ]
  },
  {
    id: 2,
    name: 'Admin Rule',
    resources: [
      { name: 'Group Members', permissions: ['Read', 'Add', 'Delete'] },
      { name: 'Forum Categories', permissions: ['Read', 'Add', 'Modify', 'Delete', 'Post'] },
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

export default function SecurityRulesClient() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [selectedRuleId, setSelectedRuleId] = useState<number>(1);
  const [editingRule, setEditingRule] = useState<Rule>(initialRules[0]);
  const [newResourceName] = useState<string>('');
  const [isResourceDropdownOpen, setIsResourceDropdownOpen] = useState<boolean>(false);
  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);
  const resourceDropdownRef = useRef<HTMLDivElement | null>(null);

  // Get the currently selected rule
  const selectedRule = rules.find(rule => rule.id === selectedRuleId) || rules[0];

  // Handle rule selection
  const handleSelectRule = (ruleId: number) => {
    setSelectedRuleId(ruleId);
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setEditingRule({ ...rule });
    }
  };

  // Handle rule name change
  const handleRuleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingRule({ ...editingRule, name: e.target.value });
  };

  // Handle permission change
  const handlePermissionChange = (resourceIndex: number, permission: Permission) => {
    const updatedResources = [...editingRule.resources];
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

    setEditingRule({ ...editingRule, resources: updatedResources });
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
    setRules(rules.map(rule => rule.id === editingRule.id ? editingRule : rule));
  };

  // Add new rule
  const handleAddRule = () => {
    const newId = Math.max(...rules.map(rule => rule.id)) + 1;
    const newRule: Rule = {
      id: newId,
      name: `New Rule ${newId}`,
      resources: []
    };

    setRules([...rules, newRule]);
    setSelectedRuleId(newId);
    setEditingRule(newRule);
  };

  // Delete rule
  const handleDeleteRule = (ruleId: number) => {
    // Set the rule as being deleted (for confirmation)
    setDeletingRuleId(ruleId);
  };

  // Confirm delete rule
  const confirmDeleteRule = () => {
    if (deletingRuleId === null) return;

    // Filter out the rule to be deleted
    const updatedRules = rules.filter(rule => rule.id !== deletingRuleId);

    // Update the rules state
    setRules(updatedRules);

    // If the deleted rule was the selected rule, select another rule
    if (selectedRuleId === deletingRuleId) {
      const newSelectedId = updatedRules.length > 0 ? updatedRules[0].id : 0;
      setSelectedRuleId(newSelectedId);

      // Update the editing rule
      const newEditingRule = updatedRules.length > 0 ? { ...updatedRules[0] } : null;
      if (newEditingRule) {
        setEditingRule(newEditingRule);
      }
    }

    // Reset the deleting rule id
    setDeletingRuleId(null);
  };

  // Cancel delete rule
  const cancelDeleteRule = () => {
    setDeletingRuleId(null);
  };

  // Remove resource
  const handleRemoveResource = (index: number) => {
    const updatedResources = [...editingRule.resources];
    updatedResources.splice(index, 1);
    setEditingRule({ ...editingRule, resources: updatedResources });
  };

  return (
    <div className="h-screen p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Security Rules</h1>

      {/* Confirmation Dialog */}
      {deletingRuleId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this rule? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded"
                onClick={cancelDeleteRule}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                onClick={confirmDeleteRule}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
        {/* Left Panel - Rules List */}
        <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Rules</h2>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={handleAddRule}
            >
              Add New Rule
            </button>
          </div>

          <ul className="space-y-2">
            {rules.map(rule => (
              <li 
                key={rule.id}
                className={`p-2 rounded ${
                  selectedRuleId === rule.id 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span 
                    className="cursor-pointer flex-grow"
                    onClick={() => handleSelectRule(rule.id)}
                  >
                    {rule.name}
                  </span>
                  <button
                    className="text-red-500 hover:text-red-700 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRule(rule.id);
                    }}
                    aria-label={`Delete ${rule.name}`}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Panel - Rule Editing */}
        <div className="w-full md:w-3/4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col overflow-y-auto h-full">
          <h2 className="text-lg font-semibold mb-4">Edit Rule: {selectedRule.name}</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Rule Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={editingRule.name}
              onChange={handleRuleNameChange}
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
                {editingRule.resources.map((resource, index) => (
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
                    .filter(resource => !editingRule.resources.some(r => r.name === resource))
                    .map(resource => (
                      <div 
                        key={resource}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => {
                          setIsResourceDropdownOpen(false);
                          setEditingRule({
                            ...editingRule,
                            resources: [
                              ...editingRule.resources,
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
              onClick={() => handleSelectRule(selectedRuleId)}
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

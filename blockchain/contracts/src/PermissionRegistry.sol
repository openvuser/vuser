// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PermissionRegistry
 * @dev Manages user permissions for AI agents to interact with publisher sites.
 * Permissions are stored as a mapping: (userAddress => publisherDomainHash => bool)
 */
contract PermissionRegistry {

    // userAddress => keccak256(publisherDomain) => isPermitted
    mapping(address => mapping(bytes32 => bool)) public permissions;

    event PermissionUpdated(address indexed user, string domain, bool permitted);

    /**
     * @dev Grants or revokes permission for a publisher domain.
     * @param publisherDomain The domain, e.g., "example-travel.com"
     * @param permit The permission status (true = grant, false = revoke)
     */
    function setPermission(string calldata publisherDomain, bool permit) public {
        bytes32 domainHash = keccak256(bytes(publisherDomain));
        permissions[msg.sender][domainHash] = permit;
        emit PermissionUpdated(msg.sender, publisherDomain, permit);
    }

    /**
     * @dev Checks if a user has granted permission for a domain.
     */
    function hasPermission(address user, string calldata publisherDomain) public view returns (bool) {
        bytes32 domainHash = keccak256(bytes(publisherDomain));
        return permissions[user][domainHash];
    }
}
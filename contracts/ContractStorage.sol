// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract ContractStorage{
    mapping(bytes32 => bytes32) private bytes32Storage;
    mapping(bytes32 => uint256)  private uintStorage;

    /// @param _key The key for the record
    function getBytes32(bytes32 _key) internal view returns (bytes32 r) {
        return bytes32Storage[_key];
    }

    /// @param _key The key for the record
    function setBytes32(bytes32 _key, bytes32 _value) internal {
        bytes32Storage[_key] = _value;
    }

    /// @param _key The key for the record
    function getUint(bytes32 _key) internal view returns (uint256 r) {
        return uintStorage[_key];
    }

    /// @param _key The key for the record
    function setUint(bytes32 _key, uint _value) internal {
        uintStorage[_key] = _value;
    }
}
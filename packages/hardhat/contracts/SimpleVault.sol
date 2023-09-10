// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "hardhat/console.sol";

contract SimpleVault is ERC4626Upgradeable {
	function initialize(ERC20Upgradeable _erc20) public initializer {
		__ERC4626_init(_erc20);
		__ERC20_init(_erc20.name(), _erc20.symbol());
	}

	function previewDeposit(
		uint256 assets
	) public view override returns (uint256) {
		console.log("total supply: %s", totalSupply());
		console.log("total assets: %s", totalAssets());
		console.log("decimal offset: %s", _decimalsOffset());
		uint256 res = super.previewDeposit(assets);
		console.log("shares to deposit: %s", res);
		return res;
	}
}

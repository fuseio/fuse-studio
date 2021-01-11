pragma solidity ^0.6;

// SPDX-License-Identifier: UNLICENSED

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "./libraries/ABDKMath64x64.sol";
import "./ExchangeERC20.sol";

contract Exchange is ExchangeERC20, Ownable {
    using SafeMath for uint;
    using ABDKMath64x64 for int128;
    using SafeERC20 for IERC20;

    int128 private r; // A / B = r
    int128 private r_inv; // r_inv = 1 / r
    address public assetA;
    address public assetB;

    constructor(string memory _name, string memory _symbol, address _assetA, address _assetB, uint _a, uint _b) 
    ExchangeERC20(_name, _symbol) public {        
        assetA = _assetA;
        assetB = _assetB;
        r = ABDKMath64x64.divu(_a, _b);
        r_inv = r.inv();
    }

    function _swap(address _assetA, address _assetB, uint amountA, uint amountB) internal {
        require(amountA <= IERC20(assetA).allowance(msg.sender, address(this)), "Insufficient allowance");
        require(amountB <= IERC20(assetB).balanceOf(address(this)), "Insufficient balance");

        IERC20(_assetA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(_assetB).safeTransfer(msg.sender, amountB);
    }

    function swapAforB(uint amount) public returns(uint received) {
        received = r_inv.mulu(amount);
        _swap(assetA, assetB, amount, received);
    }

    function swapBforA(uint amount) public returns(uint received) {
        received = r.mulu(amount);
        _swap(assetB, assetA, amount, received);
    }

    function mintLiquidity(uint256 amountA) public returns(uint minted) {
        require(IERC20(assetA).allowance(msg.sender, address(this)) >= amountA, "Insufficient allowance");
        
        uint amountB = r_inv.mulu(amountA);
        require(IERC20(assetB).allowance(msg.sender, address(this)) >= amountB, "Insufficient allowance");

         
        uint totalLiquidity = totalSupply();

        if(totalLiquidity == 0) {
            minted = amountA;
        } else {
            uint reserveA = IERC20(assetA).balanceOf(address(this));
            int128 unitShare = ABDKMath64x64.divu(totalLiquidity, reserveA);
            minted = unitShare.mulu(amountA);
        }

        IERC20(assetA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(assetB).safeTransferFrom(msg.sender, address(this), amountB);
        _mint(msg.sender, minted);
    }

    function burnLiquidity(uint256 amount) public returns(uint totalA, uint totalB) {
        require(amount >= 0 && amount <= allowance(msg.sender, address(this)), "Insufficient allowance");

        uint reserveA = IERC20(assetA).balanceOf(address(this));
        uint reserveB = IERC20(assetB).balanceOf(address(this));
        uint totalLiquidity = totalSupply();
        int128 unitShare = ABDKMath64x64.divu(amount, totalLiquidity);
        
        totalA = unitShare.mulu(reserveA);
        totalB = unitShare.mulu(reserveB);

        IERC20(assetA).safeTransfer(msg.sender, totalA);
        IERC20(assetB).safeTransfer(msg.sender, totalB);

        burnFrom(msg.sender, amount);
    }
}
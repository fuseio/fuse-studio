pragma solidity ^0.6;

// SPDX-License-Identifier: UNLICENSED

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "./ExchangeERC20.sol";

contract Exchange is ExchangeERC20, Ownable, Pausable {
    using SafeMath for uint;
    using SafeERC20 for IERC20;

    uint256 public r; // A / B = r [A >= B]
    address public assetA;
    address public assetB;

    event LiquidityMinted(address indexed by, uint amount, uint _a, uint _b);
    event LiquidityBurned(address indexed by, uint amount, uint _a, uint _b);
    event Swap(address indexed who, address indexed _assetA, address _assetB, uint _a, uint _b);

    constructor(string memory _name, string memory _symbol, address _assetA, address _assetB, uint _a, uint _b) 
    ExchangeERC20(_name, _symbol) public {   
        require(_assetA != address(0) && _assetB != address(0), "assetA or assetB should not be the zero address!");
        require(_a > 0, "Amount _a should not be zero");
        require(_b > 0, "Amount _b should not be zero");
        require(_a >= _b, "Amount _a should be greater or equal to _b");
        assetA = _assetA;
        assetB = _assetB;
        r = _a.div(_b);
    }

    function _swap(address _assetA, address _assetB, uint _amountA, uint _amountB) internal {
        require(_amountA > 0, "Amount to swap should be greater than 0");
        require(_amountA <= IERC20(_assetA).allowance(msg.sender, address(this)), "Insufficient allowance for the chosen asset");
        require(_amountB <= IERC20(_assetB).balanceOf(address(this)), "Insufficient liquidity for the chosen asset");

        IERC20(_assetA).safeTransferFrom(msg.sender, address(this), _amountA);
        IERC20(_assetB).safeTransfer(msg.sender, _amountB);
        
        emit Swap(msg.sender, _assetA, _assetB, _amountA, _amountB);
    }

    function swapAforB(uint amount) whenNotPaused() public returns(uint received)  {
        received = amount.div(r);
        _swap(assetA, assetB, amount, received);
    }

    function swapBforA(uint amount) whenNotPaused() public returns(uint received) {
        received = r.mul(amount);
        _swap(assetB, assetA, amount, received);
    }

    function mintLiquidity(uint256 amountA) whenNotPaused() public returns(uint minted) {
        require(amountA > 0, "amountA should be greater than 0");
        require(amountA <= IERC20(assetA).allowance(msg.sender, address(this)), "Insufficient allowance on assetA");
        
        uint amountB = amountA.div(r);
        require(amountB > 0, "Insufficient deposit of assetA (amountB = 0)");
        require(amountB <= IERC20(assetB).allowance(msg.sender, address(this)), "Insufficient allowance on assetB");
         
        uint liquidity = totalSupply();
        if(liquidity == 0) {
            minted = amountA;
        } else {
            uint reserveA = IERC20(assetA).balanceOf(address(this));
            minted = amountA.mul(liquidity).div(reserveA);
        }

        IERC20(assetA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(assetB).safeTransferFrom(msg.sender, address(this), amountB);
        _mint(msg.sender, minted);

        emit LiquidityMinted(msg.sender, minted, amountA, amountB);
    }

    function burnLiquidity(uint256 amount) whenNotPaused() public returns(uint totalA, uint totalB) {
        require(amount > 0, "amount should not be zero");
        require(amount <= allowance(msg.sender, address(this)), "Insufficient allowance of liquidity tokens");

        uint reserveA = IERC20(assetA).balanceOf(address(this));
        uint reserveB = IERC20(assetB).balanceOf(address(this));
        uint liquidity = totalSupply();
        
        require(liquidity > 0, "Liquidity is 0");

        totalA = amount.mul(reserveA).div(liquidity);
        totalB = amount.mul(reserveB).div(liquidity);

        burn(amount);
        IERC20(assetA).safeTransfer(msg.sender, totalA);
        IERC20(assetB).safeTransfer(msg.sender, totalB);

        emit LiquidityBurned(msg.sender, amount, totalA, totalB);
    }
}
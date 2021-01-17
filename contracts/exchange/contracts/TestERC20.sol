import "openzeppelin-solidity/contracts/presets/ERC20PresetMinterPauser.sol";

contract TestERC20 is ERC20PresetMinterPauser {
    constructor(string memory _name, string memory _symbol) public
    ERC20PresetMinterPauser(_name, _symbol) {
        
    }
}

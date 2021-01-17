const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const TestERC20 = contract.fromArtifact('TestERC20');
const Exchange = contract.fromArtifact('Exchange');

describe('Exchange', async function () {
  const [sender, lprovider, lprovider_2, swapper] =  accounts;

  describe('Contract creation', async function() {
    
    beforeEach(async function () {
        this.erc20A = await TestERC20.new("TokenA", "TKA", { from: sender });
        this.erc20B = await TestERC20.new("TokenB", "TKB", { from: sender });
    });
    
    it('reverts creation when _a = 0', async function () {
        await expectRevert(
            Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, 0, 1, { from: sender }),
            'Amount _a should not be zero',
        );
    });

    it('reverts creation when _b = 0', async function () {
        await expectRevert(
            Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, 1, 0, { from: sender }),
            'Amount _b should not be zero',
        );
    });

    it('reverts creation when _a < _b', async function () {
        await expectRevert(
            Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, 1, 2, { from: sender }),
            'Amount _a should be greater or equal to _b',
        );
    });
    
    it('reverts when _assetA is zero address', async function () {
        await expectRevert(
            Exchange.new("ExchangePool", "EXP", constants.ZERO_ADDRESS, this.erc20B.address, 1, 1, { from: sender }),
            'assetA or assetB should not be the zero address!',
        );
    });  
    
    it('reverts when _assetB is zero address', async function () {
        await expectRevert(
            Exchange.new("ExchangePool", "EXP", this.erc20A.address, constants.ZERO_ADDRESS, 1, 1, { from: sender }),
            'assetA or assetB should not be the zero address!',
        );
    });

    it('successful creation', async function() {
        let _a = new BN(10).pow(new BN(18));
        let _b = new BN(10).pow(new BN(17));
        let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, _a, _b, { from: sender })
        
        expect(await deployed.owner()).to.equal(sender);
        expect(await deployed.assetA()).to.equal(this.erc20A.address);
        expect(await deployed.assetB()).to.equal(this.erc20B.address);
    })
  });

  describe('Liquidity Provider', async function() {

    beforeEach(async function() {
        this.erc20A = await TestERC20.new("TokenA", "TKA", { from: sender });
        this.erc20B = await TestERC20.new("TokenB", "TKB", { from: sender });
        this._a = new BN(10).pow(new BN(18));
        this._b = new BN(10).pow(new BN(17)); // r = 10


        await this.erc20A.mint(lprovider, this._a.mul(new BN(2)), { from: sender });
        await this.erc20B.mint(lprovider, this._b.mul(new BN(2)), { from: sender });
        await this.erc20A.mint(lprovider_2, this._a.mul(new BN(2)), { from: sender });
        await this.erc20B.mint(lprovider_2, this._b.mul(new BN(2)), { from: sender });
    });

    describe("MintLiquidity tests", async function () {
        it('revert if amountA equals 0', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await expectRevert(deployed.mintLiquidity(0, {from: lprovider}), "amountA should be greater than 0");
        });

        it('revert if allowance on token A is less than amountA', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await expectRevert(deployed.mintLiquidity(this._a, {from: lprovider}), "Insufficient allowance on assetA");
        });

        it('revert if allowance on token B is less than amountB', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await expectRevert(deployed.mintLiquidity(this._a, {from: lprovider}), "Insufficient allowance on assetB");
        })

        it('revert if insufficient deposit', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await expectRevert(deployed.mintLiquidity(1, {from: lprovider}), "Insufficient deposit of assetA (amountB = 0)");
        })

        it('exact amounts are sent', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider_2});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider_2});

            await deployed.mintLiquidity(this._a, {from: lprovider})
            await deployed.mintLiquidity(this._a.mul(new BN(2)), {from: lprovider_2});

            expect(await this.erc20A.balanceOf(deployed.address)).to.be.bignumber.equal(this._a.mul(new BN(3)));
            expect(await this.erc20B.balanceOf(deployed.address)).to.be.bignumber.equal(this._b.mul(new BN(3)));
            expect(await this.erc20A.balanceOf(lprovider)).to.be.bignumber.equal(this._a);
            expect(await this.erc20B.balanceOf(lprovider)).to.be.bignumber.equal(this._b);
            expect(await this.erc20A.balanceOf(lprovider_2)).to.be.bignumber.equal(new BN(0));
            expect(await this.erc20B.balanceOf(lprovider_2)).to.be.bignumber.equal(new BN(0));
        });

        it('First minter gets amountA liquidity tokens', async function () {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            
            await deployed.mintLiquidity(this._a, {from: lprovider})
            
            expect(await deployed.balanceOf(lprovider)).to.be.bignumber.equal(this._a)
        });
    
        it('Later minters gets amountA * (liquidity / reserveA)', async function () {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider_2});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider_2});

            await deployed.mintLiquidity(this._a, {from: lprovider});
            await deployed.mintLiquidity(this._a.mul(new BN(2)), {from: lprovider_2});
            
            let reserveA = await this.erc20A.balanceOf(deployed.address);
            let liquidity = await deployed.totalSupply();
            let expected = (this._a.mul(new BN(2))).mul(liquidity).div(reserveA);


            expect(await deployed.balanceOf(lprovider)).to.be.bignumber.equal(this._a);
            expect(await deployed.balanceOf(lprovider_2)).to.be.bignumber.equal(expected);
        });

        it('event MintedLiquidity', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            
            const receipt = await deployed.mintLiquidity(this._a, {from: lprovider})
            
            expectEvent(receipt, 'LiquidityMinted', {
                by: lprovider,
                amount: this._a,
                _a: this._a,
                _b: this._b
            });
        });
    });

    describe("BurnLiquidity tests", async function () {
        beforeEach(async function() {
            this.erc20A = await TestERC20.new("TokenA", "TKA", { from: sender });
            this.erc20B = await TestERC20.new("TokenB", "TKB", { from: sender });
            this._a = new BN(10).pow(new BN(18));
            this._b = new BN(10).pow(new BN(17)); // r = 10
    
            await this.erc20A.mint(lprovider, this._a.mul(new BN(2)), { from: sender });
            await this.erc20B.mint(lprovider, this._b.mul(new BN(2)), { from: sender });
            await this.erc20A.mint(lprovider_2, this._a.mul(new BN(2)), { from: sender });
            await this.erc20B.mint(lprovider_2, this._b.mul(new BN(2)), { from: sender });
            await this.erc20A.mint(swapper, this._a.mul(new BN(2)), { from: sender });
            await this.erc20B.mint(swapper, this._b.mul(new BN(2)), { from: sender });
        });    

        it('revert if amount equals 0', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await expectRevert(deployed.burnLiquidity(0, {from: lprovider}), "amount should not be zero");
        });

        it('revert if allowance for liquidity tokens is insufficient', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await expectRevert(deployed.burnLiquidity(1, {from: lprovider}), "Insufficient allowance of liquidity tokens");
        })
        
        it('exact amounts are sent back (with an A swap)', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider_2});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider_2});
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: swapper});
            await deployed.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await deployed.approve(deployed.address, constants.MAX_UINT256, {from: lprovider_2});

            await deployed.mintLiquidity(this._a, {from: lprovider})
            await deployed.mintLiquidity(this._a.mul(new BN(2)), {from: lprovider_2});
            await deployed.swapAforB(this._a, {from: swapper});

            let initialBalanceA = await this.erc20A.balanceOf(lprovider);
            let initialBalanceB = await this.erc20B.balanceOf(lprovider);
            
            let totalLiquidity = await deployed.totalSupply();
            let liquidity = await deployed.balanceOf(lprovider);
            let reserveA = await this.erc20A.balanceOf(deployed.address);
            let reserveB = await this.erc20B.balanceOf(deployed.address);

            let expectedA = initialBalanceA.add(liquidity.mul(reserveA).div(totalLiquidity));
            let expectedB = initialBalanceB.add(liquidity.mul(reserveB).div(totalLiquidity));

            await deployed.burnLiquidity(liquidity, {from: lprovider});
            expect(await this.erc20A.balanceOf(lprovider)).to.be.bignumber.equal(expectedA);
            expect(await this.erc20B.balanceOf(lprovider)).to.be.bignumber.equal(expectedB);

            let initialBalanceA2 = await this.erc20A.balanceOf(lprovider_2);
            let initialBalanceB2 = await this.erc20B.balanceOf(lprovider_2);

            totalLiquidity = await deployed.totalSupply();
            let liquidity2 = await deployed.balanceOf(lprovider_2);
            reserveA = await this.erc20A.balanceOf(deployed.address);
            reserveB = await this.erc20B.balanceOf(deployed.address);

            let expectedA1 = initialBalanceA2.add(liquidity2.mul(reserveA).div(totalLiquidity));
            let expectedB1 = initialBalanceB2.add(liquidity2.mul(reserveB).div(totalLiquidity));

            await deployed.burnLiquidity(liquidity2, {from: lprovider_2});
            expect(await this.erc20A.balanceOf(lprovider_2)).to.be.bignumber.equal(expectedA1);
            expect(await this.erc20B.balanceOf(lprovider_2)).to.be.bignumber.equal(expectedB1);
        }); 

        it('exact amounts are sent back (with a B swap)', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider_2});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider_2});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: swapper});
            await deployed.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await deployed.approve(deployed.address, constants.MAX_UINT256, {from: lprovider_2});

            await deployed.mintLiquidity(this._a, {from: lprovider})
            await deployed.mintLiquidity(this._a.mul(new BN(2)), {from: lprovider_2});
            await deployed.swapBforA(this._b, {from: swapper});

            let initialBalanceA = await this.erc20A.balanceOf(lprovider);
            let initialBalanceB = await this.erc20B.balanceOf(lprovider);

            let totalLiquidity = await deployed.totalSupply();
            let liquidity = await deployed.balanceOf(lprovider);
            let reserveA = await this.erc20A.balanceOf(deployed.address);
            let reserveB = await this.erc20B.balanceOf(deployed.address);

            let expectedA = initialBalanceA.add(liquidity.mul(reserveA).div(totalLiquidity));
            let expectedB = initialBalanceB.add(liquidity.mul(reserveB).div(totalLiquidity));

            await deployed.burnLiquidity(liquidity, {from: lprovider});
            expect(await this.erc20A.balanceOf(lprovider)).to.be.bignumber.equal(expectedA);
            expect(await this.erc20B.balanceOf(lprovider)).to.be.bignumber.equal(expectedB);

            let initialBalanceA2 = await this.erc20A.balanceOf(lprovider_2);
            let initialBalanceB2 = await this.erc20B.balanceOf(lprovider_2);

            totalLiquidity = await deployed.totalSupply();
            let liquidity2 = await deployed.balanceOf(lprovider_2);
            reserveA = await this.erc20A.balanceOf(deployed.address);
            reserveB = await this.erc20B.balanceOf(deployed.address);

            let expectedA1 = initialBalanceA2.add(liquidity2.mul(reserveA).div(totalLiquidity));
            let expectedB1 = initialBalanceA2.add(liquidity2.mul(reserveB).div(totalLiquidity));

            await deployed.burnLiquidity(liquidity2, {from: lprovider_2});
            expect(await this.erc20A.balanceOf(lprovider_2)).to.be.bignumber.equal(expectedA1);
            expect(await this.erc20B.balanceOf(lprovider_2)).to.be.bignumber.equal(expectedB1);
        });

        it('Liquidity provider receives back value = (2 * amountA) [initial investement] when burns liquidity', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: swapper});
            await deployed.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});

            await deployed.mintLiquidity(this._a, {from: lprovider})
            await deployed.swapAforB(this._a, {from: swapper});

            let current = await this.erc20A.balanceOf(lprovider);
            let expected = await current.add(this._a.mul(new BN(2)));

            let liquidity = await deployed.balanceOf(lprovider);
            await deployed.burnLiquidity(liquidity, {from: lprovider});
            expect(await this.erc20A.balanceOf(lprovider)).to.be.bignumber.equal(expected);
        });

        it('event BurnedLiquidity', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await deployed.approve(deployed.address, constants.MAX_UINT256, {from: lprovider})

            await deployed.mintLiquidity(this._a, {from: lprovider})
            
            let liquidity = await deployed.balanceOf(lprovider);
            const receipt = await deployed.burnLiquidity(liquidity, {from: lprovider});

            expectEvent(receipt, 'LiquidityBurned', {
                by: lprovider,
                amount: liquidity,
                _a: this._a,
                _b: this._b
            });
        });
    });

    describe('Swaps and swappers tests', async function() {
    
        beforeEach(async function() {
            this.erc20A = await TestERC20.new("TokenA", "TKA", { from: sender });
            this.erc20B = await TestERC20.new("TokenB", "TKB", { from: sender });
            this._a = new BN(10).pow(new BN(18));
            this._b = new BN(10).pow(new BN(17)); // r = 10
    
            await this.erc20A.mint(lprovider, this._a.mul(new BN(2)), { from: sender });
            await this.erc20B.mint(lprovider, this._b.mul(new BN(2)), { from: sender });
            await this.erc20A.mint(lprovider_2, this._a.mul(new BN(2)), { from: sender });
            await this.erc20B.mint(lprovider_2, this._b.mul(new BN(2)), { from: sender });
            await this.erc20A.mint(swapper, this._a, { from: sender });
            await this.erc20B.mint(swapper, this._b, { from: sender });
        });    
        
        it('reverts if amount = 0', async function () {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            
            await expectRevert(
                deployed.swapAforB(new BN(0), {from: swapper}),
                'Amount to swap should be greater than 0'
            );
            
            await expectRevert(
                deployed.swapBforA(new BN(0), {from: swapper}),
                'Amount to swap should be greater than 0'
            );
        });
    
        it('reverts if allowance is not sufficient', async function () {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            
            await expectRevert(
                deployed.swapAforB(new BN(1), {from: swapper}),
                'Insufficient allowance for the chosen asset'
            );
            
            await expectRevert(
                deployed.swapBforA(new BN(1), {from: swapper}),
                'Insufficient allowance for the chosen asset'
            );
        });
    
        it('reverts if liquidity is not sufficient', async function () {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: swapper});
            await deployed.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});

            await deployed.mintLiquidity(this._a, {from: lprovider})

            await expectRevert(
                deployed.swapAforB(this._a.mul(new BN(2)), {from: swapper}),
                'Insufficient liquidity for the chosen asset'
            );
        });

        it('pools palances in the right amounts (for A and B)', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: swapper});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: swapper});
            await deployed.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});

            await deployed.mintLiquidity(this._a, {from: lprovider})
            await deployed.swapAforB(this._a, {from: swapper});
            
            let expectedA = this._a.mul(new BN(2));
            let expectedB = new BN(0);
            expect(await this.erc20A.balanceOf(deployed.address)).to.be.bignumber.equal(expectedA);
            expect(await this.erc20B.balanceOf(deployed.address)).to.be.bignumber.equal(expectedB);

            await deployed.swapBforA(this._b.mul(new BN(2)), {from: swapper});

            expectedA = new BN(0);
            expectedB = this._b.mul(new BN(2));
            expect(await this.erc20A.balanceOf(deployed.address)).to.be.bignumber.equal(expectedA);
            expect(await this.erc20B.balanceOf(deployed.address)).to.be.bignumber.equal(expectedB);
        });

        it('swapper sends and receives the right amount (for A and B)', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: swapper});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: swapper});
            await deployed.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});

            await deployed.mintLiquidity(this._a, {from: lprovider})
            await deployed.swapAforB(this._a, {from: swapper});
            
            let expectedA = new BN(0);
            let expectedB = this._b.mul(new BN(2));
            expect(await this.erc20A.balanceOf(swapper)).to.be.bignumber.equal(expectedA);
            expect(await this.erc20B.balanceOf(swapper)).to.be.bignumber.equal(expectedB);

            await deployed.swapBforA(this._b.mul(new BN(2)), {from: swapper});

            expectedA = this._a.mul(new BN(2));
            expectedB = new BN(0);
            expect(await this.erc20A.balanceOf(swapper)).to.be.bignumber.equal(expectedA);
            expect(await this.erc20B.balanceOf(swapper)).to.be.bignumber.equal(expectedB);
        });

        it('event Swap', async function() {
            let deployed = await Exchange.new("ExchangePool", "EXP", this.erc20A.address, this.erc20B.address, this._a, this._b, { from: sender })
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20B.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});
            await this.erc20A.approve(deployed.address, constants.MAX_UINT256, {from: swapper});
            await deployed.approve(deployed.address, constants.MAX_UINT256, {from: lprovider});

            await deployed.mintLiquidity(this._a, {from: lprovider})

            const receipt = await deployed.swapAforB(this._a, {from: swapper});

            expectEvent(receipt, 'Swap', {
                who: swapper,
                _assetA: this.erc20A.address,
                _assetB: this.erc20B.address,
                _a: this._a,
                _b: this._b
            });
        });
      });    
  })
});

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "../lib/forge-std/src/interfaces/IERC20.sol";

/// @notice Mini Uniswap V2-style pair, swap-only, no LP tokens, no mint/burn.
contract MiniPair {
    address public immutable token0;
    address public immutable token1;

    uint112 private reserve0; // uses single storage slot with reserve1 in real Uni;
    uint112 private reserve1;

    uint32 private blockTimestampLast;

    bool private locked;

    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );

    event Sync(uint112 reserve0, uint112 reserve1);

    constructor(address _token0, address _token1) {
        require(_token0 != _token1, "IDENTICAL_ADDRESSES");
        require(_token0 != address(0) && _token1 != address(0), "ZERO_ADDRESS");

        // canonical ordering: token0 < token1
        if (_token0 < _token1) {
            token0 = _token0;
            token1 = _token1;
        } else {
            token0 = _token1;
            token1 = _token0;
        }
    }

    modifier nonReentrant() {
        require(!locked, "LOCKED");
        locked = true;
        _;
        locked = false;
    }

    function getReserves()
        public
        view
        returns (uint112 _reserve0, uint112 _reserve1)
    {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }

    /// @notice Internal helper to transfer tokens safely.
    function _safeTransfer(address token, address to, uint amount) private {
        bool success = IERC20(token).transfer(to, amount);
        require(success, "TRANSFER_FAILED");
    }

    /// @notice Update stored reserves to match actual balances.
    function _update(uint balance0, uint balance1) private {
        require(
            balance0 <= type(uint112).max && balance1 <= type(uint112).max,
            "OVERFLOW"
        );
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        // blockTimestampLast = uint32(block.timestamp); // ileride TWAP vb. istersen burayı kullanabilirsin
        emit Sync(reserve0, reserve1);
    }

    /// @notice One-time helper to seed initial liquidity (only for this mini project).
    /// @dev Gerçek Uniswap'ta LP mint/burn ile yapılır; biz minimal setup için shortcut koyuyoruz.
    function sync() external {
        // dışarıdan token transfer edilmişse, bunu reserve'lere yansıt.
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));
        _update(balance0, balance1);
    }

    /// @notice Core swap function, Uniswap V2-style.
    /// @dev Gerçek mantığı bir sonraki adımda dolduracağız.
    ///      Kullanım: önce tokenIn'i bu kontrata transfer et, sonra swap(...) çağır.
    function swap(
        uint amount0Out,
        uint amount1Out,
        address to
    ) external nonReentrant {
        require(to != token0 && to != token1, "INVALID_TO"); // Uni V2'de de bu var

        (uint112 _reserve0, uint112 _reserve1) = getReserves();
        require(amount0Out > 0 || amount1Out > 0, "INSUFFICIENT_OUTPUT_AMOUNT");
        require(
            amount0Out < _reserve0 && amount1Out < _reserve1,
            "INSUFFICIENT_LIQUIDITY"
        );

        // Burada henüz hesap yapmıyoruz, iskelet:
        // - tokenOut'u gönder
        // - amountIn'i hesapla
        // - fee + invariant check
        // - _update()

        // 1) Tokenleri dışarı gönder
        if (amount0Out > 0) _safeTransfer(token0, to, amount0Out);
        if (amount1Out > 0) _safeTransfer(token1, to, amount1Out);

        // 2) Yeni bakiyeleri oku
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));

        // Burada amountIn hesaplayıp invariant check koyacağız
        // (gelecek adımda dolduracağız)

        _update(balance0, balance1);

        emit Swap(msg.sender, 0, 0, amount0Out, amount1Out, to);
    }
}

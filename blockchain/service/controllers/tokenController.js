const tokenService = require("../services/tokenService");
const { asyncHandler } = require("../middleware/errorHandler");

exports.getBalance = asyncHandler(async (req, res) => {
  const { address } = req.params;
  
  const result = await tokenService.getBalance(address);
  
  if (result.success) {
    res.json({
      success: true,
      balance: result.balance,
      address: result.address
    });
  } else {
    const statusCode = result.type === 'validation' ? 400 : 500;
    res.status(statusCode).json({ 
      success: false, 
      error: result.error,
      type: result.type 
    });
  }
});

exports.mint = asyncHandler(async (req, res) => {
  const { to, amount } = req.body;
  
  const result = await tokenService.mint(to, amount);
  
  if (result.success) {
    res.json({
      success: true,
      txHash: result.txHash,
      receipt: result.receipt,
      mintData: result.mintData
    });
  } else {
    const statusCode = result.type === 'validation' ? 400 : 500;
    res.status(statusCode).json({ 
      success: false, 
      error: result.error,
      type: result.type 
    });
  }
});

exports.burn = asyncHandler(async (req, res) => {
  const { from, amount } = req.body;
  
  const result = await tokenService.burn(from, amount);
  
  if (result.success) {
    res.json({
      success: true,
      txHash: result.txHash,
      receipt: result.receipt,
      burnData: result.burnData
    });
  } else {
    const statusCode = result.type === 'validation' ? 400 : 500;
    res.status(statusCode).json({ 
      success: false, 
      error: result.error,
      type: result.type 
    });
  }
});

exports.getTotalSupply = asyncHandler(async (req, res) => {
  const result = await tokenService.getTotalSupply();
  
  if (result.success) {
    res.json({
      success: true,
      totalSupply: result.totalSupply
    });
  } else {
    res.status(500).json({ 
      success: false, 
      error: result.error,
      type: result.type 
    });
  }
});

exports.getTokenInfo = asyncHandler(async (req, res) => {
  const result = await tokenService.getTokenInfo();
  
  if (result.success) {
    res.json({
      success: true,
      tokenInfo: result.tokenInfo
    });
  } else {
    res.status(500).json({ 
      success: false, 
      error: result.error,
      type: result.type 
    });
  }
});

const tokenService = require("../services/tokenService");

exports.getBalance = async (req, res) => {
  try {
    const address = req.params.address;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }
    const result = await tokenService.getBalance(address);
    if (result.success) {
      res.json({ success: true, balance: result.balance });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.mint = async (req, res) => {
  try {
    const { to, amount } = req.body;
    if (!to || !amount) {
      return res.status(400).json({ error: "Missing to or amount" });
    }
    const result = await tokenService.mint(to, amount);
    if (result.success) {
      res.json({
        success: true,
        txHash: result.txHash,
        receipt: result.receipt,
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.burn = async (req, res) => {
  try {
    const { from, amount } = req.body;
    if (!from || !amount) {
      return res.status(400).json({ error: "Missing from or amount" });
    }
    // burn sẽ dùng private key của from (cần cấu hình đúng)
    const result = await tokenService.burn(from, amount);
    if (result.success) {
      res.json({
        success: true,
        txHash: result.txHash,
        receipt: result.receipt,
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const { tokenContract } = require("../services/contractService");

module.exports = {
  // Lấy balance của địa chỉ
  getBalance: async (req, res) => {
    try {
      const { address } = req.params;
      if (!address) return res.status(400).json({ error: "Missing address" });
      const balance = await tokenContract.balanceOf(address);
      res.json({ address, balance: balance.toString() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Mint token (chỉ owner)
  mintTokens: async (req, res) => {
    try {
      const { to, amount } = req.body;
      if (!to || !amount)
        return res.status(400).json({ error: "Missing to or amount" });
      const tx = await tokenContract.mint(to, amount);
      await tx.wait();
      res.json({ success: true, txHash: tx.hash });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Burn token (người dùng tự burn)
  burnTokens: async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount) return res.status(400).json({ error: "Missing amount" });
      const tx = await tokenContract.burn(amount);
      await tx.wait();
      res.json({ success: true, txHash: tx.hash });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy tổng cung
  getTotalSupply: async (req, res) => {
    try {
      const totalSupply = await tokenContract.totalSupply();
      res.json({ totalSupply: totalSupply.toString() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy info token
  getTokenInfo: async (req, res) => {
    try {
      const [name, symbol, decimals] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
      ]);
      res.json({ name, symbol, decimals });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Các hàm dưới đây chưa triển khai
  transferTokens: (req, res) => {
    res.status(501).json({ error: "Not implemented" });
  },
  approveTokens: (req, res) => {
    res.status(501).json({ error: "Not implemented" });
  },
  transferFrom: (req, res) => {
    res.status(501).json({ error: "Not implemented" });
  },
  getAllowance: (req, res) => {
    res.status(501).json({ error: "Not implemented" });
  },
};

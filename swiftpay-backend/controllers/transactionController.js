const { User, Wallet, Transaction, sequelize } = require('../models');

exports.transferMoney = async (req, res) => {
  const { senderEmail, receiverEmail, amount, forceError } = req.body;

  // Input validation
  const parsedAmount = parseFloat(amount);
  if (!senderEmail || !receiverEmail || !parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: "Invalid transfer details" });
  }

  if (senderEmail === receiverEmail) {
    return res.status(400).json({ error: "Sender and receiver cannot be the same" });
  }

  // Start the transaction
  const t = await sequelize.transaction();

  try {
    const sender = await User.findOne({ where: { email: senderEmail }, transaction: t });
    const receiver = await User.findOne({ where: { email: receiverEmail }, transaction: t });

    if (!sender) {
      throw new Error(`Sender not found: ${senderEmail}`);
    }
    if (!receiver) {
      throw new Error(`Receiver not found: ${receiverEmail}`);
    }

    const senderWallet = await Wallet.findOne({ where: { userId: sender.id }, transaction: t });
    const receiverWallet = await Wallet.findOne({ where: { userId: receiver.id }, transaction: t });

    if (!senderWallet) {
      throw new Error("Sender wallet not found");
    }
    if (!receiverWallet) {
      throw new Error("Receiver wallet not found");
    }

    if (parseFloat(senderWallet.balance) < parsedAmount) {
      throw new Error("Insufficient balance");
    }

    // 1. Deduct from Sender
    await senderWallet.update(
      { balance: parseFloat(senderWallet.balance) - parsedAmount },
      { transaction: t }
    );

    // This checks the user's specific learning point: simulated error after deduction
    if (forceError) {
      throw new Error("Simulated Error for Transaction Rollback!");
    }

    // 2. Add to Receiver
    await receiverWallet.update(
      { balance: parseFloat(receiverWallet.balance) + parsedAmount },
      { transaction: t }
    );

    // 3. Create Transaction Record
    await Transaction.create({
      senderId: sender.id,
      receiverId: receiver.id,
      amount: parsedAmount,
      type: 'TRANSFER'
    }, { transaction: t });

    // Commit transaction if all steps succeeded
    await t.commit();

    return res.status(200).json({ 
      message: "Transfer successful",
      data: { senderEmail, receiverEmail, amount: parsedAmount }
    });

  } catch (error) {
    // Rollback transaction if any step failed
    await t.rollback();
    console.error("Transaction Error:", error.message);
    return res.status(500).json({ 
      error: "Transaction failed and was rolled back.",
      details: error.message
    });
  }
};
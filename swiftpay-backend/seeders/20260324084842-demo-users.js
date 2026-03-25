'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1️⃣ Insert Users
    await queryInterface.bulkInsert('Users', [
      { name: 'Alice', email: 'alice@example.com', password: '1234', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bob', email: 'bob@example.com', password: '1234', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Charlie', email: 'charlie@example.com', password: '1234', createdAt: new Date(), updatedAt: new Date() },
    ], {});

    // 2️⃣ Get user ids
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "Users";`
    );
    const userRows = users[0];

    // 3️⃣ Insert Wallets
    await queryInterface.bulkInsert('Wallets', [
      { userId: userRows[0].id, balance: 100, createdAt: new Date(), updatedAt: new Date() }, // Alice
      { userId: userRows[1].id, balance: 50, createdAt: new Date(), updatedAt: new Date() },  // Bob
      { userId: userRows[2].id, balance: 0, createdAt: new Date(), updatedAt: new Date() },   // Charlie
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Wallets', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
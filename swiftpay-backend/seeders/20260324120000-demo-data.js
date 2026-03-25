'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    // Insert Users
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Alice Sender',
        email: 'alice@test.com',
        password: defaultPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bob Receiver',
        email: 'bob@test.com',
        password: defaultPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Fetch the users to get their IDs
    const users = await queryInterface.sequelize.query(
      `SELECT id, email from "Users";`
    );

    const userRows = users[0];
    const alice = userRows.find(u => u.email === 'alice@test.com');
    const bob = userRows.find(u => u.email === 'bob@test.com');

    // Insert Wallets
    if (alice && bob) {
      await queryInterface.bulkInsert('Wallets', [
        {
          userId: alice.id,
          balance: 1000.00,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          userId: bob.id,
          balance: 500.00,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Wallets', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};

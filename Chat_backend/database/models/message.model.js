"use strict";

module.exports = (sequelize, Sequelize) => {
  const Message = sequelize.define("message", {
    message_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sender_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    receiver_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    content: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });

  // associations with a User model
  Message.associate = (models) => {
    Message.belongsTo(models.user, {
      foreignKey: "sender_id", // Reference to the sender
      as: "sender", // Alias for the sender
    });

    Message.belongsTo(models.user, {
      foreignKey: "receiver_id", // Reference to the receiver
      as: "receiver", // Alias for the receiver
    });
  };

  return Message;
};

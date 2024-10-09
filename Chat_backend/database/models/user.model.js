"use strict";

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_name: DataTypes.STRING,
      user_password: DataTypes.STRING,
    },
    {
      tableName: "users",
      scopes: {},
      getterMethods: {},
    }
  );

  // Define associations with messages
  user.associate = (models) => {
    user.hasMany(models.message, {
      foreignKey: "sender_id", // This user sends messages
      as: "sentMessages", // Alias for sent messages
    });

    user.hasMany(models.message, {
      foreignKey: "receiver_id", // This user receives messages
      as: "receivedMessages", // Alias for received messages
    });
  };

  return user;
};

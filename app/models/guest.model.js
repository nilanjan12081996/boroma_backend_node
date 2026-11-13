const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Define Guest Model
const Guest = sequelize.define(
  "Guest",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    guest_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },

    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    otp_exp: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1 = active, 0 = inactive
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "guest",
    timestamps: false,
  }
);

module.exports = Guest;


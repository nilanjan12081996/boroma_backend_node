const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Define the Driver model
const Driver = sequelize.define(
  "Driver",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    driver_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    driver_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    driver_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    profile_img: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    otp: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    otp_exp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0, // 0 = inactive/pending, 1 = active
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
    tableName: "driver",
    timestamps: false,
  }
);

module.exports = Driver;


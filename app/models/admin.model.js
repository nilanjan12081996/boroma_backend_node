const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    full_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    role_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    otp_expire: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    o_auth: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    oauth_provider: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    status_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    otp_verified: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },

    is_verified: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
  },
  {
    tableName: "admins",
    timestamps: false,
  }
);

module.exports = Admin;
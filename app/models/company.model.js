const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    tableName: "companies",
    timestamps: false,
  }
);

module.exports = Company;

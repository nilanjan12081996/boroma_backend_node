const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    category_name: {
      type: DataTypes.STRING,
    },
    short_name: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.TINYINT,
    },
  },
  {
    tableName: "category",
    timestamps: false,
  },
);

module.exports = Category;

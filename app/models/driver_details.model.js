const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Driver = require("./driver.model");

// Define the DriverDetails model
const DriverDetails = sequelize.define(
  "DriverDetails",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Driver,
        key: "id",
      },
    },
    doc_type: {
      type: DataTypes.ENUM("L", "A"), // "L" -> Licence, "A" -> Aadhar Card
      allowNull: false,
    },
    doc_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    exp_date: {
      type: DataTypes.DATEONLY,
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
    tableName: "driver_details",
    timestamps: false,
  }
);

// Associations
DriverDetails.belongsTo(Driver, { foreignKey: "driver_id", as: "driver" });
Driver.hasMany(DriverDetails, { foreignKey: "driver_id", as: "driverDetails" });

module.exports = DriverDetails;


const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const VehicleInfo = require("./vehicle_info.model");

// Define the VehiclePermit model
const VehiclePermit = sequelize.define(
  "VehiclePermit",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vehical_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    document_url: {
      type: DataTypes.STRING,
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
    tableName: "vehical_permit",
    timestamps: false,
  }
);

// Associations
VehiclePermit.belongsTo(VehicleInfo, { foreignKey: "vehical_id", as: "vehicle" });
VehicleInfo.hasMany(VehiclePermit, { foreignKey: "vehical_id", as: "permits" });

module.exports = VehiclePermit;

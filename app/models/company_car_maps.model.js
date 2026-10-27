const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Company = require("./company.model");
const VehicleInfo = require("./vehicle_info.model");

// Define the CompanyCarMap model
const CompanyCarMap = sequelize.define(
  "CompanyCarMap",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    vehicle_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1 = active, 0 = inactive
    },
  },
  {
    tableName: "company_car_maps",
    timestamps: false,
  }
);

// Associations
CompanyCarMap.belongsTo(Company, { foreignKey: "company_id", as: "company" });
CompanyCarMap.belongsTo(VehicleInfo, { foreignKey: "vehicle_id", as: "vehicle" });
Company.hasMany(CompanyCarMap, { foreignKey: "company_id", as: "vehicleMappings" });
VehicleInfo.hasMany(CompanyCarMap, { foreignKey: "vehicle_id", as: "companyMappings" });

module.exports = CompanyCarMap;
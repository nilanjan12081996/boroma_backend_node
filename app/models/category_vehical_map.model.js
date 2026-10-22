const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Category = require("./category.model");
const VehicleInfo = require("./vehicle_info.model");
const VehicleImage = require("./vehicle_image.model");

const CategoryVehicalMap = sequelize.define(
  "CategoryVehicalMap",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    vehicle_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    tableName: "category_vehicle_map",
    timestamps: false,
  }
);

// Associations
CategoryVehicalMap.belongsTo(Category, { foreignKey: "category_id", as: "category" });
CategoryVehicalMap.belongsTo(VehicleInfo, { foreignKey: "vehicle_id", as: "vehicle" });

Category.hasMany(CategoryVehicalMap, { foreignKey: "category_id", as: "vehicle_mappings" });
VehicleInfo.hasMany(CategoryVehicalMap, { foreignKey: "vehicle_id", as: "category_mappings" });

// Many-to-Many: VehicleInfo <-> Category
VehicleInfo.belongsToMany(Category, {
  through: CategoryVehicalMap,
  foreignKey: "vehicle_id",
  otherKey: "category_id",
  as: "categories",
});
Category.belongsToMany(VehicleInfo, {
  through: CategoryVehicalMap,
  foreignKey: "category_id",
  otherKey: "vehicle_id",
  as: "vehicles",
});

// One-to-Many: VehicleInfo <-> VehicleImage
VehicleInfo.hasMany(VehicleImage, {
  foreignKey: "vehicle_id",
  as: "images",
});
VehicleImage.belongsTo(VehicleInfo, {
  foreignKey: "vehicle_id",
  as: "vehicle",
});

module.exports = CategoryVehicalMap;

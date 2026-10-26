const validator = require('validator');

const Company = require("../../models/company.model");



exports.createCompany = async (req, res) => {
  try {
    const { company_name, company_email } = req.body

    if (!company_name || !company_email) {
      return res.status(400).json({
        success: false,
        message: 'company name and email is required'
      })
    }

    if (!validator.isEmail(company_email)) {
      return res.status(400).json({
        success: false,
        message: 'invalid email'
      })
    }

    if (company_name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'company name must be at least 3 characters long'
      })
    }

    const existingCompany = await Company.findOne({
      where: { company_email }
    })

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: 'company already exists'
      })
    }

    const company = await Company.create({
      company_name,
      company_email,

    })

    return res.status(201).json({
      success: true,
      message: 'company created successfully',
      data: company
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create company',
      error: error.message
    })
  }
}

exports.getAllCompany = async (req, res) => {
  try {
    const companies = await Company.findAll()

    return res.status(200).json({
      success: true,
      message: 'Companies fetched successfully',
      data: companies
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    })
  }
}

exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params
    const company = await Company.findByPk(id)

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      })
    }
    if (company.status === 0) {
      return res.status(400).json({
        success: false,
        message: 'company is not active'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Company fetched successfully',
      data: company
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch company',
      error: error.message
    })
  }
}

exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params
    const { company_name, company_email } = req.body

    const company = await Company.findByPk(id)

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      })
    }
    if (company.status === 0) {
      return res.status(400).json({
        success: false,
        message: 'company is not active'
      })
    }
    await company.update({
      company_name,
      company_email,
    })
    return res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: company
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: error.message
    })
  }
}

exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params
    const company = await Company.findByPk(id)

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      })
    }
    if (company.status === 0) {
      return res.status(400).json({
        success: false,
        message: 'company is not active'
      })
    }
    await company.destroy()
    return res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.message
    })
  }
}

exports.toggleCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params
    const company = await Company.findByPk(id)

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      })
    }
    const newStatus = company.status === 1 ? 0 : 1
    await company.update({
      status: newStatus,
    })
    return res.status(200).json({
      success: true,
      message: 'Company status updated successfully',
      data: {
        id: company.id,
        status: company.status,
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle company status',
      error: error.message
    })
  }
}
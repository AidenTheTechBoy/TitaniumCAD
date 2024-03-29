const niv = require('node-input-validator');
const { Validator } = require('node-input-validator');

// Error Handler
niv.bailable(false)
niv.extendMessages({
    required: 'The :attribute field must not be empty.',
    minLength: 'The :attribute field must be at least :arg0 characters!',
    maxLength: 'The :attribute field may not be more than :arg0 characters!',
    regex: 'You must use at least one number in your password!',
    alpha: 'The :attribute field can only contain non-numeric characters.'
}, 'en');

class Validators {

    //Password
    static async ValidatePassword(res, data) {
        return await ReturnValidation(res, data, {
            'password': ["required", "ascii", ["regex", ".*[0-9].*"], ["minLength", "7"], ["maxLength", "30"]],
        })
    }

    //Civilian
    static async ValidateCivilian(res, data) {
        return await ReturnValidation(res, data, {
            'first_name': ["required", "alpha", ["maxLength", "30"]],
            'last_name': ["required", "alphaDash", ["maxLength", "30"]],
            'middle_initial': ["alpha", ["maxLength", "1"]],
            'date_of_birth': ["required", ["dateFormat", "MM/DD/YYYY"]],
            'place_of_residence': ["ascii", ["maxLength", "50"]],
            'zip_code': ["ascii", ["maxLength", "10"]],
            'occupation': ["ascii", ["maxLength", "50"]],
            'height': ["ascii", ["maxLength", "10"]],
            'weight': ["alphaNumeric", ["maxLength", "10"]],
            'hair_color': ["alpha", ["maxLength", "15"]],
            'eye_color': ["alpha", ["maxLength", "15"]],
            'license_type': [["maxLength", "20"]],
            'license_expiration': [["maxLength", "20"]],
            'license_status': [["maxLength", "20"]]
        })
    }

    //Firearm
    static async ValidateVehicle(res, data) {
        return await ReturnValidation(res, data, {
            'plate': ["required", "alphaNumeric", ["maxLength", "10"]],
            'color': ["required", "alpha", ["maxLength", "20"]],
            'make': ["required", "alpha", ["maxLength", "30"]],
            'model': ["required", "ascii", ["maxLength", "30"]],
            'year': ["required", ["dateFormat", "YYYY"]],
            'registration': [
                "required",
                ["maxLength", "10"],
                ["in", "VALID", "EXPIRED", "STOLEN", "UNREGISTERED"]
            ],
            'insurance': [
                "required",
                ["maxLength", "10"],
                ["in", "VALID", "EXPIRED", "UNINSURED"]
            ],
        })
    }

    //Firearm
    static async ValidateFirearm(res, data) {
        return await ReturnValidation(res, data, {
            'name': ["required", ["maxLength", "30"]],
            'registration': ["required", ["maxLength", "20"], ["in", "VALID", "EXPIRED", "STOLEN", "UNREGISTERED"]]
        })
    }

}

async function ReturnValidation(res, data, validatorArray) {
    const validator = new Validator(data, validatorArray)

    let isValid = await validator.check()
    let errors = validator.errors

    if (!isValid) {
        if (errors) {
            const firstKey = Object.keys(errors)[0]
            res.status(400).send(errors[firstKey][0].message)
        } else {
            res.status(400).send('Input failed validation!')
        }
        return false
    }
    return true
}

module.exports = Validators
class SchemaValidator {
  /**
   *
   * @param {mongoose.Model} Model
   * @param {mongoose.Schema} payload
   * @returns {[String]}
   */
  validateAndGetErrors(Model, payload) {
    const errors = this.validate(Model, payload);

    return this.getErrors(errors);
  }

  validate(Model, payload) {
    const { errors } = new Model(payload).validateSync();

    return errors;
  }

  getErrors(errors) {
    return Object.keys(errors).map((error) => errors[error].message);
  }
}

module.exports = new SchemaValidator();

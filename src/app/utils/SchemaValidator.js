class SchemaValidator {
  /**
   *
   * @param {mongoose.Model} Model
   * @param {mongoose.Schema} payload
   * @returns {[String]}
   */
  validateAndGetErrors(Model, payload) {
    const error = this.validate(Model, payload);

    return error?.errors ? this.getErrors(error.errors) : [];
  }

  validate(Model, payload) {
    const error = new Model(payload).validateSync();

    return error;
  }

  getErrors(errors) {
    return Object.keys(errors).map(
      (error) => errors[error].properties?.message || errors,
    );
  }
}

module.exports = new SchemaValidator();

export function setupSchema() {
  return {
    title: String,
    text_en: String,
    text_ru: String,
    time: String
  };
}

export function setupModel(modelName, model) {
  model.index({ text_en: 'text' }, { default_language: 'english' });
  model.index({ text_ru: 'text' }, { default_language: 'russian' });

  model.static.findByText = function (text) {
    return this
      .model(modelName)
      .find({ $text: { $search: text } })
      .exec();
  };
}

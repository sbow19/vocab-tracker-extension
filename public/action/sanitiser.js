export class Sanitiser {
  constructor() {}

  //Add logic here to check initial values like length, and whether there are unpermitted characters. Returns boolean
  static checkTranslationInput(inputString) {
    let cleanInputString = inputString.trim();

    if (cleanInputString.length <= 50) {
      return true;
    } else if (cleanInputString.length > 50) {
      return false;
    }
  }
}

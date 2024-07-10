const { extname } = require("path");
const { promisify } = require("util");

const uploadFile = async (file, object, property = "photo") => {
  if (file) {
    const move = promisify(file.mv);
    if (file.mimetype.startsWith("image/")) {
      const fileName =
        object.name.replace(/ /g, "-") +
        new Date().getTime().toString(36) +
        extname(file.name);
      await move("uploads/" + fileName);
      object[property] = fileName;
    }
  }

  return object; // Return the updated object
};

module.exports = uploadFile;

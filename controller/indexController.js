exports.getLogInPage = async (req, res) => {
  res.render("logIn");
};

exports.getSignUpPage = async (req, res) => {
  res.render("signUp");
};

exports.getAccountSettingsPage = async (req, res) => {
  res.render("accountSettings");
};

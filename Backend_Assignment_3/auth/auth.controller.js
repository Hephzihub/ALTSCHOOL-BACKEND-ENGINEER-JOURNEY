import { registerService, loginService } from "./auth.service.js";

export const loginView = (req, res) => {
  return res.render("login", {
    error: ""
  });
};

export const registerView = (req, res) => {
  return res.render("register", {
    error: ""
  });
};

export const registerUser = async (req, res) => {
  const { username, password } = req.body;

  const response = await registerService({ username, password });

  if (response.code === 201) {
    req.session.token = response.data.token;
    req.session.userId = response.data.auth.id;
    req.session.username = response.data.auth.username;

    return res.redirect("/task");
  }

  return res.status(response.code).render("register", {
    error: response.message,
  });
};

export const loginUser = async (req, res) => {

  const { username, password } = req.body;

  const response = await loginService({ username, password });

  if (response.code === 200) {
    req.session.token = response.data.token;
    req.session.userId = response.data.user._id;
    req.session.username = response.data.user.username;

    return res.redirect("/task");
  }

  return res.status(response.code).render("login", {
    error: response.message,
  });
};

export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: "Could not log out" });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.redirect("/auth/login");
  });
};
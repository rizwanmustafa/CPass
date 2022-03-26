export const createUser = (req, res) => {
  const { email, username, password } = req.body;

  // Debug Statements TODO: Remove later
  console.log(`Email: ${email}`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);

  let users = {};

  if (users[username]) return res.json("Username is taken!");

  users[username] = { username, email, password };

  console.log(users);

  return res.json({ message: "Your data has been successfully processed" });
};
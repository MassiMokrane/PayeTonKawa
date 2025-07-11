// const User = require("../models/user.model");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// exports.register = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ msg: "Email déjà utilisé" });

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({ email, password: hashed, role });
//     res.status(201).json({ msg: "Utilisateur créé" });
//   } catch (err) {
//     res.status(500).json({ msg: "Erreur serveur" });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ msg: "Mot de passe incorrect" });

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );
//     res.json({ token, role: user.role });
//   } catch (err) {
//     res.status(500).json({ msg: "Erreur serveur" });
//   }
// };
const { User } = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ msg: "Email déjà utilisé" });

    // Hasher le mot de passe
    const hashed = await bcrypt.hash(password, 10);

    // Créer l'utilisateur avec nom et prenom
    const user = await User.create({
      nom,
      prenom,
      email,
      password: hashed,
      role: role || "client",
    });

    res.status(201).json({ msg: "Utilisateur créé" });
  } catch (err) {
    console.error("Erreur d'enregistrement:", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ⬅️  Ajout de id dans la réponse
    res.json({ token, role: user.role, id: user.id });
  } catch (err) {
    console.error("Erreur de connexion:", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
};
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // Ne pas renvoyer le mot de passe
    });
    res.json(users);
  } catch (err) {
    console.error("Erreur récupération utilisateurs:", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    res.json(user);
  } catch (err) {
    console.error("Erreur récupération utilisateur:", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    await user.destroy();

    res.json({ msg: "Utilisateur supprimé" });
  } catch (err) {
    console.error("Erreur suppression utilisateur:", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, role, password } = req.body;

    // Trouver l'utilisateur par son id
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    // Préparer les champs à mettre à jour
    const updateData = { nom, prenom, email, role };

    // Si un nouveau mot de passe est fourni, le hasher
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Mettre à jour l'utilisateur
    await user.update(updateData);

    res.json({ msg: "Utilisateur mis à jour" });
  } catch (err) {
    console.error("Erreur mise à jour utilisateur:", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
};

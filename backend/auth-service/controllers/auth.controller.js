const { User } = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { publishEvent } = require("../rabbitmq");
const client = require('prom-client');

const businessEventCounter = new client.Counter({
  name: 'business_events_total',
  help: 'Nombre total d’événements métier publiés',
  labelNames: ['event_type', 'service']
});

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
    // Publier l'événement user_registered
    publishEvent('user_registered', { userId: user.id, nom, prenom, email, role: user.role, date: new Date() });
    businessEventCounter.inc({ event_type: 'user_registered', service: 'auth-service' });
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
    // Publier l'événement user_authenticated
    publishEvent('user_authenticated', { userId: user.id, email: user.email, date: new Date() });
    businessEventCounter.inc({ event_type: 'user_authenticated', service: 'auth-service' });
    res.json({ token, role: user.role, id: user.id });
  } catch (err) {
    console.error("Erreur de connexion:", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
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
      attributes: { exclude: ["password"] }, // On exclut le mot de passe
    });

    if (!user) {
      return res.status(404).json({ msg: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (err) {
    console.error("Erreur récupération utilisateur par ID:", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
};


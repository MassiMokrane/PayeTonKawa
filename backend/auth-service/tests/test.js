// const mongoose = require("mongoose");

// mongoose
//   .connect("mongodb://127.0.0.1:27017/authdb")
//   .then(() => console.log("✅ Mongo connecté depuis l'extérieur"))
//   .catch((err) => console.error("❌ Erreur externe:", err));
const request = require("supertest");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authController = require("../controllers/auth.controller");

// Mock des modèles et dépendances
jest.mock("../models/user.model", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword"),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("fake-token"),
}));

const { User } = require("../models/user.model");

// Configuration de l'app Express pour les tests
const app = express();
app.use(express.json());
app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("devrait créer un nouvel utilisateur avec succès", async () => {
      // Mock de l'email non existant
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        role: "client",
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("msg", "Utilisateur créé");
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(User.create).toHaveBeenCalled();
    });

    it("devrait renvoyer une erreur si l'email existe déjà", async () => {
      // Mock de l'email existant
      User.findOne.mockResolvedValue({ id: 1, email: "test@example.com" });

      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("msg", "Email déjà utilisé");
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/login", () => {
    it("devrait connecter un utilisateur avec succès", async () => {
      // Mock de l'utilisateur trouvé et mot de passe valide
      User.findOne.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        role: "client",
      });
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("role", "client");
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword"
      );
      expect(jwt.sign).toHaveBeenCalled();
    });

    it("devrait renvoyer une erreur si l'utilisateur n'existe pas", async () => {
      // Mock d'utilisateur non trouvé
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "password123" });

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("msg", "Utilisateur non trouvé");
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("devrait renvoyer une erreur si le mot de passe est incorrect", async () => {
      // Mock de l'utilisateur trouvé mais mot de passe invalide
      User.findOne.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
      });
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("msg", "Mot de passe incorrect");
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});

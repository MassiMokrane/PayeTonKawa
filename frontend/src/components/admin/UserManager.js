// import React, { useState, useEffect } from "react";
// import { authAPI } from "../../services/api";

// const UserManager = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);
//   const [formData, setFormData] = useState({
//     nom: "",
//     prenom: "",
//     email: "",
//     password: "",
//     role: "client",
//   });

//   // Récupérer tous les utilisateurs
//   const fetchUsers = async () => {
//     try {
//       const response = await authAPI.get("/users");
//       setUsers(response.data);
//     } catch (error) {
//       console.error("Erreur récupération utilisateurs:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // Gérer les changements du formulaire
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Créer ou modifier un utilisateur
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingUser) {
//         await authAPI.put(`/users/${editingUser.id}`, formData);
//       } else {
//         await authAPI.post("/register", formData);
//       }

//       setShowForm(false);
//       setEditingUser(null);
//       setFormData({
//         nom: "",
//         prenom: "",
//         email: "",
//         password: "",
//         role: "client",
//       });
//       fetchUsers();
//     } catch (error) {
//       console.error("Erreur lors de la sauvegarde:", error);
//       alert("Erreur lors de la sauvegarde");
//     }
//   };

//   // Supprimer un utilisateur
//   const handleDelete = async (id) => {
//     if (
//       window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
//     ) {
//       try {
//         await authAPI.delete(`/users/${id}`);
//         fetchUsers();
//       } catch (error) {
//         console.error("Erreur suppression:", error);
//         alert("Erreur lors de la suppression");
//       }
//     }
//   };

//   // Modifier un utilisateur
//   const handleEdit = (user) => {
//     setEditingUser(user);
//     setFormData({
//       nom: user.nom,
//       prenom: user.prenom,
//       email: user.email,
//       password: "",
//       role: user.role,
//     });
//     setShowForm(true);
//   };

//   // Annuler l'édition
//   const handleCancel = () => {
//     setShowForm(false);
//     setEditingUser(null);
//     setFormData({
//       nom: "",
//       prenom: "",
//       email: "",
//       password: "",
//       role: "client",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">
//           👤 Gestion des Utilisateurs
//         </h1>
//         <button
//           onClick={() => setShowForm(true)}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           ➕ Ajouter un utilisateur
//         </button>
//       </div>

//       {/* Formulaire d'ajout/modification */}
//       {showForm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h2 className="text-xl font-bold mb-4">
//               {editingUser
//                 ? "Modifier l'utilisateur"
//                 : "Ajouter un utilisateur"}
//             </h2>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Nom
//                 </label>
//                 <input
//                   type="text"
//                   name="nom"
//                   value={formData.nom}
//                   onChange={handleInputChange}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Prénom
//                 </label>
//                 <input
//                   type="text"
//                   name="prenom"
//                   value={formData.prenom}
//                   onChange={handleInputChange}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Mot de passe {editingUser && "(laisser vide pour conserver)"}
//                 </label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required={!editingUser}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Rôle
//                 </label>
//                 <select
//                   name="role"
//                   value={formData.role}
//                   onChange={handleInputChange}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="client">Client</option>
//                   <option value="admin">Admin</option>
//                 </select>
//               </div>

//               <div className="flex justify-end space-x-2 pt-4">
//                 <button
//                   type="button"
//                   onClick={handleCancel}
//                   className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleSubmit}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                 >
//                   {editingUser ? "Modifier" : "Ajouter"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Liste des utilisateurs */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   ID
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Nom complet
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Email
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Rôle
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Date création
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {users.map((user) => (
//                 <tr key={user.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {user.id}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {user.nom} {user.prenom}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {user.email}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <span
//                       className={`px-2 py-1 text-xs font-medium rounded-full ${
//                         user.role === "admin"
//                           ? "bg-red-100 text-red-800"
//                           : "bg-green-100 text-green-800"
//                       }`}
//                     >
//                       {user.role}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {new Date(user.createdAt).toLocaleDateString("fr-FR")}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <button
//                       onClick={() => handleEdit(user)}
//                       className="text-blue-600 hover:text-blue-900 mr-4"
//                     >
//                       ✏️ Modifier
//                     </button>
//                     <button
//                       onClick={() => handleDelete(user.id)}
//                       className="text-red-600 hover:text-red-900"
//                     >
//                       🗑️ Supprimer
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {users.length === 0 && (
//           <div className="text-center py-8 text-gray-500">
//             Aucun utilisateur trouvé
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserManager;
import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/api";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "client",
    password: "",
  });

  // Récupérer tous les utilisateurs
  const fetchUsers = async () => {
    try {
      const response = await authAPI.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur récupération utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Créer un nouvel utilisateur
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await authAPI.post("/register", formData);
      alert("Utilisateur créé avec succès");
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        role: "client",
        password: "",
      });
      fetchUsers();
    } catch (error) {
      alert("Erreur lors de la création: " + error.response?.data?.msg);
    }
  };

  // Modifier un utilisateur
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await authAPI.put(`/users/${editingUser.id}`, formData);
      alert("Utilisateur modifié avec succès");
      setEditingUser(null);
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        role: "client",
        password: "",
      });
      fetchUsers();
    } catch (error) {
      alert("Erreur lors de la modification: " + error.response?.data?.msg);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        await authAPI.delete(`/users/${userId}`);
        alert("Utilisateur supprimé avec succès");
        fetchUsers();
      } catch (error) {
        alert("Erreur lors de la suppression: " + error.response?.data?.msg);
      }
    }
  };

  // Préparer l'édition
  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      password: "",
    });
  };

  // Annuler l'édition
  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      role: "client",
      password: "",
    });
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="user-manager">
      <h2>👤 Gestion des Utilisateurs</h2>

      {/* Formulaire d'ajout/modification */}
      <div className="form-section">
        <h3>
          {editingUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
        </h3>
        <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
          <div className="form-group">
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={formData.nom}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              value={formData.prenom}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder={
                editingUser
                  ? "Nouveau mot de passe (optionnel)"
                  : "Mot de passe"
              }
              value={formData.password}
              onChange={handleInputChange}
              required={!editingUser}
            />
          </div>
          <div className="form-buttons">
            <button type="submit">
              {editingUser ? "Modifier" : "Ajouter"}
            </button>
            {editingUser && (
              <button type="button" onClick={cancelEdit}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Liste des utilisateurs */}
      <div className="users-list">
        <h3>Liste des utilisateurs ({users.length})</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nom}</td>
                <td>{user.prenom}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </td>
                <td>
                  <button onClick={() => startEdit(user)}>✏️ Modifier</button>
                  <button onClick={() => handleDeleteUser(user.id)}>
                    🗑️ Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;

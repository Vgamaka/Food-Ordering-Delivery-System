// frontend/src/services/adminService.js
import { authAPI } from "./api";

export const fetchUsers = (roleFilter, searchTerm, page) => {
  return authAPI.get('/users', {
    params: { role: roleFilter, search: searchTerm, page },
  });
};

export const fetchCounts = async () => {
  const roles = ["customer", "restaurant", "delivery"];
  const counts = {};
  for (const role of roles) {
    const res = await authAPI.get('/users', { params: { role } });
    counts[role] = res.data.total;
  }
  return counts;
};

export const deleteUser = (userId) => {
  return authAPI.delete(`/user/${userId}`);
};

export const fetchPendingUsers = () => {
  return authAPI.get('/pending-users');
};

export const approveUser = (userId) => {
  return authAPI.patch(`/approve/${userId}`);
};

export const rejectUser = (userId) => {
  return authAPI.patch(`/reject/${userId}`);
};

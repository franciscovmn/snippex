import api from "./api";

export interface UpdateProfileDTO {
  name: string;
  user_name: string;
  email: string;
}

export interface User {
  id: number;
  name: string;
  user_name: string;
  email: string;
}

export const userService = {
    async updateProfile(data: UpdateProfileDTO) {
        const response = await api.put('/api/users/edit', data);
        return response.data;
    },

    async changePassword(password:String) {
        const response = await api.put('/api/users/changePassword', {
            password
        });
        return response.data;
    }
};
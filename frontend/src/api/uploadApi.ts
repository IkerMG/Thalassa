import api from './axiosConfig';

export type UploadFolder = 'livestock' | 'equipment' | 'wishlist' | 'avatars';

export interface UploadResponse {
  url: string;
}

export const uploadApi = {
  image: (file: File, folder: UploadFolder): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    // Pass FormData directly — axios removes the default Content-Type header
    // so the browser can set multipart/form-data with the correct boundary.
    return api.post<UploadResponse>('/upload', formData).then((r) => r.data);
  },
};

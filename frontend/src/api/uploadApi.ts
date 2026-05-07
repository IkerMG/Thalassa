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
    // Explicitly unset Content-Type so the browser sets multipart/form-data
    // with the correct boundary (the axiosConfig default is application/json
    // which would prevent Spring's MultipartResolver from parsing the body).
    return api
      .post<UploadResponse>('/upload', formData, {
        headers: { 'Content-Type': undefined },
      })
      .then((r) => r.data);
  },
};

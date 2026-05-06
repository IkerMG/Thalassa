import { useMutation } from '@tanstack/react-query';
import { uploadApi, type UploadFolder } from '../../api/uploadApi';
import { toast } from '../../lib/toast';

interface UploadImageArgs {
  file: File;
  folder: UploadFolder;
}

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, folder }: UploadImageArgs) => uploadApi.image(file, folder),
    onError: () => {
      toast.error('No se pudo subir la imagen. Inténtalo de nuevo.');
    },
  });
}

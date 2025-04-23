import { useQuery, useMutation } from "@tanstack/react-query";
import { Folder, InsertFolder } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function useFolders() {
  // Get all folders
  const {
    data: folders,
    isLoading,
    isError,
  } = useQuery<Folder[]>({
    queryKey: ["/api/folders"],
    enabled: true,
  });
  
  // Create a new folder
  const { mutateAsync: createFolderAsync } = useMutation({
    mutationFn: async (folder: InsertFolder) => {
      const res = await apiRequest("POST", "/api/folders", folder);
      return res.json() as Promise<Folder>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
    },
  });
  
  // Update a folder
  const { mutateAsync: updateFolderAsync } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertFolder> }) => {
      const res = await apiRequest("PUT", `/api/folders/${id}`, data);
      return res.json() as Promise<Folder>;
    },
    onSuccess: (updatedFolder) => {
      queryClient.setQueryData([`/api/folders/${updatedFolder.id}`], updatedFolder);
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
    },
  });
  
  // Delete a folder
  const { mutateAsync: deleteFolderAsync } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/folders/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: [`/api/folders/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });
  
  return {
    folders,
    isLoading,
    isError,
    createFolder: createFolderAsync,
    updateFolder: updateFolderAsync,
    deleteFolder: deleteFolderAsync,
  };
}

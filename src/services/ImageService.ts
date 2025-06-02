export interface UploadResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const uploadImagesToStrapi = async (
  files: File[],
): Promise<UploadResponse> => {

  try {
    const formData = new FormData();
    const config = {
      apiUrl: import.meta.env.VITE_STRAPI_URL || "http://localhost:1337/api",
      apiToken: localStorage.getItem('authToken')
    }
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    const response = await fetch(`${config.apiUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Strapi upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

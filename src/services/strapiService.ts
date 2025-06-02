
import { StrapiConfig } from '@/components/StrapiConfig';

export interface UploadResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const uploadImagesToStrapi = async (
  files: File[],
  config: StrapiConfig
): Promise<UploadResponse> => {
  if (!config.apiUrl || !config.apiToken) {
    return {
      success: false,
      error: 'Strapi configuration is incomplete'
    };
  }

  try {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    const response = await fetch(`${config.apiUrl}/api/upload`, {
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

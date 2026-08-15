import { Material } from '../types';
import { request, uploadFile } from './client';

export function normalizeMaterial(raw: any): Material {
  if (!raw) return {} as Material;
  return {
    id: raw.id,
    class_id: raw.class_id,
    title: raw.title,
    description: raw.description || '',
    type: raw.type || (raw.pdf_url ? 'pdf' : 'manual'),
    content_html: raw.content_html || '',
    file_url: raw.pdf_url || raw.file_url || '',
    pdf_url: raw.pdf_url || raw.file_url || '',
    pdf_status: raw.pdf_status || 'none',
    file_name: raw.title ? `${raw.title}.pdf` : 'modul.pdf',
    file_type: 'application/pdf',
    is_read: raw.is_read ?? false,
    created_by: raw.created_by || '',
    created_at: raw.created_at || new Date().toISOString(),
  };
}

export const materialService = {
  async getMaterials(classId: string, options?: RequestInit): Promise<Material[]> {
    const raw = await request<any[]>(`/classes/${classId}/materials`, options);
    return Array.isArray(raw) ? raw.map(normalizeMaterial) : [];
  },

  async getMaterialDetail(id: string, options?: RequestInit): Promise<Material> {
    const raw = await request<any>(`/materials/${id}`, options);
    return normalizeMaterial(raw);
  },

  async createMaterial(classId: string, data: { title: string; description?: string; file_url?: string; content_html?: string; type?: string }): Promise<Material> {
    const raw = await request<any>(`/classes/${classId}/materials`, {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        description: data.description || '',
        type: data.type || (data.file_url ? 'pdf' : 'manual'),
        content_html: data.content_html || '',
        pdf_url: data.file_url || '',
      }),
    });
    return normalizeMaterial(raw);
  },

  async deleteMaterial(id: string): Promise<void> {
    await request(`/materials/${id}`, { method: 'DELETE' });
  },

  uploadFile,
};
